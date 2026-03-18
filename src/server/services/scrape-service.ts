import type { Prisma } from "@prisma/client";
import { Browser, type Page, chromium } from "playwright-core";

import { env } from "@/lib/env";

type FtmoSnapshotPayload = {
  profitPercent: number;
  profitAbsolute?: number | null;
  dailyLossValue?: number | null;
  maxLossValue?: number | null;
  balance?: number | null;
  equity?: number | null;
  statusNotes?: string | null;
  rawPayload: Prisma.InputJsonValue;
};

type FetchFtmoOptions = {
  label?: string;
};

type FtmoMoney = {
  value: number;
  decimal: number;
  currency: string;
};

type FtmoMetrixResponse = {
  metrixData?: {
    info?: {
      initialBalance?: FtmoMoney | null;
      hasCurrentResults?: boolean;
      accountStageType?: string | null;
      accountStatus?: string | null;
    };
    statistics?: {
      balance?: FtmoMoney | null;
      equity?: FtmoMoney | null;
    };
    objectives?: {
      profit?: {
        result?: FtmoMoney | null;
        percentage?: {
          value?: number | null;
        } | null;
      } | null;
      maxDailyLoss?: {
        result?: FtmoMoney | null;
      } | null;
      maxLoss?: {
        result?: FtmoMoney | null;
      } | null;
    };
    timestamp?: string | null;
  };
};

type VisibleCards = {
  balance: number | null;
  equity: number | null;
  unrealizedPnl: number | null;
  accountSize: number | null;
};

let browserPromise: Promise<Browser> | null = null;

function timestamp() {
  return new Date().toISOString();
}

function logScrape(stage: string, details: Record<string, unknown> = {}) {
  console.log(`[FTMO][${timestamp()}][${stage}] ${JSON.stringify(details)}`);
}

function logScrapeError(stage: string, error: unknown, details: Record<string, unknown> = {}) {
  const payload =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...details,
        }
      : {
          error,
          ...details,
        };

  console.error(`[FTMO][${timestamp()}][${stage}] ${JSON.stringify(payload)}`);
}

function normalizeScrapeError(error: unknown) {
  if (!(error instanceof Error)) {
    return new Error("FTMO scraping failed.");
  }

  if (error.message.includes("Executable doesn't exist")) {
    return new Error("Chromium is not installed in this environment. Install it only on the worker host with `npx playwright-core install chromium`.");
  }

  if (error.message.includes("Target page, context or browser has been closed")) {
    return new Error("FTMO browser context closed before a public MetriX response was received.");
  }

  return error;
}

function isFtmoAuthRedirect(url: string) {
  return url.includes("sso.ftmo.com") || url.includes("/openid-connect/auth");
}

function createPrivateMetrixError(currentUrl: string) {
  return new Error(`FTMO public MetriX URL redirected to sign-in: ${currentUrl}`);
}

async function getBrowser(contextLabel: string) {
  if (!browserPromise) {
    logScrape("before-browser-launch", {
      contextLabel,
      headless: env.FTMO_BROWSER_HEADLESS,
    });

    browserPromise = chromium
      .launch({
        headless: env.FTMO_BROWSER_HEADLESS,
      })
      .then((browser) => {
        logScrape("after-browser-launch", {
          contextLabel,
          browserType: "chromium",
        });
        return browser;
      })
      .catch((error) => {
        browserPromise = null;
        logScrapeError("browser-launch-error", error, { contextLabel });
        throw normalizeScrapeError(error);
      });
  } else {
    logScrape("reuse-browser", { contextLabel });
  }

  return browserPromise;
}

function moneyToNumber(money: FtmoMoney | null | undefined) {
  if (!money) {
    return null;
  }

  return money.value / 10 ** money.decimal;
}

function parseCurrencyNumber(text: string) {
  const match = text.match(/([+\-]?\$?[\d,]+(?:\.\d+)?)/);
  if (!match?.[1]) {
    return null;
  }

  const normalized = match[1].replace(/\$/g, "").replace(/,/g, "");
  return Number(normalized);
}

async function extractVisibleCards(page: Page) {
  const [balanceText, equityText, pnlText, accountSizeText] = await Promise.all([
    page.locator('[data-testid="balance-card"]').innerText().catch(() => ""),
    page.locator('[data-testid="equity-card"]').innerText().catch(() => ""),
    page.locator('[data-testid="todays-profit-card"]').innerText().catch(() => ""),
    page.locator("text=Account size:").locator("..").innerText().catch(() => ""),
  ]);

  return {
    balance: parseCurrencyNumber(balanceText),
    equity: parseCurrencyNumber(equityText),
    unrealizedPnl: parseCurrencyNumber(pnlText),
    accountSize: parseCurrencyNumber(accountSizeText),
  } satisfies VisibleCards;
}

