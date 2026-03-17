import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { runSchedulerTick } from "@/server/services/scheduler-service";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-job-secret");

  if (secret !== env.JOB_SHARED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runSchedulerTick("api");
  return NextResponse.json({ ok: true, result });
}
