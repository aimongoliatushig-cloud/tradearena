import { type BlogAnalyticsEventTypeValue } from "@/lib/blog-analytics";

export function BlogAnalyticsPixel({
  eventType,
  postId,
}: {
  eventType: BlogAnalyticsEventTypeValue;
  postId: string;
}) {
  const searchParams = new URLSearchParams({
    postId,
    eventType,
  });

  return <img alt="" aria-hidden src={`/api/blog/analytics?${searchParams.toString()}`} className="hidden" />;
}
