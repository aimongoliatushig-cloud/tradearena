"use server";

import { FetchSource } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserFacingErrorMessage } from "@/lib/error-utils";
import {
  courseFormSchema,
  enrollmentMoveSchema,
  packageTierFormSchema,
  paymentConfirmationSchema,
  resourceFormSchema,
} from "@/lib/package-validators";
import {
  applicantCommentSchema,
  applicantStatusSchema,
  applicantTrashSchema,
  roomFormSchema,
  traderCompletionRecordSchema,
  settingsSchema,
  traderFormSchema,
  traderViolationSchema,
} from "@/lib/validators";
import { addApplicantComment, moveApplicantToTrash, restoreApplicantFromTrash, updateApplicantStatus } from "@/server/services/applicant-service";
import { upsertCourse } from "@/server/services/course-service";
import { confirmPaymentAndEnroll, markPaymentAsUnpaid, mergePackageRooms, moveEnrollmentToRoom } from "@/server/services/enrollment-service";
import { upsertPackageTier } from "@/server/services/package-service";
import { upsertResource } from "@/server/services/resource-service";
import { deleteTrader, upsertRoom, upsertTrader } from "@/server/services/room-service";
import { saveSettings } from "@/server/services/settings-service";
import { refreshRoomStats, refreshTraderStats, setTraderCompletionRecorded, setTraderViolation } from "@/server/services/trader-service";

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function buildRedirect(pathname: string, type: "success" | "error", message: string) {
  const [pathWithSearch, hash = ""] = pathname.split("#", 2);
  const [basePath, existingSearch = ""] = pathWithSearch.split("?", 2);
  const params = new URLSearchParams(existingSearch);
  params.delete("success");
  params.delete("error");
  params.set(type, message);

  const query = params.toString();
  const nextPath = query ? `${basePath}?${query}` : basePath;
  return hash ? `${nextPath}#${hash}` : nextPath;
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

async function ensureAdminAccess(requestPath: string) {
  return requireAdminUser({ requestPath });
}

export async function saveRoomFormAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/rooms");
  let successPath = returnPath;
  await ensureAdminAccess(returnPath);

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

    revalidatePaths(["/admin", "/admin/rooms", `/admin/rooms/${room.id}`, ...(await getPublicRoomPaths(room.id)), "/", "/rooms", "/history", "/packages"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to save room."));
  }

  redirectWithMessage(successPath, "success", "Room saved.");
}

export async function saveTraderFormAction(formData: FormData) {
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);
  await ensureAdminAccess(returnPath);

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
  await ensureAdminAccess(returnPath);

  await deleteTrader(traderId);

  revalidatePaths([`/admin/rooms/${roomId}`, ...(await getPublicRoomPaths(roomId)), "/admin/traders", "/", "/rooms"]);
  redirectWithMessage(returnPath, "success", "Trader deleted.");
}

export async function setTraderViolationAction(formData: FormData) {
  const roomId = String(formData.get("roomId"));
  const returnPath = String(formData.get("returnPath") || `/admin/rooms/${roomId}`);
  await ensureAdminAccess(returnPath);

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
  await ensureAdminAccess(returnPath);

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
  await ensureAdminAccess(returnPath);

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
  await ensureAdminAccess(returnPath);

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
  await ensureAdminAccess(returnPath);

  try {
    const parsed = applicantStatusSchema.parse({
      applicantId: formData.get("applicantId"),
      status: formData.get("status"),
      roomId: formData.get("roomId") || undefined,
    });

    await updateApplicantStatus(parsed);
    revalidatePaths(["/admin/applicants", "/packages"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to update applicant status."));
  }

  redirectWithMessage(returnPath, "success", "Applicant status updated.");
}

export async function addApplicantCommentAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/applicants");
  const admin = await ensureAdminAccess(returnPath);

  try {
    const parsed = applicantCommentSchema.parse({
      applicantId: formData.get("applicantId"),
      body: formData.get("body"),
    });

    await addApplicantComment({
      applicantId: parsed.applicantId,
      adminUserId: admin.id,
      body: parsed.body,
    });
    revalidatePaths(["/admin/applicants"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to save applicant comment."));
  }

  redirectWithMessage(returnPath, "success", "Applicant comment saved.");
}

export async function moveApplicantToTrashAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/applicants");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = applicantTrashSchema.parse({
      applicantId: formData.get("applicantId"),
    });

    await moveApplicantToTrash(parsed);
    revalidatePaths(["/admin/applicants"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to move applicant to trash."));
  }

  redirectWithMessage(returnPath, "success", "Applicant moved to trash.");
}

export async function restoreApplicantFromTrashAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/applicants?view=trash");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = applicantTrashSchema.parse({
      applicantId: formData.get("applicantId"),
    });

    await restoreApplicantFromTrash(parsed);
    revalidatePaths(["/admin/applicants"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to restore applicant from trash."));
  }

  redirectWithMessage(returnPath, "success", "Applicant restored.");
}

export async function saveSettingsAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/settings");
  await ensureAdminAccess(returnPath);

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
      coachingCtaLabel: formData.get("coachingCtaLabel"),
      coachingCtaUrl: formData.get("coachingCtaUrl"),
      supportCtaLabel: formData.get("supportCtaLabel"),
      supportCtaUrl: formData.get("supportCtaUrl"),
    });

    await saveSettings(parsed);
    revalidatePaths(["/admin/settings", "/dashboard", "/checkout"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to save settings."));
  }

  redirectWithMessage(returnPath, "success", "Settings saved.");
}

