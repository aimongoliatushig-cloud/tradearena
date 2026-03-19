import { AccountSize, FetchSource, JobStatus, JobType, RoomLifecycleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { FTMO_DAILY_LOSS_LIMIT_BY_ACCOUNT_SIZE, FTMO_MAX_LOSS_LIMIT_BY_ACCOUNT_SIZE } from "@/lib/ftmo-rules";
import { recomputeRoomLeaderboard } from "@/server/services/leaderboard-service";
import { closeFtmoBrowser, fetchFtmoMetrics } from "@/server/services/scrape-service";

type RefreshResult = { traderId: string; status: "success" | "failed"; message?: string };

function timestamp() {
  return new Date().toISOString();
}

function logRefresh(stage: string, details: Record<string, unknown> = {}) {
  console.log(`[REFRESH][${timestamp()}][${stage}] ${JSON.stringify(details)}`);
}

function logRefreshError(stage: string, error: unknown, details: Record<string, unknown> = {}) {
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

  console.error(`[REFRESH][${timestamp()}][${stage}] ${JSON.stringify(payload)}`);
}

function createTimeoutError(label: string, timeoutMs: number) {
  const error = new Error(`${label} timeout after ${timeoutMs}ms`);
  error.name = "TimeoutError";
  return error;
}

const AUTO_VIOLATION_REASON_PREFIX = "FTMO ";

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function isLimitBreached(value: number | null | undefined, limit: number) {
  return value !== null && value !== undefined && value <= -limit;
}

function buildAutoViolationReason(label: "max daily loss" | "max loss", value: number, limit: number) {
  return `${AUTO_VIOLATION_REASON_PREFIX}${label} breached (loss: ${formatUsd(value)}, limit: ${formatUsd(-limit)}).`;
}

function deriveViolationState(input: {
  accountSize: AccountSize;
  dailyLossValue: number | null | undefined;
  maxLossValue: number | null | undefined;
  existingViolationFlag: boolean;
  existingViolationReason?: string | null;
}) {
  const dailyLossLimit = FTMO_DAILY_LOSS_LIMIT_BY_ACCOUNT_SIZE[input.accountSize];
  const maxLossLimit = FTMO_MAX_LOSS_LIMIT_BY_ACCOUNT_SIZE[input.accountSize];

  const autoReason =
    isLimitBreached(input.dailyLossValue, dailyLossLimit)
      ? buildAutoViolationReason("max daily loss", input.dailyLossValue!, dailyLossLimit)
      : isLimitBreached(input.maxLossValue, maxLossLimit)
        ? buildAutoViolationReason("max loss", input.maxLossValue!, maxLossLimit)
        : null;

  if (autoReason) {
    const shouldKeepExistingReason =
      input.existingViolationFlag &&
      input.existingViolationReason &&
      !input.existingViolationReason.startsWith(AUTO_VIOLATION_REASON_PREFIX);

    return {
      violationFlag: true,
      violationReason: shouldKeepExistingReason ? input.existingViolationReason : autoReason,
    };
  }

  return {
    violationFlag: input.existingViolationFlag,
    violationReason: input.existingViolationFlag ? input.existingViolationReason ?? null : null,
  };
}

async function withTimeout<T>(input: {
  label: string;
  timeoutMs: number;
  operation: () => Promise<T>;
  onTimeout?: () => Promise<void> | void;
}) {
  const { label, timeoutMs, operation, onTimeout } = input;
  let timer: NodeJS.Timeout | undefined;
  let timedOut = false;

  const operationPromise = operation();
  operationPromise.catch(() => undefined);

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(async () => {
      timedOut = true;
      const error = createTimeoutError(label, timeoutMs);
      logRefreshError("timeout", error, { label, timeoutMs });

      try {
        await onTimeout?.();
      } catch (timeoutCleanupError) {
        logRefreshError("timeout-cleanup-error", timeoutCleanupError, { label });
      }

      reject(error);
    }, timeoutMs);
  });

  try {
    return await Promise.race([operationPromise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }

    if (timedOut) {
      logRefresh("timeout-finished", { label, timeoutMs });
    }
  }
}

export async function setTraderViolation(input: {
  traderId: string;
  violationFlag: boolean;
  violationReason?: string;
}) {
  const trader = await db.trader.update({
    where: { id: input.traderId },
    data: {
      violationFlag: input.violationFlag,
      violationReason: input.violationFlag ? input.violationReason || "Админ гараараа тэмдэглэсэн" : null,
    },
  });

  await recomputeRoomLeaderboard(trader.roomId);
  return trader;
}

