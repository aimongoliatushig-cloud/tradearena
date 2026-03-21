import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getRequestIpAddress } from "@/lib/admin-access";

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

function getAdminIpAllowlist() {
  return (process.env.ADMIN_IP_ALLOWLIST ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function applyRobotsHeader(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export default clerkMiddleware((_, request) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-ftmo-pathname", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  if (!isAdminRoute(request)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const allowlist = getAdminIpAllowlist();
  const ipAddress = getRequestIpAddress(request.headers);

  if (allowlist.length > 0 && (!ipAddress || !allowlist.includes(ipAddress))) {
    console.warn("[admin-access]", {
      ipAddress,
      path: request.nextUrl.pathname,
      reason: "ip_not_allowed",
    });

    if (request.nextUrl.pathname.startsWith("/api/admin")) {
      return applyRobotsHeader(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }

    return applyRobotsHeader(NextResponse.redirect(new URL("/", request.url)));
  }

  return applyRobotsHeader(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
  );
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
