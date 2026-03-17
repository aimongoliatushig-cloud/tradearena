import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/auth";
import { listAdminLogs } from "@/server/services/dashboard-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await listAdminLogs();
  return NextResponse.json({ logs });
}
