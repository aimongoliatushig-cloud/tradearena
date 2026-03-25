"use client";

import { useEffect } from "react";

import { type BlogAnalyticsEventTypeValue } from "@/lib/blog-analytics";
import { sendBlogAnalyticsEvent } from "@/lib/blog-analytics-client";

const RECENT_EVENT_WINDOW_MS = 1500;

function getRecentEventKey(postId: string, eventType: BlogAnalyticsEventTypeValue) {
  return `blog_analytics_recent:${postId}:${eventType}`;
}

export function BlogEventTracker({
  eventType,
  postId,
}: {
  eventType: BlogAnalyticsEventTypeValue;
  postId: string;
}) {
  useEffect(() => {
    const now = Date.now();

    try {
      const storageKey = getRecentEventKey(postId, eventType);
      const previousValue = Number(window.sessionStorage.getItem(storageKey) ?? 0);

      if (previousValue && now - previousValue < RECENT_EVENT_WINDOW_MS) {
        return;
      }

      window.sessionStorage.setItem(storageKey, String(now));
    } catch {
      // Ignore storage access failures in strict privacy modes.
    }

    void sendBlogAnalyticsEvent({
      postId,
      eventType,
    });
  }, [eventType, postId]);

  return null;
}