export async function setTraderCompletionRecorded(input: {
  traderId: string;
  completionRecorded: boolean;
}) {
  return db.trader.update({
    where: { id: input.traderId },
    data: {
      completionRecorded: input.completionRecorded,
    },
  });
}

export async function refreshTraderStats(
  traderId: string,
  source: FetchSource = FetchSource.MANUAL,
  options: { recomputeLeaderboard?: boolean } = {},
) {
  const shouldRecomputeLeaderboard = options.recomputeLeaderboard ?? true;

  const trader = await db.trader.findUnique({
    where: { id: traderId },
    include: { room: true },
  });

  if (!trader) {
    throw new Error("Трейдер олдсонгүй.");
  }

  if (
    trader.room.lifecycleStatus !== RoomLifecycleStatus.ACTIVE &&
    !trader.room.allowExpiredUpdates &&
    source === FetchSource.SCHEDULER
  ) {
    return null;
  }

  const traderLabel = `${trader.room.title} :: ${trader.fullName}`;
  logRefresh("before-trader-refresh", {
    traderId,
    traderLabel,
    url: trader.metrixUrl,
    source,
    recomputeLeaderboard: shouldRecomputeLeaderboard,
  });

  const log = await db.jobRunLog.create({
    data: {
      roomId: trader.roomId,
      traderId,
      source,
      status: JobStatus.RUNNING,
      jobType: source === FetchSource.MANUAL ? JobType.MANUAL_TRADER_REFRESH : JobType.SCHEDULED_ROOM_UPDATE,
      message: "FTMO MetriX snapshot татаж байна.",
    },
  });

  try {
    const snapshot = await withTimeout({
      label: traderLabel,
      timeoutMs: env.FTMO_TRADER_TIMEOUT_MS,
      operation: () =>
        fetchFtmoMetrics(trader.metrixUrl, {
          label: traderLabel,
        }),
      onTimeout: async () => {
        await closeFtmoBrowser();
      },
    });

    const finishedAt = new Date();
    const nextViolationState = deriveViolationState({
      accountSize: trader.room.accountSize,
      dailyLossValue: snapshot.dailyLossValue,
      maxLossValue: snapshot.maxLossValue,
      existingViolationFlag: trader.violationFlag,
      existingViolationReason: trader.violationReason,
    });

    await db.trader.update({
      where: { id: trader.id },
      data: {
        currentProfitPercent: snapshot.profitPercent,
        currentProfitAbsolute: snapshot.profitAbsolute ?? null,
        currentDailyLossValue: snapshot.dailyLossValue ?? null,
        currentMaxLossValue: snapshot.maxLossValue ?? null,
        currentBalance: snapshot.balance ?? null,
        currentEquity: snapshot.equity ?? null,
        violationFlag: nextViolationState.violationFlag,
        violationReason: nextViolationState.violationReason,
        latestSnapshotAt: finishedAt,
        snapshots: {
          create: {
            fetchedAt: finishedAt,
            profitPercent: snapshot.profitPercent,
            profitAbsolute: snapshot.profitAbsolute ?? null,
            dailyLossValue: snapshot.dailyLossValue ?? null,
            maxLossValue: snapshot.maxLossValue ?? null,
            balance: snapshot.balance ?? null,
            equity: snapshot.equity ?? null,
            statusNotes: snapshot.statusNotes ?? null,
            rawPayload: snapshot.rawPayload,
          },
        },
      },
    });

    await db.jobRunLog.update({
      where: { id: log.id },
      data: {
        status: snapshot.statusNotes ? JobStatus.PARTIAL : JobStatus.SUCCESS,
        finishedAt,
        message: snapshot.statusNotes ?? "Snapshot амжилттай хадгалагдлаа.",
        details: snapshot.rawPayload,
      },
    });

    if (shouldRecomputeLeaderboard) {
      await recomputeRoomLeaderboard(trader.roomId);
    }

    logRefresh("after-trader-refresh", {
      traderId,
      traderLabel,
      profitPercent: snapshot.profitPercent,
      statusNotes: snapshot.statusNotes,
      recomputeLeaderboard: shouldRecomputeLeaderboard,
    });

    return snapshot;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Тодорхойгүй scrape алдаа.";
    logRefreshError("trader-refresh-catch", error, {
      traderId,
      traderLabel,
      url: trader.metrixUrl,
      source,
    });

    await db.jobRunLog.update({
      where: { id: log.id },
      data: {
        status: JobStatus.FAILED,
        finishedAt: new Date(),
        message,
        details: { error: message },
      },
    });

    throw error;
  }
}

