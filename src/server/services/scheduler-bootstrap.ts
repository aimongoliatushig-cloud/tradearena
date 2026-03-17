const globalForSchedulerBootstrap = globalThis as typeof globalThis & {
  __ftmoSchedulerBootstrapStarted__?: boolean;
};

export function bootScheduler() {
  if (typeof window !== "undefined") {
    return;
  }

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  if (globalForSchedulerBootstrap.__ftmoSchedulerBootstrapStarted__) {
    return;
  }

  globalForSchedulerBootstrap.__ftmoSchedulerBootstrapStarted__ = true;

  setTimeout(() => {
    void import("@/server/services/scheduler-runtime")
      .then(({ ensureSchedulerStarted }) => {
        ensureSchedulerStarted("layout-bootstrap");
      })
      .catch((error) => {
        globalForSchedulerBootstrap.__ftmoSchedulerBootstrapStarted__ = false;
        console.error("[SCHEDULER][bootstrap-failed]", error);
      });
  }, 0);
}
