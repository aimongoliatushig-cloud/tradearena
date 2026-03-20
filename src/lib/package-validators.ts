import { z } from "zod";

import {
  ACCOUNT_SIZE_OPTIONS,
  COURSE_ACCESS_LEVEL_OPTIONS,
  ENROLLMENT_DECISION,
  RESOURCE_TYPE_OPTIONS,
} from "@/lib/prisma-enums";

function isAllowedExternalHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["localhost", "127.0.0.1"].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

const externalHttpsUrlSchema = z
  .string()
  .trim()
  .refine((value) => isAllowedExternalHttpsUrl(value), "Зөвхөн гаднын https холбоос оруулна уу.");

export const optionalExternalHttpsUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value?.trim() || undefined)
  .refine((value) => !value || isAllowedExternalHttpsUrl(value), "Зөвхөн гаднын https холбоос оруулна уу.");

export const packageTierFormSchema = z.object({
  id: z.string().cuid().optional(),
  nameMn: z.string().trim().min(2, "Багцын нэр оруулна уу."),
  accountSize: z.enum(ACCOUNT_SIZE_OPTIONS),
  priceUsd: z.coerce.number().min(0, "Үнэ 0-ээс багагүй байна."),
  maxUsers: z.coerce.number().int().min(1).max(50),
  featuresInput: z.string().trim().min(2, "Давуу талуудыг оруулна уу."),
  strategyCount: z.coerce.number().int().min(0).max(99),
  includesCoaching: z.boolean().default(false),
  coachingHours: z.coerce.number().int().min(0).max(10),
  includesIndicators: z.boolean().default(false),
  courseAccessLevel: z.enum(COURSE_ACCESS_LEVEL_OPTIONS),
  prioritySupport: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean().default(true),
});

export const manualPaymentSubmissionSchema = z.object({
  enrollmentId: z.string().cuid(),
  reference: z.string().trim().min(2, "Гүйлгээний утга эсвэл reference оруулна уу."),
  proofNote: z.string().trim().max(1000, "Тайлбар хэт урт байна.").optional(),
  proofUrl: optionalExternalHttpsUrlSchema,
});

export const paymentConfirmationSchema = z.object({
  paymentId: z.string().cuid(),
});

export const courseFormSchema = z.object({
  id: z.string().cuid().optional(),
  titleMn: z.string().trim().min(2, "Сургалтын нэр оруулна уу."),
  descriptionMn: z.string().trim().max(500, "Тайлбар хэт урт байна.").optional(),
  videoUrl: optionalExternalHttpsUrlSchema,
  textContent: z.string().trim().max(10000, "Текст хэт урт байна.").optional(),
  pdfUrlsInput: z.string().trim().optional(),
  packageTierIds: z.array(z.string().cuid()).default([]),
  sortOrder: z.coerce.number().int().min(0).max(999),
  isPublished: z.boolean().default(true),
});

export const resourceFormSchema = z.object({
  id: z.string().cuid().optional(),
  titleMn: z.string().trim().min(2, "Нөөцийн нэр оруулна уу."),
  descriptionMn: z.string().trim().max(500, "Тайлбар хэт урт байна.").optional(),
  type: z.enum(RESOURCE_TYPE_OPTIONS),
  linkUrl: externalHttpsUrlSchema,
  packageTierIds: z.array(z.string().cuid()).default([]),
  sortOrder: z.coerce.number().int().min(0).max(999),
  isPublished: z.boolean().default(true),
});

export const enrollmentMoveSchema = z.object({
  enrollmentId: z.string().cuid(),
  roomId: z.string().cuid(),
});

export const enrollmentDecisionSchema = z.object({
  enrollmentId: z.string().cuid(),
  decision: z.nativeEnum(ENROLLMENT_DECISION),
});

export const courseProgressSchema = z.object({
  courseId: z.string().cuid(),
  percentComplete: z.coerce.number().int().min(0).max(100),
});

export function parseTextList(value?: string | null) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function parseExternalUrlList(value?: string | null) {
  const items = parseTextList(value);
  const invalid = items.find((item) => !isAllowedExternalHttpsUrl(item));

  if (invalid) {
    throw new Error("PDF болон бусад файлд зөвхөн гаднын https холбоос ашиглана уу.");
  }

  return items;
}

export function slugifyMn(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яёөүң\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
