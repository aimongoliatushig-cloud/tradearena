import {
  ApplicantStatus,
  BlogPostStatus,
  ChallengeStep,
  RoomPublicStatus,
} from "@prisma/client";
import { z } from "zod";

import { BLOG_ANALYTICS_REPORT_FREQUENCY_OPTIONS } from "@/lib/blog-analytics";
import { ACCOUNT_SIZE_OPTIONS, ROOM_STATUS_OPTIONS } from "@/lib/prisma-enums";

const ftmoUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.toLowerCase().endsWith("ftmo.com");
  }, "A public FTMO MetriX URL is required.");

export const applicantFormSchema = z.object({
  fullName: z.string().trim().min(2, "Овог нэрээ оруулна уу."),
  email: z.string().trim().email("Зөв и-мэйл хаяг оруулна уу."),
  phoneNumber: z.string().trim().min(6, "Зөв утасны дугаар оруулна уу."),
  telegramUsername: z.string().trim().min(2, "Telegram нэрээ оруулна уу."),
  roomId: z.string().cuid("Өрөө сонгоно уу."),
  note: z.string().trim().max(500, "Тайлбар 500 тэмдэгтээс ихгүй байна.").optional(),
});

export const roomFormSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(3, "Room title must be at least 3 characters."),
    description: z.string().trim().max(1000).optional(),
    accountSize: z.enum(ACCOUNT_SIZE_OPTIONS),
    step: z.nativeEnum(ChallengeStep),
    entryFeeUsd: z.coerce.number().min(0),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    publicStatus: z.nativeEnum(RoomPublicStatus),
    lifecycleStatus: z.enum(ROOM_STATUS_OPTIONS),
    maxTraderCapacity: z.coerce.number().int().min(1).max(50),
    updateTimesInput: z.string().trim().optional(),
    updateTimezone: z.string().trim().min(2),
    allowExpiredUpdates: z.boolean().default(false),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "End date cannot be before the start date.",
    path: ["endDate"],
  });

export const traderFormSchema = z.object({
  roomId: z.string().cuid(),
  traderId: z.string().cuid().optional(),
  fullName: z.string().trim().min(2, "Trader name is required."),
  metrixUrl: ftmoUrlSchema,
  active: z.boolean().default(true),
});

export const traderViolationSchema = z.object({
  traderId: z.string().cuid(),
  violationFlag: z.boolean(),
  violationReason: z.string().trim().max(300).optional(),
});

export const traderCompletionRecordSchema = z.object({
  traderId: z.string().cuid(),
  completionRecorded: z.boolean(),
});

export const applicantStatusSchema = z.object({
  applicantId: z.string().cuid(),
  status: z.nativeEnum(ApplicantStatus),
  roomId: z.string().cuid().optional(),
});

export const applicantCommentSchema = z.object({
  applicantId: z.string().cuid(),
  body: z.string().trim().min(2, "Comment is too short.").max(1500, "Comment is too long."),
});

export const applicantTrashSchema = z.object({
  applicantId: z.string().cuid(),
});

export const invitationSchema = z.object({
  accountSize: z.enum(ACCOUNT_SIZE_OPTIONS),
  roomLink: z.string().trim().url("Enter a valid room URL."),
  subject: z.string().trim().min(3),
  extraInstructions: z.string().trim().min(5),
});

const emailAddressSchema = z.string().email();

function parseEmailListInput(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export const settingsSchema = z
  .object({
    defaultScheduleInput: z.string().trim().min(4),
    timezone: z.string().trim().min(2),
    roomReadySubject: z.string().trim().min(3),
    roomReadyMessage: z.string().trim().min(10),
    bankName: z.string().trim().min(2),
    accountHolder: z.string().trim().min(2),
    accountNumber: z.string().trim().min(4),
    transactionValueHint: z.string().trim().min(4),
    coachingCtaLabel: z.string().trim().min(2),
    coachingCtaUrl: z.string().trim().url("Коучингийн холбоос зөв биш байна."),
    supportCtaLabel: z.string().trim().min(2),
    supportCtaUrl: z.string().trim().url("Дэмжлэгийн холбоос зөв биш байна."),
    blogAnalyticsReportEmails: z
      .string()
      .trim()
      .transform(parseEmailListInput)
      .refine((emails) => emails.every((email) => emailAddressSchema.safeParse(email).success), "Enter valid report emails separated by commas."),
    blogAnalyticsReportFrequency: z.enum(BLOG_ANALYTICS_REPORT_FREQUENCY_OPTIONS),
    notifyOnNewUserSignup: z.boolean().default(false),
    notifyOnNewProgramRegistration: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (
      (value.blogAnalyticsReportFrequency !== "OFF" ||
        value.notifyOnNewUserSignup ||
        value.notifyOnNewProgramRegistration) &&
      value.blogAnalyticsReportEmails.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one blog report email or turn the related alerts off.",
        path: ["blogAnalyticsReportEmails"],
      });
    }
  });

export const blogCategorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2, "Ангиллын нэр оруулна уу."),
  description: z.string().trim().max(500, "Тайлбар 500 тэмдэгтээс ихгүй байна.").optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const blogPopupSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(2, "Popup гарчиг оруулна уу."),
  body: z.string().trim().min(10, "Popup текст оруулна уу."),
  imageUrl: z.string().trim().optional(),
  videoUrl: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || z.url().safeParse(value).success, "Зөв видео холбоос оруулна уу."),
  ctaLabel: z.string().trim().min(2, "Товчны нэр оруулна уу."),
  ctaUrl: z.string().trim().url("Зөв CTA холбоос оруулна уу."),
  isActive: z.boolean().default(true),
});

export const blogPostSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string().trim().min(3, "Нийтлэлийн гарчиг оруулна уу."),
  excerpt: z.string().trim().max(320, "Товч тайлбар 320 тэмдэгтээс ихгүй байна.").optional(),
  bodyMarkdown: z.string().trim().min(30, "Нийтлэлийн агуулга хэт богино байна."),
  coverImageUrl: z.string().trim().min(1, "Зургийн холбоос шаардлагатай."),
  categoryId: z.string().cuid("Ангилал сонгоно уу."),
  status: z.nativeEnum(BlogPostStatus),
  requiresLoginForFullRead: z.boolean().default(false),
  showEndPopup: z.boolean().default(false),
  popupId: z.string().cuid().optional(),
});

export function normalizeFtmoUrl(value: string) {
  const url = new URL(value.trim());
  url.hash = "";
  return url.toString();
}

export function normalizeOptionalUrl(value?: string | null) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return new URL(trimmed).toString();
}

export function parseScheduleInput(value?: string | null) {
  if (!value) return [];

  const schedule = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const invalid = schedule.find((item) => !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(item));
  if (invalid) {
    throw new Error(`"${invalid}" has an invalid time format. Use HH:mm.`);
  }

  return Array.from(new Set(schedule)).sort();
}
