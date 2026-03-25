import { BlogAnalyticsEventType, BlogPostStatus } from "@prisma/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestIpAddress } from "@/lib/admin-access";
import { BLOG_ANALYTICS_EVENT_TYPE, BLOG_ANALYTICS_EVENT_TYPE_OPTIONS, BLOG_ANALYTICS_READER_COOKIE } from "@/lib/blog-analytics";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { trackBlogAnalyticsEvent } from "@/server/services/blog-analytics-service";

const requestSchema = z.object({
  postId: z.string().cuid(),
  popupId: z.string().cuid().optional().nullable(),
  eventType: z.enum(BLOG_ANALYTICS_EVENT_TYPE_OPTIONS),
});

const transparentGif = Buffer.from("R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");

async function recordBlogAnalyticsEvent(input: z.infer<typeof requestSchema>, request: Request) {
  const post = await db.blogPost.findFirst({
    where: {
      id: input.postId,
      status: BlogPostStatus.PUBLISHED,
    },
    select: {
      id: true,
      popupId: true,
    },
  });

  if (!post) {
    return { error: "Blog post not found." as const, status: 404 as const };
  }

  if (input.eventType === BLOG_ANALYTICS_EVENT_TYPE.POPUP_SHOWN && input.popupId && post.popupId !== input.popupId) {
    return { error: "Popup mismatch." as const, status: 400 as const };
  }

  const cookieStore = await cookies();
  const existingAnonymousId = cookieStore.get(BLOG_ANALYTICS_READER_COOKIE)?.value;
  const anonymousId = existingAnonymousId || crypto.randomUUID();
  const { userId } = await auth();
  const viewer = userId ? await currentUser() : null;

  await trackBlogAnalyticsEvent({
    anonymousId: userId ? null : anonymousId,
    clerkUserId: userId,
    eventType: input.eventType as BlogAnalyticsEventType,
    ipAddress: getRequestIpAddress(request.headers),
    isAuthenticated: Boolean(userId),
    popupId: input.eventType === BLOG_ANALYTICS_EVENT_TYPE.POPUP_SHOWN ? input.popupId ?? post.popupId : null,
    postId: input.postId,
    readerEmail: viewer?.primaryEmailAddress?.emailAddress ?? null,
    readerKey: userId ? `user:${userId}` : `guest:${anonymousId}`,
    readerName: viewer ? [viewer.firstName, viewer.lastName].filter(Boolean).join(" ") || viewer.username : null,
    userAgent: request.headers.get("user-agent"),
  });

  return {
    anonymousId,
    hasExistingAnonymousId: Boolean(existingAnonymousId),
    ok: true as const,
    userId,
  };
}

function applyAnonymousAnalyticsCookie(response: NextResponse, result: Awaited<ReturnType<typeof recordBlogAnalyticsEvent>>) {
  if (!("ok" in result) || result.userId || result.hasExistingAnonymousId || !result.anonymousId) {
    return response;
  }

  response.cookies.set(BLOG_ANALYTICS_READER_COOKIE, result.anonymousId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  });

  return response;
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics payload." }, { status: 400 });
  }

  const result = await recordBlogAnalyticsEvent(parsed.data, request);
  if (!("ok" in result)) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return applyAnonymousAnalyticsCookie(NextResponse.json({ ok: true }), result);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = requestSchema.safeParse({
    postId: url.searchParams.get("postId"),
    popupId: url.searchParams.get("popupId"),
    eventType: url.searchParams.get("eventType"),
  });

  if (!parsed.success) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  const result = await recordBlogAnalyticsEvent(parsed.data, request);
  const response =
    "ok" in result
      ? new NextResponse(transparentGif, {
          status: 200,
          headers: {
            "Cache-Control": "no-store, max-age=0",
            "Content-Type": "image/gif",
          },
        })
      : new NextResponse(null, {
          status: 204,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        });

  return applyAnonymousAnalyticsCookie(response, result);
}