function buildSnapshotFromApi(payload: FtmoMetrixResponse, visibleCards: VisibleCards): FtmoSnapshotPayload | null {
  const metrixData = payload.metrixData;
  if (!metrixData) {
    return null;
  }

  const initialBalance = moneyToNumber(metrixData.info?.initialBalance);
  const balance = moneyToNumber(metrixData.statistics?.balance) ?? initialBalance;
  const equity = moneyToNumber(metrixData.statistics?.equity) ?? balance;
  const profitAbsolute = moneyToNumber(metrixData.objectives?.profit?.result) ?? (equity !== null && initialBalance !== null ? equity - initialBalance : null);
  const apiProfitPercent = metrixData.objectives?.profit?.percentage?.value ?? null;
  const profitPercent =
    apiProfitPercent !== null && apiProfitPercent !== undefined
      ? apiProfitPercent
      : profitAbsolute !== null && initialBalance
        ? (profitAbsolute / initialBalance) * 100
        : 0;
  const dailyLossValue = moneyToNumber(metrixData.objectives?.maxDailyLoss?.result);
  const maxLossValue = moneyToNumber(metrixData.objectives?.maxLoss?.result);
  const hasCurrentResults = metrixData.info?.hasCurrentResults ?? false;

  const notice =
    !hasCurrentResults && visibleCards.equity !== null && initialBalance !== null && Math.abs(visibleCards.equity - initialBalance) > 0.5
      ? "FTMO page visible cards differed from public API; API values were used."
      : !hasCurrentResults
        ? "FTMO account has no current results yet."
        : null;

  return {
    profitPercent,
    profitAbsolute,
    dailyLossValue,
    maxLossValue,
    balance,
    equity,
    statusNotes: null,
    rawPayload: {
      source: "ftmo-public-api",
      apiTimestamp: metrixData.timestamp ?? null,
      hasCurrentResults,
      notice,
      accountStageType: metrixData.info?.accountStageType ?? null,
      accountStatus: metrixData.info?.accountStatus ?? null,
      initialBalance,
      visibleCards,
      metrixData,
    },
  };
}

function buildSnapshotFromVisibleCards(visibleCards: VisibleCards): FtmoSnapshotPayload | null {
  if (visibleCards.balance === null && visibleCards.equity === null) {
    return null;
  }

  const baseBalance = visibleCards.accountSize ?? visibleCards.balance ?? visibleCards.equity ?? 0;
  const equity = visibleCards.equity ?? visibleCards.balance ?? baseBalance;
  const profitAbsolute = equity - baseBalance;
  const profitPercent = baseBalance ? (profitAbsolute / baseBalance) * 100 : 0;

  return {
    profitPercent,
    profitAbsolute,
    balance: visibleCards.balance,
    equity,
    dailyLossValue: null,
    maxLossValue: null,
    statusNotes: "FTMO structured API unavailable, visible card fallback was used.",
    rawPayload: {
      source: "visible-cards-fallback",
      visibleCards,
    },
  };
}

export async function fetchFtmoMetrics(url: string, options: FetchFtmoOptions = {}) {
  let lastError: unknown = null;
  const label = options.label ?? url;

  for (let attempt = 1; attempt <= env.FTMO_MAX_RETRIES; attempt += 1) {
    const browser = await getBrowser(label);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1080 },
      locale: "en-US",
    });
    const page = await context.newPage();

    try {
      logScrape("before-trader-url", {
        label,
        attempt,
        url,
      });

      const metrixResponsePromise = page.waitForResponse(
        (response) => response.url().includes("/public-api/v1/metrix/") && response.status() === 200,
        { timeout: Math.min(20000, env.FTMO_REQUEST_TIMEOUT_MS) },
      );
      metrixResponsePromise.catch(() => undefined);

      page.setDefaultTimeout(env.FTMO_REQUEST_TIMEOUT_MS);
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: env.FTMO_REQUEST_TIMEOUT_MS,
      });

      const currentUrl = page.url();
      logScrape("after-page-goto", {
        label,
        attempt,
        currentUrl,
      });

      if (isFtmoAuthRedirect(currentUrl)) {
        throw createPrivateMetrixError(currentUrl);
      }

      const metrixResponse = await metrixResponsePromise;
      const metrixPayload = (await metrixResponse.json()) as FtmoMetrixResponse;

      logScrape("after-api-response", {
        label,
        attempt,
        apiUrl: metrixResponse.url(),
      });

      await page.waitForSelector('[data-testid="current-results-cards"], [data-testid="trading-objectives-maxLoss"]', {
        timeout: Math.min(15000, env.FTMO_REQUEST_TIMEOUT_MS),
      });

      logScrape("after-selector-wait", {
        label,
        attempt,
      });

      await page.waitForTimeout(1500);
      const visibleCards = await extractVisibleCards(page);
      const snapshot = buildSnapshotFromApi(metrixPayload, visibleCards) ?? buildSnapshotFromVisibleCards(visibleCards);

      if (!snapshot) {
        throw new Error("FTMO page metrics could not be extracted.");
      }

      logScrape("after-extraction", {
        label,
        attempt,
        profitPercent: snapshot.profitPercent,
        profitAbsolute: snapshot.profitAbsolute,
        balance: snapshot.balance,
        equity: snapshot.equity,
        dailyLossValue: snapshot.dailyLossValue,
        maxLossValue: snapshot.maxLossValue,
      });

      await context.close();
      return snapshot;
    } catch (error) {
      lastError = normalizeScrapeError(error);
      logScrapeError("trader-catch", lastError, {
        label,
        attempt,
        url,
      });

      try {
        await context.close();
      } catch (closeError) {
        logScrapeError("context-close-error", closeError, {
          label,
          attempt,
        });
      }

      if (lastError instanceof Error && lastError.message.includes("redirected to sign-in")) {
        break;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("FTMO scraping failed.");
}

export async function closeFtmoBrowser() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
    browserPromise = null;
    logScrape("browser-closed");
  }
}
