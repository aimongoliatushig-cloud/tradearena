import cron from "node-cron";

import { env } from "@/lib/env";
import { closeFtmoBrowser } from "@/server/services/scrape-service";
import { runSchedulerTick } from "@/server/services/scheduler-service";

type SchedulerTask = ReturnType<typeof cron.schedule>;

type SchedulerState = {
  cleanupBound: boolean;
  running: boolean;
  started: boolean;
  task?: SchedulerTask;
};

const globalForScheduler = globalThis as typeof globalThis & {
  __ftmoSchedulerState__?: SchedulerState;
};

const schedulerState =
  globalForScheduler.__ftmoSchedulerState__ ??
  (globalForScheduler.__ftmoSchedulerState__ = {
    cleanupBound: false,
    running: false,
    started: false,
  });

function logScheduler(stage: string, details: Record<string, unknown> = {}) {
  console.info(`[SCHEDULER][${new Date().toISOString()}][${stage}] ${JSON.stringify(details)}`);
}

function logSchedulerError(stage: string, error: unknown, details: Record<string, unknown> = {}) {
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

  console.error(`[SCHEDULER][${new Date().toISOString()}][${stage}] ${JSON.stringify(payload)}`);
}

async function tick(reason: string) {
  if (schedulerState.running) {
    logScheduler("skip-overlap", { reason });
    return;
  }

  schedulerState.running = true;

  try {
    const result = await runSchedulerTick(reason);
    logScheduler("tick-finished", {
      dueRooms: result.dueRooms.length,
      lifecycleUpdates: result.lifecycleUpdates,
      minuteKey: result.minuteKey.toISOString(),
      reason,
    });
  } catch (error) {
    logSchedulerError("tick-failed", error, { reason });
  } finally {
    schedulerState.running = false;
  }
}

function bindCleanupHandlers() {
  if (schedulerState.cleanupBound) {
    return;
  }

  const shutdown = async (signal: string) => {
    schedulerState.task?.stop();
    await closeFtmoBrowser();
    logScheduler("stopped", { signal });
  };

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  schedulerState.cleanupBound = true;
}

export function ensureSchedulerStarted(reason = "app-startup") {
  if (!env.SCHEDULER_ENABLED || env.NODE_ENV === "test") {
    return false;
  }

  if (schedulerState.started) {
    return false;
  }

  schedulerState.task = cron.schedule(
    "* * * * *",
    () => {
      void tick("cron");
    },
    {
      timezone: env.APP_TIMEZONE,
    },
  );

  schedulerState.started = true;
  bindCleanupHandlers();

  setTimeout(() => {
    void tick(reason);
  }, 0);

  logScheduler("started", {
    reason,
    timezone: env.APP_TIMEZONE,
  });

  return true;
}
