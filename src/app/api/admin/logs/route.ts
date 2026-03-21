import { NextResponse } from "next/server";

import { getAdminAccessState } from "@/lib/auth";
import { listAdminLogs } from "@/server/services/dashboard-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await getAdminAccessState({
    requestHeaders: request.headers,
    requestPath: new URL(request.url).pathname,
  });

  if (!access.allowed) {
    return NextResponse.json({ error: access.status === 401 ? "Unauthorized" : access.status === 429 ? "Too Many Requests" : "Forbidden" }, { status: access.status });
  }

  const logs = await listAdminLogs();
  return NextResponse.json({ logs });
}
