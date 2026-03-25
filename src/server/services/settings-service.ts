import { DEFAULT_UPDATE_TIMES } from "@/lib/constants";
import { BLOG_ANALYTICS_REPORT_FREQUENCY_OPTIONS, type BlogAnalyticsReportFrequency } from "@/lib/blog-analytics";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { DEFAULT_PAYMENT_DETAILS } from "@/lib/pricing";

function parseReportEmails(value?: string | string[] | null) {
  if (!value) {
    return [];
  }

  const source = Array.isArray(value) ? value.join(",") : value;
  return Array.from(
    new Set(
      source
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export async function getDefaultScheduleConfig() {
  const setting = await db.appSetting.findUnique({
    where: { key: "default_schedule" },
  });

  const value = setting?.value as { updateTimes?: string[]; timezone?: string } | null;

  return {
    updateTimes: value?.updateTimes?.length ? value.updateTimes : DEFAULT_UPDATE_TIMES,
    timezone: value?.timezone ?? env.APP_TIMEZONE,
  };
}

export async function getRoomReadyEmailConfig() {
  const setting = await db.appSetting.findUnique({
    where: { key: "room_ready_email" },
  });

  const value = setting?.value as { subject?: string; message?: string } | null;

  return {
    subject: value?.subject ?? "Таны TradeArena өрөө бэлэн боллоо",
    message:
      value?.message ??
      [
        "Сайн байна уу, {fullName}",
        "",
        "{roomTitle} дүүрч, эхлэхэд бэлэн боллоо.",
        "Багцын үнэ: {entryFee}",
        "",
        "Доорх мэдээллээр төлбөрөө илгээнэ үү:",
        "Банк: {bankName}",
        "Хүлээн авагч: {accountHolder}",
        "Данс: {accountNumber}",
        "Гүйлгээний утга: {transactionValueHint}",
        "",
        "Төлбөр баталгаажмагц самбар нээгдэнэ.",
      ].join("\n"),
  };
}

export async function getInvitationTemplates() {
  return getRoomReadyEmailConfig();
}

export async function getPaymentDetailsConfig() {
  const setting = await db.appSetting.findUnique({
    where: { key: "payment_details" },
  });

  const value =
    (setting?.value as {
      bankName?: string;
      accountHolder?: string;
      accountNumber?: string;
      transactionValueHint?: string;
    } | null) ?? null;

  return {
    bankName: value?.bankName ?? DEFAULT_PAYMENT_DETAILS.bankName,
    accountHolder: value?.accountHolder ?? DEFAULT_PAYMENT_DETAILS.accountHolder,
    accountNumber: value?.accountNumber ?? DEFAULT_PAYMENT_DETAILS.accountNumber,
    transactionValueHint: value?.transactionValueHint ?? DEFAULT_PAYMENT_DETAILS.transactionValueHint,
  };
}

export async function getMemberExperienceConfig() {
  const setting = await db.appSetting.findUnique({
    where: { key: "member_experience" },
  });

  const value =
    (setting?.value as {
      coachingCtaLabel?: string;
      coachingCtaUrl?: string;
      supportCtaLabel?: string;
      supportCtaUrl?: string;
    } | null) ?? null;

  return {
    coachingCtaLabel: value?.coachingCtaLabel ?? "Коучингийн цаг захиалах",
    coachingCtaUrl: value?.coachingCtaUrl ?? "https://t.me/tradearenamgl",
    supportCtaLabel: value?.supportCtaLabel ?? "Дэмжлэгтэй холбогдох",
    supportCtaUrl: value?.supportCtaUrl ?? "https://t.me/tradearenamgl",
  };
}

export async function getBlogAnalyticsReportConfig() {
  const setting = await db.appSetting.findUnique({
    where: { key: "blog_analytics_report" },
  });

  const value =
    (setting?.value as {
      emails?: string[];
      frequency?: BlogAnalyticsReportFrequency;
    } | null) ?? null;

  const frequency = BLOG_ANALYTICS_REPORT_FREQUENCY_OPTIONS.includes(value?.frequency ?? "OFF")
    ? (value?.frequency ?? "OFF")
    : "OFF";
  const fallbackEmails = parseReportEmails(env.ADMIN_EMAIL);
  const emails = value?.emails?.length ? parseReportEmails(value.emails) : fallbackEmails;

  return {
    emails,
    emailsInput: emails.join(", "),
    frequency,
  };
}

export async function getTeamAlertNotificationConfig() {
  const setting = await db.appSetting.findUnique({
    where: { key: "team_alert_notifications" },
  });

  const value =
    (setting?.value as {
      notifyOnNewProgramRegistration?: boolean;
      notifyOnNewUserSignup?: boolean;
    } | null) ?? null;

  return {
    notifyOnNewUserSignup: Boolean(value?.notifyOnNewUserSignup),
    notifyOnNewProgramRegistration: Boolean(value?.notifyOnNewProgramRegistration),
  };
}

export async function saveSettings(input: {
  defaultScheduleInput: string;
  timezone: string;
  roomReadySubject: string;
  roomReadyMessage: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  transactionValueHint: string;
  coachingCtaLabel: string;
  coachingCtaUrl: string;
  supportCtaLabel: string;
  supportCtaUrl: string;
  blogAnalyticsReportEmails: string[];
  blogAnalyticsReportFrequency: BlogAnalyticsReportFrequency;
  notifyOnNewUserSignup: boolean;
  notifyOnNewProgramRegistration: boolean;
}) {
  const updateTimes = input.defaultScheduleInput
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  await db.$transaction([
    db.appSetting.upsert({
      where: { key: "default_schedule" },
      update: { value: { updateTimes, timezone: input.timezone } },
      create: { key: "default_schedule", value: { updateTimes, timezone: input.timezone } },
    }),
    db.appSetting.upsert({
      where: { key: "room_ready_email" },
      update: { value: { subject: input.roomReadySubject, message: input.roomReadyMessage } },
      create: {
        key: "room_ready_email",
        value: { subject: input.roomReadySubject, message: input.roomReadyMessage },
      },
    }),
    db.appSetting.upsert({
      where: { key: "payment_details" },
      update: {
        value: {
          bankName: input.bankName,
          accountHolder: input.accountHolder,
          accountNumber: input.accountNumber,
          transactionValueHint: input.transactionValueHint,
        },
      },
      create: {
        key: "payment_details",
        value: {
          bankName: input.bankName,
          accountHolder: input.accountHolder,
          accountNumber: input.accountNumber,
          transactionValueHint: input.transactionValueHint,
        },
      },
    }),
    db.appSetting.upsert({
      where: { key: "member_experience" },
      update: {
        value: {
          coachingCtaLabel: input.coachingCtaLabel,
          coachingCtaUrl: input.coachingCtaUrl,
          supportCtaLabel: input.supportCtaLabel,
          supportCtaUrl: input.supportCtaUrl,
        },
      },
      create: {
        key: "member_experience",
        value: {
          coachingCtaLabel: input.coachingCtaLabel,
          coachingCtaUrl: input.coachingCtaUrl,
          supportCtaLabel: input.supportCtaLabel,
          supportCtaUrl: input.supportCtaUrl,
        },
      },
    }),
    db.appSetting.upsert({
      where: { key: "blog_analytics_report" },
      update: {
        value: {
          emails: input.blogAnalyticsReportEmails,
          frequency: input.blogAnalyticsReportFrequency,
        },
      },
      create: {
        key: "blog_analytics_report",
        value: {
          emails: input.blogAnalyticsReportEmails,
          frequency: input.blogAnalyticsReportFrequency,
        },
      },
    }),
    db.appSetting.upsert({
      where: { key: "team_alert_notifications" },
      update: {
        value: {
          notifyOnNewUserSignup: input.notifyOnNewUserSignup,
          notifyOnNewProgramRegistration: input.notifyOnNewProgramRegistration,
        },
      },
      create: {
        key: "team_alert_notifications",
        value: {
          notifyOnNewUserSignup: input.notifyOnNewUserSignup,
          notifyOnNewProgramRegistration: input.notifyOnNewProgramRegistration,
        },
      },
    }),
  ]);
}
