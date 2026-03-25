export const BLOG_ANALYTICS_RANGE_OPTIONS = ["daily", "weekly", "monthly"] as const;
export type BlogAnalyticsRange = (typeof BLOG_ANALYTICS_RANGE_OPTIONS)[number];

export const BLOG_ANALYTICS_RANGE_LABELS: Record<BlogAnalyticsRange, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export const BLOG_ANALYTICS_REPORT_FREQUENCY_OPTIONS = ["OFF", "DAILY", "WEEKLY"] as const;
export type BlogAnalyticsReportFrequency = (typeof BLOG_ANALYTICS_REPORT_FREQUENCY_OPTIONS)[number];

export const BLOG_ANALYTICS_REPORT_FREQUENCY_LABELS: Record<BlogAnalyticsReportFrequency, string> = {
  OFF: "Off",
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

export const BLOG_ANALYTICS_EVENT_TYPE_OPTIONS = ["POST_VIEW", "PREVIEW_VIEW", "FULL_READ", "POPUP_SHOWN"] as const;
export type BlogAnalyticsEventTypeValue = (typeof BLOG_ANALYTICS_EVENT_TYPE_OPTIONS)[number];

export const BLOG_ANALYTICS_EVENT_TYPE = {
  POST_VIEW: "POST_VIEW",
  PREVIEW_VIEW: "PREVIEW_VIEW",
  FULL_READ: "FULL_READ",
  POPUP_SHOWN: "POPUP_SHOWN",
} as const satisfies Record<BlogAnalyticsEventTypeValue, BlogAnalyticsEventTypeValue>;

export const BLOG_ANALYTICS_READER_COOKIE = "blog_reader_id";
export const BLOG_ANALYTICS_REPORT_SEND_HOUR = 9;
