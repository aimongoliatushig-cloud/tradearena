import { DEFAULT_UPDATE_TIMES } from "@/lib/constants";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { DEFAULT_PAYMENT_DETAILS } from "@/lib/pricing";

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
    subject: value?.subject ?? "Your TradeArena room is ready to start",
    message:
      value?.message ??
      [
        "Hello {fullName},",
        "",
        "Your {roomTitle} is now full and ready to start.",
        "Entry fee: {entryFee}",
        "",
        "Please send the entry payment using the details below:",
        "Bank: {bankName}",
        "Account holder: {accountHolder}",
        "Account number: {accountNumber}",
        "Reference: {transactionValueHint}",
        "",
        "We will contact you after the payment window closes.",
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

export async function saveSettings(input: {
  defaultScheduleInput: string;
  timezone: string;
  roomReadySubject: string;
  roomReadyMessage: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  transactionValueHint: string;
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
  ]);
}
