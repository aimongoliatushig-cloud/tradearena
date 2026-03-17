import "dotenv/config";

import { ensureSchedulerStarted } from "@/server/services/scheduler-runtime";

async function boot() {
  ensureSchedulerStarted("worker-startup");
  await new Promise<void>(() => undefined);
}

boot().catch((error) => {
  console.error(error);
  process.exit(1);
});
