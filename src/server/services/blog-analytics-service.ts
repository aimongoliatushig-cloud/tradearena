import { BlogAnalyticsEventType, Prisma } from "@prisma/client";

import {
  type BlogAnalyticsRange,
  type BlogAnalyticsReportFrequency,
  BLOG_ANALYTICS_RANGE_LABELS,
} from "@/lib/blog-analytics";
import { dayjs } from "@/lib/dayjs";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

type AnalyticsBucket = {
  key: string;
  label: string;
  pageViews: number;
  previewViews: number;
  fullReads: number;
  popupShows: number;
  loggedInReads: number;
  guestReads: number;
};

type AnalyticsHour = {
  hour: number;
  label: string;
  pageViews: number;
  previewViews: number;
  fullReads: number;
};

type AnalyticsPostSummary = {
  postId: string;
  postTitle: string;
  postSlug: string;
  pageViews: number;
  previewViews: number;
  fullReads: number;
  popupShows: number;
  loggedInReads: number;
  guestReads: number;
  lastActivityAt: Date | null;
  lastReadAt: Date | null;
};

type AnalyticsReaderSummary = {
  readerKey: string;
  readerLabel: string;
  readerEmail: string | null;
  isAuthenticated: boolean;
  pageViews: number;
  previewViews: number;
  fullReads: number;
  popupShows: number;
  lastActivityAt: Date | null;
  lastReadAt: Date | null;
};

type AnalyticsReadEvent = {
  id: string;
  occurredAt: Date;
  postId: string;
  postTitle: string;
  postSlug: string;
  readerLabel: string;
  readerEmail: string | null;
  isAuthenticated: boolean;
};

type AnalyticsWindow = {
  end: Date;
  label: string;
  start: Date;
  unit: "day" | "hour";
};

type ReportWindow = {
  end: Date;
  label: string;
  periodKey: string;
  start: Date;
  unit: "day" | "hour";
};

type DashboardAggregate = {
  buckets: AnalyticsBucket[];
  end: Date;
  guestReads: number;
  hours: AnalyticsHour[];
  loggedInReads: number;
  previewViews: number;
  popupShows: number;
  posts: AnalyticsPostSummary[];
  readers: AnalyticsReaderSummary[];
  recentFullReads: AnalyticsReadEvent[];
  start: Date;
  totalViews: number;
  totalFullReads: number;
  uniqueReaders: number;
};

export type BlogAnalyticsDashboard = DashboardAggregate & {
  range: BlogAnalyticsRange;
  rangeLabel: string;
};

type AnalyticsEventRecord = Awaited<ReturnType<typeof listAnalyticsEvents>>[number];

