"use client";

import { useEffect, useRef } from "react";

import { BLOG_ANALYTICS_EVENT_TYPE } from "@/lib/blog-analytics";
import { sendBlogAnalyticsEvent } from "@/lib/blog-analytics-client";

export function BlogReadTracker({ postId }: { postId: string }) {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const node = triggerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasTrackedRef.current) {
          return;
        }

        if (entries.some((entry) => entry.isIntersecting)) {
          hasTrackedRef.current = true;
          void sendBlogAnalyticsEvent({
            postId,
            eventType: BLOG_ANALYTICS_EVENT_TYPE.FULL_READ,
          });
          observer.disconnect();
        }
      },
      { threshold: 0.8 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [postId]);

  return <div ref={triggerRef} aria-hidden className="h-px w-full" />;
}
