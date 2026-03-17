import {
  AccountSize,
  ApplicantStatus,
  ChallengeStep,
  RoomLifecycleStatus,
  RoomPublicStatus,
} from "@prisma/client";
import { z } from "zod";

const ftmoUrlSchema = z
  .string()
  .trim()
  .url("Зөв URL оруулна уу.")
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.toLowerCase().endsWith("ftmo.com");
  }, "FTMO-ийн нийтэд нээлттэй MetriX холбоос шаардлагатай.");

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Имэйл буруу байна."),
  password: z.string().min(8, "Нууц үг хамгийн багадаа 8 тэмдэгт байна."),
});

export const applicantFormSchema = z.object({
  fullName: z.string().trim().min(2, "Нэрээ бүтнээр оруулна уу."),
  email: z.string().trim().email("Имэйл буруу байна."),
  phoneNumber: z.string().trim().min(6, "Утасны дугаар буруу байна."),
  telegramUsername: z.string().trim().optional(),
  desiredAccountSize: z.nativeEnum(AccountSize),
  note: z.string().trim().max(500, "Тэмдэглэл 500 тэмдэгтээс ихгүй байна.").optional(),
});

export const roomFormSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(3, "Өрөөний нэр хамгийн багадаа 3 тэмдэгт байна."),
    description: z.string().trim().max(1000).optional(),
    accountSize: z.nativeEnum(AccountSize),
    step: z.nativeEnum(ChallengeStep),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    publicStatus: z.nativeEnum(RoomPublicStatus),
    lifecycleStatus: z.nativeEnum(RoomLifecycleStatus),
    maxTraderCapacity: z.coerce.number().int().min(1).max(50),
    updateTimesInput: z.string().trim().optional(),
    updateTimezone: z.string().trim().min(2),
    allowExpiredUpdates: z.boolean().default(false),
  })
  .refine((value) => value.endDate >= value.startDate, {
    message: "Дуусах огноо эхлэх огнооноос өмнө байж болохгүй.",
    path: ["endDate"],
  });

export const traderFormSchema = z.object({
  roomId: z.string().cuid(),
  traderId: z.string().cuid().optional(),
  fullName: z.string().trim().min(2, "Трейдерийн нэр шаардлагатай."),
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
  accountSize: z.nativeEnum(AccountSize),
  roomLink: z.string().trim().url("Өрөөний холбоос зөв байх ёстой."),
  subject: z.string().trim().min(3),
  extraInstructions: z.string().trim().min(5),
});

export const settingsSchema = z.object({
  defaultScheduleInput: z.string().trim().min(4),
  timezone: z.string().trim().min(2),
  invitationSubject: z.string().trim().min(3),
  invitationMessage: z.string().trim().min(10),
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
    throw new Error(`"${invalid}" цагийн формат буруу байна. HH:mm хэлбэр ашиглана уу.`);
  }

  return Array.from(new Set(schedule)).sort();
}
