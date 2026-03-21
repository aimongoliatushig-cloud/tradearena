import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { sessionId } = await auth();

  if (sessionId) {
    const client = await clerkClient();
    await client.sessions.revokeSession(sessionId);
  }

  const url = new URL(request.url);
  const redirectUrl = url.searchParams.get("redirect_url") ?? "/packages";

  return NextResponse.redirect(new URL(redirectUrl, url.origin), 303);
}