export async function savePackageTierAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/packages");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = packageTierFormSchema.parse({
      id: formData.get("id") || undefined,
      nameMn: formData.get("nameMn"),
      accountSize: formData.get("accountSize"),
      priceUsd: formData.get("priceUsd"),
      maxUsers: formData.get("maxUsers"),
      featuresInput: formData.get("featuresInput"),
      strategyCount: formData.get("strategyCount"),
      includesCoaching: toBoolean(formData.get("includesCoaching")),
      coachingHours: formData.get("coachingHours"),
      includesIndicators: toBoolean(formData.get("includesIndicators")),
      courseAccessLevel: formData.get("courseAccessLevel"),
      prioritySupport: toBoolean(formData.get("prioritySupport")),
      sortOrder: formData.get("sortOrder"),
      isActive: toBoolean(formData.get("isActive")),
    });

    await upsertPackageTier(parsed);
    revalidatePaths(["/admin/packages", "/packages", "/", "/checkout"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Багц хадгалах үед алдаа гарлаа."));
  }

  redirectWithMessage(returnPath, "success", "Багц хадгалагдлаа.");
}

export async function saveCourseAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/courses");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = courseFormSchema.parse({
      id: formData.get("id") || undefined,
      titleMn: formData.get("titleMn"),
      descriptionMn: formData.get("descriptionMn") || undefined,
      videoUrl: formData.get("videoUrl") || undefined,
      textContent: formData.get("textContent") || undefined,
      pdfUrlsInput: formData.get("pdfUrlsInput") || undefined,
      packageTierIds: formData.getAll("packageTierIds").map(String),
      sortOrder: formData.get("sortOrder"),
      isPublished: toBoolean(formData.get("isPublished")),
    });

    await upsertCourse(parsed);
    revalidatePaths(["/admin/courses", "/dashboard"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Сургалт хадгалах үед алдаа гарлаа."));
  }

  redirectWithMessage(returnPath, "success", "Сургалт хадгалагдлаа.");
}

export async function saveResourceAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/resources");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = resourceFormSchema.parse({
      id: formData.get("id") || undefined,
      titleMn: formData.get("titleMn"),
      descriptionMn: formData.get("descriptionMn") || undefined,
      type: formData.get("type"),
      linkUrl: formData.get("linkUrl"),
      packageTierIds: formData.getAll("packageTierIds").map(String),
      sortOrder: formData.get("sortOrder"),
      isPublished: toBoolean(formData.get("isPublished")),
    });

    await upsertResource(parsed);
    revalidatePaths(["/admin/resources", "/dashboard"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Нөөц хадгалах үед алдаа гарлаа."));
  }

  redirectWithMessage(returnPath, "success", "Нөөц хадгалагдлаа.");
}

export async function confirmManualPaymentAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/enrollments");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = paymentConfirmationSchema.parse({
      paymentId: formData.get("paymentId"),
    });

    await confirmPaymentAndEnroll({
      paymentId: parsed.paymentId,
      actorId: "admin",
    });
    revalidatePaths(["/admin/enrollments", "/admin/applicants", "/admin/rooms", "/dashboard", "/packages"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Төлбөр баталгаажуулах үед алдаа гарлаа."));
  }

  redirectWithMessage(returnPath, "success", "Төлбөр баталгаажлаа.");
}

export async function markPaymentAsUnpaidAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/enrollments");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = paymentConfirmationSchema.parse({
      paymentId: formData.get("paymentId"),
    });

    await markPaymentAsUnpaid({
      paymentId: parsed.paymentId,
      actorId: "admin",
    });
    revalidatePaths(["/admin/enrollments", "/admin/applicants", "/admin/rooms", "/dashboard", "/packages"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Failed to return this payment to unpaid status."));
  }

  redirectWithMessage(returnPath, "success", "Payment was returned to unpaid status.");
}

export async function moveEnrollmentAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/rooms");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = enrollmentMoveSchema.parse({
      enrollmentId: formData.get("enrollmentId"),
      roomId: formData.get("roomId"),
    });

    await moveEnrollmentToRoom({
      enrollmentId: parsed.enrollmentId,
      roomId: parsed.roomId,
      actorId: "admin",
    });
    revalidatePaths(["/admin/enrollments", "/admin/rooms", "/dashboard"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Элсэлтийг шилжүүлэх үед алдаа гарлаа."));
  }

  redirectWithMessage(returnPath, "success", "Элсэлтийг амжилттай шилжүүллээ.");
}

const roomMergeSchema = z.object({
  sourceRoomId: z.string().cuid(),
  targetRoomId: z.string().cuid(),
});

export async function mergePackageRoomsAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/rooms");
  await ensureAdminAccess(returnPath);

  try {
    const parsed = roomMergeSchema.parse({
      sourceRoomId: formData.get("sourceRoomId"),
      targetRoomId: formData.get("targetRoomId"),
    });

    await mergePackageRooms({
      sourceRoomId: parsed.sourceRoomId,
      targetRoomId: parsed.targetRoomId,
      actorId: "admin",
    });
    revalidatePaths(["/admin/rooms", "/admin/enrollments", "/dashboard"]);
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Өрөөнүүдийг нэгтгэх үед алдаа гарлаа."));
  }

  redirectWithMessage(returnPath, "success", "Өрөөнүүдийг нэгтгэлээ.");
}
