import {
  ApplicantStatus,
  ChallengeStep,
  RoomPublicStatus,
} from "@prisma/client";
import { z } from "zod";

import { ACCOUNT_SIZE_OPTIONS, ROOM_STATUS_OPTIONS } from "@/lib/prisma-enums";

const ftmoUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.toLowerCase().endsWith("ftmo.com");
  }, "A public FTMO MetriX URL is required.");

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const applicantFormSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email."),
  phoneNumber: z.string().trim().min(6, "Enter a valid phone number."),
  telegramUsername: z.string().trim().min(2, "Enter your Telegram username."),
  roomId: z.string().cuid("Choose a room."),
  note: z.string().trim().max(500, "Note must be 500 characters or less.").optional(),
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

export const applicantStatusSchema = z.object({
  applicantId: z.string().cuid(),
  status: z.nativeEnum(ApplicantStatus),
  roomId: z.string().cuid().optional(),
});

export const invitationSchema = z.object({
  accountSize: z.enum(ACCOUNT_SIZE_OPTIONS),
  roomLink: z.string().trim().url("Enter a valid room URL."),
  subject: z.string().trim().min(3),
  extraInstructions: z.string().trim().min(5),
});

export const settingsSchema = z.object({
  defaultScheduleInput: z.string().trim().min(4),
  timezone: z.string().trim().min(2),
  roomReadySubject: z.string().trim().min(3),
  roomReadyMessage: z.string().trim().min(10),
  bankName: z.string().trim().min(2),
  accountHolder: z.string().trim().min(2),
  accountNumber: z.string().trim().min(4),
  transactionValueHint: z.string().trim().min(4),
});

export function normalizeFtmoUrl(value: string) {
  const url = new URL(value.trim());
  url.hash = "";
  return url.toString();
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
