"use client";

import { type BlogAnalyticsEventTypeValue } from "@/lib/blog-analytics";

export async function sendBlogAnalyticsEvent(input: {
  eventType: BlogAnalyticsEventTypeValue;
  popupId?: string | null;
  postId: string;
}) {
  try {
    await fetch("/api/blog/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      credentials: "same-origin",
      keepalive: true,
    });
  } catch {
    // Analytics events should never block the reading flow.
  }
}
