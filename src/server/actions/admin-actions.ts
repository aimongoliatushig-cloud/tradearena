"use server";

import { FetchSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminSession, destroyAdminSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserFacingErrorMessage } from "@/lib/error-utils";
import {
  adminLoginSchema,
  applicantStatusSchema,
  roomFormSchema,
  traderCompletionRecordSchema,
  settingsSchema,
  traderFormSchema,
  traderViolationSchema,
} from "@/lib/validators";
import type { ActionState } from "@/server/actions/action-state";
import { updateApplicantStatus } from "@/server/services/applicant-service";
import { deleteTrader, upsertRoom, upsertTrader } from "@/server/services/room-service";
import { saveSettings } from "@/server/services/settings-service";
import { refreshRoomStats, refreshTraderStats, setTraderCompletionRecorded, setTraderViolation } from "@/server/services/trader-service";

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function buildRedirect(pathname: string, type: "success" | "error", message: string) {
  const params = new URLSearchParams({ [type]: message });
  return `${pathname}?${params.toString()}`;
}

function redirectWithMessage(pathname: string, type: "success" | "error", message: string): never {
  redirect(buildRedirect(pathname, type, message));
}

function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

async function getPublicRoomPaths(roomId: string) {
  const room = await db.challengeRoom.findUnique({
    where: { id: roomId },
    select: { slug: true },
  });

  return room ? [`/rooms/${roomId}`, `/rooms/${room.slug}`] : [`/rooms/${roomId}`];
}

export async function loginAdminAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid email or password.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const admin = await db.adminUser.findUnique({
    where: { email: parsed.data.email },
  });

  if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    return {
      status: "error",
      message: "Invalid email or password.",
    };
  }

  await db.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function saveRoomFormAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/rooms");
  let successPath = returnPath;

  try {
    const parsed = roomFormSchema.parse({
      id: formData.get("id") || undefined,
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      accountSize: formData.get("accountSize"),
      step: formData.get("step"),
      entryFeeUsd: formData.get("entryFeeUsd"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      publicStatus: formData.get("publicStatus"),
      lifecycleStatus: formData.get("lifecycleStatus"),
      maxTraderCapacity: formData.get("maxTraderCapacity"),
      updateTimesInput: formData.get("updateTimesInput") || undefined,
      updateTimezone: formData.get("updateTimezone"),
      allowExpiredUpdates: toBoolean(formData.get("allowExpiredUpdates")),
    });

    const room = await upsertRoom(parsed);
    successPath = parsed.id ? returnPath : `/admin/rooms/${room.id}`;

    revalidatePaths(["/admin", "/admin/rooms", `/admin/rooms/${room.id}`, ...(await getPublicRoomPaths(room.id)), "/", "/rooms", "/history", "/apply"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to save room."));
  }

  redirectWithMessage(successPath, "success", "Room saved.");
}

export async function saveTraderFormAction(formData: FormData) {
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);

  try {
    const parsed = traderFormSchema.parse({
      roomId,
      traderId: formData.get("traderId") || undefined,
      fullName: formData.get("fullName"),
      metrixUrl: formData.get("metrixUrl"),
      active: toBoolean(formData.get("active")),
    });

    await upsertTrader(parsed);

    revalidatePaths([`/admin/rooms/${parsed.roomId}`, ...(await getPublicRoomPaths(parsed.roomId)), "/admin/traders", "/", "/rooms"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to save trader."));
  }

  redirectWithMessage(returnPath, "success", "Trader saved.");
}

export async function deleteTraderFormAction(formData: FormData) {
  const traderId = String(formData.get("traderId"));
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);

  await deleteTrader(traderId);

  revalidatePaths([`/admin/rooms/${roomId}`, ...(await getPublicRoomPaths(roomId)), "/admin/traders", "/", "/rooms"]);
  redirectWithMessage(returnPath, "success", "Trader deleted.");
}

export async function setTraderViolationAction(formData: FormData) {
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);

  try {
    const parsed = traderViolationSchema.parse({
      traderId: formData.get("traderId"),
      violationFlag: toBoolean(formData.get("violationFlag")),
      violationReason: formData.get("violationReason") || undefined,
    });

    await setTraderViolation(parsed);

    revalidatePaths([`/admin/rooms/${roomId}`, ...(await getPublicRoomPaths(roomId)), "/admin/traders"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to update trader violation."));
  }

  redirectWithMessage(returnPath, "success", "Trader violation updated.");
}

export async function setTraderCompletionRecordedAction(formData: FormData) {
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);

  try {
    const parsed = traderCompletionRecordSchema.parse({
      traderId: formData.get("traderId"),
      completionRecorded: toBoolean(formData.get("completionRecorded")),
    });

    await setTraderCompletionRecorded(parsed);

    revalidatePaths([`/admin/rooms/${roomId}`, "/admin/traders"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to update completion record."));
  }

  redirectWithMessage(returnPath, "success", "Completion record updated.");
}

export async function refreshTraderAction(formData: FormData) {
  const traderId = String(formData.get("traderId"));
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);

  try {
    await refreshTraderStats(traderId, FetchSource.MANUAL);

    revalidatePaths([`/admin/rooms/${roomId}`, ...(await getPublicRoomPaths(roomId)), "/admin/traders", "/", "/rooms"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to refresh trader."));
  }

  redirectWithMessage(returnPath, "success", "Trader refreshed.");
}

export async function refreshRoomAction(formData: FormData) {
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);

  try {
    await refreshRoomStats(roomId, FetchSource.MANUAL);

    revalidatePaths([`/admin/rooms/${roomId}`, ...(await getPublicRoomPaths(roomId)), "/admin/traders", "/admin/logs", "/", "/rooms"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to refresh room."));
  }

  redirectWithMessage(returnPath, "success", "Room refreshed.");
}

export async function updateApplicantStatusAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/applicants");

  try {
    const parsed = applicantStatusSchema.parse({
      applicantId: formData.get("applicantId"),
      status: formData.get("status"),
      roomId: formData.get("roomId") || undefined,
    });

    await updateApplicantStatus(parsed);
    revalidatePaths(["/admin/applicants", "/apply"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to update applicant status."));
  }

  redirectWithMessage(returnPath, "success", "Applicant status updated.");
}

export async function saveSettingsAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/settings");

  try {
    const parsed = settingsSchema.parse({
      defaultScheduleInput: formData.get("defaultScheduleInput"),
      timezone: formData.get("timezone"),
      roomReadySubject: formData.get("roomReadySubject"),
      roomReadyMessage: formData.get("roomReadyMessage"),
      bankName: formData.get("bankName"),
      accountHolder: formData.get("accountHolder"),
      accountNumber: formData.get("accountNumber"),
      transactionValueHint: formData.get("transactionValueHint"),
    });

    await saveSettings(parsed);
    revalidatePaths(["/admin/settings", "/apply"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to save settings."));
  }

  redirectWithMessage(returnPath, "success", "Settings saved.");
}