export async function trackBlogAnalyticsEvent(input: {
  anonymousId?: string | null;
  clerkUserId?: string | null;
  eventType: BlogAnalyticsEventType;
  ipAddress?: string | null;
  isAuthenticated: boolean;
  metadata?: Prisma.InputJsonValue;
  popupId?: string | null;
  postId: string;
  readerEmail?: string | null;
  readerKey: string;
  readerName?: string | null;
  userAgent?: string | null;
}) {
  return db.blogPostAnalyticsEvent.create({
    data: {
      anonymousId: input.anonymousId ?? null,
      clerkUserId: input.clerkUserId ?? null,
      eventType: input.eventType,
      ipAddress: input.ipAddress ?? null,
      isAuthenticated: input.isAuthenticated,
      metadata: input.metadata,
      popupId: input.popupId ?? null,
      postId: input.postId,
      readerEmail: input.readerEmail ?? null,
      readerKey: input.readerKey,
      readerName: input.readerName ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function getBlogAnalyticsDashboard(range: BlogAnalyticsRange, timezone = env.APP_TIMEZONE, postId?: string) {
  const window = getAnalyticsWindow(range, timezone);
  const aggregate = await collectAnalytics(window, timezone, postId);

  return {
    ...aggregate,
    range,
    rangeLabel: BLOG_ANALYTICS_RANGE_LABELS[range],
  } satisfies BlogAnalyticsDashboard;
}

export async function buildBlogAnalyticsEmailReport(
  frequency: Exclude<BlogAnalyticsReportFrequency, "OFF">,
  timezone = env.APP_TIMEZONE,
  now = new Date(),
) {
  const window = getReportWindow(frequency, timezone, now);
  const aggregate = await collectAnalytics(window, timezone);
  const subject = `${window.label} blog analytics report`;

  const message = [
    `${window.label} blog analytics report`,
    `Window: ${formatWindowLabel(window.start, window.end, timezone)}`,
    "",
    `Post views: ${aggregate.totalViews}`,
    `Preview views: ${aggregate.previewViews}`,
    `Total full reads: ${aggregate.totalFullReads}`,
    `Logged-in full reads: ${aggregate.loggedInReads}`,
    `Guest full reads: ${aggregate.guestReads}`,
    `Popup impressions: ${aggregate.popupShows}`,
    `Unique readers: ${aggregate.uniqueReaders}`,
    "",
    "Top posts:",
    ...formatTopPostsForEmail(aggregate.posts),
    "",
    "Top readers:",
    ...formatTopReadersForEmail(aggregate.readers),
    "",
    "Top hours:",
    ...formatTopHoursForEmail(aggregate.hours),
  ].join("\n");

  return {
    periodKey: window.periodKey,
    subject,
    message,
  };
}

async function collectAnalytics(window: AnalyticsWindow | ReportWindow, timezone: string, postId?: string): Promise<DashboardAggregate> {
  const events = await listAnalyticsEvents(window.start, window.end, postId);
  const buckets = buildBuckets(window, timezone);
  const hours = buildHourBuckets();
  const postMap = new Map<string, AnalyticsPostSummary>();
  const readerMap = new Map<string, AnalyticsReaderSummary>();
  const recentFullReads: AnalyticsReadEvent[] = [];
  const uniqueReaderKeys = new Set<string>();
  let totalViews = 0;
  let previewViews = 0;
  let totalFullReads = 0;
  let loggedInReads = 0;
  let guestReads = 0;
  let popupShows = 0;

  for (const event of events) {
    const bucket = buckets[getBucketIndex(event.occurredAt, window, timezone)];
    const hour = hours[dayjs(event.occurredAt).tz(timezone).hour()];
    const postEntry = getPostSummary(postMap, event);
    const readerEntry = getReaderSummary(readerMap, event);

    postEntry.lastActivityAt = maxDate(postEntry.lastActivityAt, event.occurredAt);
    readerEntry.lastActivityAt = maxDate(readerEntry.lastActivityAt, event.occurredAt);

    if (event.eventType === BlogAnalyticsEventType.POST_VIEW) {
      totalViews += 1;
      postEntry.pageViews += 1;
      readerEntry.pageViews += 1;
      hour.pageViews += 1;
      bucket.pageViews += 1;
    }

    if (event.eventType === BlogAnalyticsEventType.PREVIEW_VIEW) {
      previewViews += 1;
      postEntry.previewViews += 1;
      readerEntry.previewViews += 1;
      hour.previewViews += 1;
      bucket.previewViews += 1;
    }

    if (event.eventType === BlogAnalyticsEventType.FULL_READ) {
      totalFullReads += 1;
      uniqueReaderKeys.add(event.readerKey);
      postEntry.fullReads += 1;
      readerEntry.fullReads += 1;
      hour.fullReads += 1;
      bucket.fullReads += 1;

      if (event.isAuthenticated) {
        loggedInReads += 1;
        postEntry.loggedInReads += 1;
        bucket.loggedInReads += 1;
      } else {
        guestReads += 1;
        postEntry.guestReads += 1;
        bucket.guestReads += 1;
      }

      postEntry.lastReadAt = maxDate(postEntry.lastReadAt, event.occurredAt);
      readerEntry.lastReadAt = maxDate(readerEntry.lastReadAt, event.occurredAt);

      recentFullReads.push({
        id: event.id,
        occurredAt: event.occurredAt,
        postId: event.post.id,
        postTitle: event.post.title,
        postSlug: event.post.slug,
        readerEmail: event.readerEmail ?? null,
        readerLabel: formatReaderLabel(event),
        isAuthenticated: event.isAuthenticated,
      });
    }

    if (event.eventType === BlogAnalyticsEventType.POPUP_SHOWN) {
      popupShows += 1;
      postEntry.popupShows += 1;
      readerEntry.popupShows += 1;
      bucket.popupShows += 1;
    }
  }

  return {
    buckets,
    end: window.end,
    guestReads,
    hours: hours.sort((left, right) => right.pageViews - left.pageViews || right.fullReads - left.fullReads || left.hour - right.hour),
    loggedInReads,
    previewViews,
    popupShows,
    posts: Array.from(postMap.values()).sort(
      (left, right) =>
        right.pageViews - left.pageViews ||
        right.fullReads - left.fullReads ||
        right.previewViews - left.previewViews ||
        right.popupShows - left.popupShows,
    ),
    readers: Array.from(readerMap.values()).sort(
      (left, right) =>
        right.fullReads - left.fullReads ||
        right.pageViews - left.pageViews ||
        right.previewViews - left.previewViews ||
        compareDates(right.lastActivityAt, left.lastActivityAt),
    ),
    recentFullReads: recentFullReads.sort((left, right) => compareDates(right.occurredAt, left.occurredAt)).slice(0, 50),
    start: window.start,
    totalViews,
    totalFullReads,
    uniqueReaders: uniqueReaderKeys.size,
  };
}

async function listAnalyticsEvents(start: Date, end: Date, postId?: string) {
  return db.blogPostAnalyticsEvent.findMany({
    where: {
      ...(postId ? { postId } : {}),
      occurredAt: {
        gte: start,
        lt: end,
      },
    },
    include: {
      post: {
        select: {
          id: true,
          slug: true,
          title: true,
        },
      },
    },
    orderBy: {
      occurredAt: "asc",
    },
  });
}

function getAnalyticsWindow(range: BlogAnalyticsRange, timezone: string, now = new Date()): AnalyticsWindow {
  const localNow = dayjs(now).tz(timezone);

  if (range === "daily") {
    const end = localNow.endOf("hour");
    return {
      start: end.subtract(23, "hour").startOf("hour").toDate(),
      end: end.add(1, "hour").startOf("hour").toDate(),
      label: "Last 24 hours",
      unit: "hour",
    };
  }

  if (range === "weekly") {
    const end = localNow.endOf("day");
    return {
      start: end.subtract(6, "day").startOf("day").toDate(),
      end: end.add(1, "day").startOf("day").toDate(),
      label: "Last 7 days",
      unit: "day",
    };
  }

  const end = localNow.endOf("day");
  return {
    start: end.subtract(29, "day").startOf("day").toDate(),
    end: end.add(1, "day").startOf("day").toDate(),
    label: "Last 30 days",
    unit: "day",
  };
}

function getReportWindow(
  frequency: Exclude<BlogAnalyticsReportFrequency, "OFF">,
  timezone: string,
  now = new Date(),
): ReportWindow {
  const localNow = dayjs(now).tz(timezone).startOf("day");

  if (frequency === "DAILY") {
    const start = localNow.subtract(1, "day");
    const end = localNow;

    return {
      start: start.toDate(),
      end: end.toDate(),
      label: `Daily (${start.format("YYYY-MM-DD")})`,
      periodKey: start.format("YYYY-MM-DD"),
      unit: "hour",
    };
  }

  const start = localNow.subtract(7, "day");
  const end = localNow;

  return {
    start: start.toDate(),
    end: end.toDate(),
    label: `Weekly (${start.format("YYYY-MM-DD")} to ${end.subtract(1, "day").format("YYYY-MM-DD")})`,
    periodKey: `${start.format("YYYY-MM-DD")}_${end.subtract(1, "day").format("YYYY-MM-DD")}`,
    unit: "day",
  };
}

function buildBuckets(window: AnalyticsWindow | ReportWindow, timezone: string) {
  const buckets: AnalyticsBucket[] = [];
  let cursor = dayjs(window.start).tz(timezone);
  const end = dayjs(window.end).tz(timezone);

  while (cursor.isBefore(end)) {
    buckets.push({
      key: cursor.toISOString(),
      label: window.unit === "hour" ? cursor.format("HH:mm") : cursor.format("MM/DD"),
      pageViews: 0,
      previewViews: 0,
      fullReads: 0,
      popupShows: 0,
      loggedInReads: 0,
      guestReads: 0,
    });

    cursor = cursor.add(1, window.unit);
  }

  return buckets;
}

function buildHourBuckets() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${hour.toString().padStart(2, "0")}:00`,
    pageViews: 0,
    previewViews: 0,
    fullReads: 0,
  }));
}

function getBucketIndex(date: Date, window: AnalyticsWindow | ReportWindow, timezone: string) {
  const localDate = dayjs(date).tz(timezone);
  const localStart = dayjs(window.start).tz(timezone);
  const diff = localDate.diff(localStart, window.unit);

  return Math.max(0, diff);
}

function getPostSummary(map: Map<string, AnalyticsPostSummary>, event: AnalyticsEventRecord) {
  let summary = map.get(event.postId);

  if (!summary) {
    summary = {
      postId: event.post.id,
      postTitle: event.post.title,
      postSlug: event.post.slug,
      pageViews: 0,
      previewViews: 0,
      fullReads: 0,
      popupShows: 0,
      loggedInReads: 0,
      guestReads: 0,
      lastActivityAt: null,
      lastReadAt: null,
    };
    map.set(event.postId, summary);
  }

  return summary;
}

function getReaderSummary(map: Map<string, AnalyticsReaderSummary>, event: AnalyticsEventRecord) {
  let summary = map.get(event.readerKey);

  if (!summary) {
    summary = {
      readerKey: event.readerKey,
      readerLabel: formatReaderLabel(event),
      readerEmail: event.readerEmail ?? null,
      isAuthenticated: event.isAuthenticated,
      pageViews: 0,
      previewViews: 0,
      fullReads: 0,
      popupShows: 0,
      lastActivityAt: null,
      lastReadAt: null,
    };
    map.set(event.readerKey, summary);
  }

  return summary;
}

function formatReaderLabel(event: Pick<AnalyticsEventRecord, "isAuthenticated" | "readerEmail" | "readerKey" | "readerName">) {
  const trimmedName = event.readerName?.trim();
  if (trimmedName) {
    return trimmedName;
  }

  const trimmedEmail = event.readerEmail?.trim();
  if (trimmedEmail) {
    return trimmedEmail;
  }

  if (event.isAuthenticated && event.readerKey.startsWith("user:")) {
    return `User ${event.readerKey.slice(-6)}`;
  }

  return `Guest ${event.readerKey.slice(-6)}`;
}

function compareDates(left?: Date | null, right?: Date | null) {
  return (left?.getTime() ?? 0) - (right?.getTime() ?? 0);
}

function maxDate(left?: Date | null, right?: Date | null) {
  if (!left) return right ?? null;
  if (!right) return left;
  return left > right ? left : right;
}

function formatTopPostsForEmail(posts: AnalyticsPostSummary[]) {
  if (!posts.length) {
    return ["- No post activity recorded."];
  }

  return posts.slice(0, 5).map((post, index) => {
    return `${index + 1}. ${post.postTitle} | views: ${post.pageViews} | previews: ${post.previewViews} | full reads: ${post.fullReads} | popup impressions: ${post.popupShows}`;
  });
}

function formatTopReadersForEmail(readers: AnalyticsReaderSummary[]) {
  if (!readers.length) {
    return ["- No reader activity recorded."];
  }

  return readers.slice(0, 5).map((reader, index) => {
    return `${index + 1}. ${reader.readerLabel} | views: ${reader.pageViews} | previews: ${reader.previewViews} | full reads: ${reader.fullReads}`;
  });
}

function formatTopHoursForEmail(hours: AnalyticsHour[]) {
  const filtered = hours.filter((hour) => hour.pageViews > 0 || hour.fullReads > 0).slice(0, 5);

  if (!filtered.length) {
    return ["- No peak hours yet."];
  }

  return filtered.map((hour) => `${hour.label} | views: ${hour.pageViews} | full reads: ${hour.fullReads}`);
}

function formatWindowLabel(start: Date, end: Date, timezone: string) {
  const localStart = dayjs(start).tz(timezone);
  const localEnd = dayjs(end).tz(timezone).subtract(1, "minute");
  return `${localStart.format("YYYY-MM-DD HH:mm")} -> ${localEnd.format("YYYY-MM-DD HH:mm")} (${timezone})`;
}