export async function refreshRoomStats(roomId: string, source: FetchSource = FetchSource.MANUAL) {
  const room = await db.challengeRoom.findUnique({
    where: { id: roomId },
    include: {
      traders: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!room) {
    throw new Error("Өрөө олдсонгүй.");
  }

  logRefresh("before-room-refresh", {
    roomId,
    roomTitle: room.title,
    traderCount: room.traders.length,
    source,
    roomTimeoutMs: env.FTMO_ROOM_TIMEOUT_MS,
    traderTimeoutMs: env.FTMO_TRADER_TIMEOUT_MS,
  });

  const parentLog = await db.jobRunLog.create({
    data: {
      roomId,
      status: JobStatus.RUNNING,
      source,
      jobType: source === FetchSource.MANUAL ? JobType.MANUAL_ROOM_REFRESH : JobType.SCHEDULED_ROOM_UPDATE,
      message: `${room.title} өрөөний шинэчлэлт эхэллээ.`,
    },
  });

  const results: RefreshResult[] = [];
  let roomError: unknown = null;

  try {
    await withTimeout({
      label: `room:${room.title}`,
      timeoutMs: env.FTMO_ROOM_TIMEOUT_MS,
      operation: async () => {
        for (const trader of room.traders) {
          logRefresh("before-trader-url", {
            roomId,
            roomTitle: room.title,
            traderId: trader.id,
            traderName: trader.fullName,
            url: trader.metrixUrl,
          });

          try {
            await refreshTraderStats(trader.id, source, { recomputeLeaderboard: false });
            results.push({ traderId: trader.id, status: "success" });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Алдаа";
            results.push({
              traderId: trader.id,
              status: "failed",
              message,
            });

            logRefreshError("room-trader-catch", error, {
              roomId,
              roomTitle: room.title,
              traderId: trader.id,
              traderName: trader.fullName,
            });
          }
        }
      },
      onTimeout: async () => {
        await closeFtmoBrowser();
      },
    });
  } catch (error) {
    roomError = error;
    logRefreshError("room-refresh-catch", error, {
      roomId,
      roomTitle: room.title,
    });
  }

  await recomputeRoomLeaderboard(roomId);

  const failed = results.filter((item) => item.status === "failed");
  const finalStatus =
    roomError instanceof Error ? (results.length ? JobStatus.PARTIAL : JobStatus.FAILED) : failed.length ? JobStatus.PARTIAL : JobStatus.SUCCESS;
  const finalMessage =
    roomError instanceof Error
      ? `Өрөө шинэчлэх ажил зогслоо: ${roomError.message}`
      : failed.length
        ? `${failed.length} трейдер дээр алдаа гарлаа.`
        : `${room.traders.length} трейдер бүрэн шинэчлэгдлээ.`;

  await db.jobRunLog.update({
    where: { id: parentLog.id },
    data: {
      status: finalStatus,
      finishedAt: new Date(),
      message: finalMessage,
      details: {
        results,
        roomError: roomError instanceof Error ? { name: roomError.name, message: roomError.message, stack: roomError.stack } : null,
      },
    },
  });

  logRefresh("after-room-refresh", {
    roomId,
    roomTitle: room.title,
    successCount: results.filter((item) => item.status === "success").length,
    failedCount: failed.length,
    roomError: roomError instanceof Error ? roomError.message : null,
  });

  if (roomError) {
    throw roomError;
  }

  return { room, results };
}

export async function syncRoomLifecycleStatus() {
  const now = new Date();

  const rooms = await db.challengeRoom.findMany({
    where: {
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
      endDate: {
        lt: now,
      },
      allowExpiredUpdates: false,
    },
    select: { id: true },
  });

  if (!rooms.length) {
    return 0;
  }

  await db.challengeRoom.updateMany({
    where: {
      id: { in: rooms.map((room) => room.id) },
    },
    data: {
      lifecycleStatus: RoomLifecycleStatus.EXPIRED,
    },
  });

  for (const room of rooms) {
    await recomputeRoomLeaderboard(room.id);
  }

  return rooms.length;
}
