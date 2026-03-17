import { DEFAULT_UPDATE_TIMES } from "@/lib/constants";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

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

export async function getInvitationTemplates() {
  const setting = await db.appSetting.findUnique({
    where: { key: "invitation_templates" },
  });

  const value = setting?.value as { subject?: string; message?: string } | null;

  return {
    subject: value?.subject ?? "FTMO сорилтын өрөөний урилга",
    message:
      value?.message ??
      "Сайн байна уу,\n\nТаны өргөдөл сорилтын өрөөнд сонгогдлоо. Доорх холбоосоор орж зааврыг дагана уу.\n\n{roomLink}\n\n{extraInstructions}",
  };
}

export async function saveSettings(input: {
  defaultScheduleInput: string;
  timezone: string;
  invitationSubject: string;
  invitationMessage: string;
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
      where: { key: "invitation_templates" },
      update: { value: { subject: input.invitationSubject, message: input.invitationMessage } },
      create: {
        key: "invitation_templates",
        value: { subject: input.invitationSubject, message: input.invitationMessage },
      },
    }),
  ]);
}
