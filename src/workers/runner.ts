import "dotenv/config";

import cron from "node-cron";

import { env } from "@/lib/env";
import { closeFtmoBrowser } from "@/server/services/scrape-service";
import { runSchedulerTick } from "@/server/services/scheduler-service";

let running = false;

async function tick(reason: string) {
  if (running) return;
  running = true;

  try {
    await runSchedulerTick(reason);
  } finally {
    running = false;
  }
}

async function boot() {
  await tick("startup");

  cron.schedule(
    "* * * * *",
    async () => {
      await tick("cron");
    },
    {
      timezone: env.APP_TIMEZONE,
    },
  );

  process.on("SIGINT", async () => {
    await closeFtmoBrowser();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await closeFtmoBrowser();
    process.exit(0);
  });
}

boot().catch(async (error) => {
  console.error(error);
  await closeFtmoBrowser();
  process.exit(1);
});
