import type { AccountSize } from "@prisma/client";

import { DEFAULT_TARGET_PERCENT } from "@/lib/constants";

type FtmoMoneyLike = {
  value?: number | null;
  decimal?: number | null;
};

const QUALIFYING_DAY_PERCENT = 2.5;
const REQUIRED_QUALIFYING_DAY_COUNT = 2;

export const ACCOUNT_SIZE_USD: Record<AccountSize, number> = {
  SIZE_10K: 10000,
  SIZE_25K: 25000,
  SIZE_50K: 50000,
  SIZE_100K: 100000,
  SIZE_200K: 200000,
};

export const FTMO_DAILY_LOSS_LIMIT_BY_ACCOUNT_SIZE: Record<AccountSize, number> = {
  SIZE_10K: 500,
  SIZE_25K: 1250,
  SIZE_50K: 2500,
  SIZE_100K: 5000,
  SIZE_200K: 10000,
};

export const FTMO_MAX_LOSS_LIMIT_BY_ACCOUNT_SIZE: Record<AccountSize, number> = {
  SIZE_10K: 1000,
  SIZE_25K: 2500,
  SIZE_50K: 5000,
  SIZE_100K: 10000,
  SIZE_200K: 20000,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function moneyLikeToNumber(value: unknown) {
  if (!isRecord(value)) {
    return null;
  }

  const amount = value.value;
  const decimal = value.decimal;

  if (typeof amount !== "number" || typeof decimal !== "number") {
    return null;
  }

  return amount / 10 ** decimal;
}

function getDailySummary(rawPayload: unknown) {
  if (!isRecord(rawPayload)) {
    return [];
  }

  const metrixData = rawPayload.metrixData;
  if (!isRecord(metrixData) || !Array.isArray(metrixData.dailySummary)) {
    return [];
  }

  return metrixData.dailySummary.filter(isRecord);
}

export function getAccountSizeUsd(accountSize: AccountSize) {
  return ACCOUNT_SIZE_USD[accountSize];
}

export function getProfitTargetUsd(accountSize: AccountSize) {
  return getAccountSizeUsd(accountSize) * (DEFAULT_TARGET_PERCENT / 100);
}

export function getQualifyingDayProfitUsd(accountSize: AccountSize) {
  return getAccountSizeUsd(accountSize) * (QUALIFYING_DAY_PERCENT / 100);
}

export function countQualifiedProfitDays(rawPayload: unknown, accountSize: AccountSize) {
  const threshold = getQualifyingDayProfitUsd(accountSize);

  return getDailySummary(rawPayload).filter((entry) => {
    const realizedProfit = moneyLikeToNumber((entry as { realizedProfit?: FtmoMoneyLike | null }).realizedProfit);
    return realizedProfit !== null && realizedProfit >= threshold;
  }).length;
}

export function getTotalRiskValue(dailyLossValue: number | null | undefined, maxLossValue: number | null | undefined) {
  if ((dailyLossValue === null || dailyLossValue === undefined) && (maxLossValue === null || maxLossValue === undefined)) {
    return null;
  }

  return Math.abs(dailyLossValue ?? 0) + Math.abs(maxLossValue ?? 0);
}

export function buildTraderCompletionStatus(input: {
  accountSize: AccountSize;
  currentProfitAbsolute: number | null | undefined;
  currentProfitPercent: number | null | undefined;
  violationFlag: boolean;
  rawPayload: unknown;
}) {
  const profitTargetUsd = getProfitTargetUsd(input.accountSize);
  const qualifyingDayProfitUsd = getQualifyingDayProfitUsd(input.accountSize);
  const qualifiedProfitDays = countQualifiedProfitDays(input.rawPayload, input.accountSize);
  const reachedTarget =
    (input.currentProfitPercent ?? Number.NEGATIVE_INFINITY) >= DEFAULT_TARGET_PERCENT ||
    (input.currentProfitAbsolute ?? Number.NEGATIVE_INFINITY) >= profitTargetUsd;
  const hasRequiredDays = qualifiedProfitDays >= REQUIRED_QUALIFYING_DAY_COUNT;
  const completed = reachedTarget && hasRequiredDays && !input.violationFlag;

  return {
    completed,
    reachedTarget,
    hasRequiredDays,
    qualifiedProfitDays,
    requiredQualifyingDayCount: REQUIRED_QUALIFYING_DAY_COUNT,
    qualifyingDayProfitUsd,
    profitTargetUsd,
  };
}
