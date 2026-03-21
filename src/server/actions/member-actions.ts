"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { courseProgressSchema, enrollmentDecisionSchema, manualPaymentSubmissionSchema } from "@/lib/package-validators";
import { setCourseProgress } from "@/server/services/course-service";
import { getCurrentEnrollmentForUser, hasConfirmedPaymentAccess, recordEnrollmentDecision, submitManualPayment } from "@/server/services/enrollment-service";

function redirectWithMessage(pathname: string, type: "success" | "error", message: string): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`${pathname}?${params.toString()}`);
}

export async function submitManualPaymentAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/packages");
  }

  const user = await currentUser();

  try {
    const parsed = manualPaymentSubmissionSchema.parse({
      enrollmentId: formData.get("enrollmentId"),
      reference: formData.get("reference"),
      proofNote: formData.get("proofNote") || undefined,
      proofUrl: formData.get("proofUrl") || undefined,
    });

    await submitManualPayment({
      clerkUserId: userId,
      enrollmentId: parsed.enrollmentId,
      reference: parsed.reference,
      proofNote: parsed.proofNote,
      proofUrl: parsed.proofUrl,
      customerName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || undefined,
      customerEmail: user?.primaryEmailAddress?.emailAddress || undefined,
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/enrollments");
  } catch (error) {
    redirectWithMessage(
      "/dashboard",
      "error",
      error instanceof Error ? error.message : "Төлбөрийн мэдээлэл хадгалах үед алдаа гарлаа.",
    );
  }

  redirectWithMessage("/dashboard", "success", "Төлбөрийн мэдээллийг хүлээн авлаа. Админ шалгаж баталгаажуулна.");
}

export async function recordEnrollmentDecisionAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/packages");
  }

  try {
    const parsed = enrollmentDecisionSchema.parse({
      enrollmentId: formData.get("enrollmentId"),
      decision: formData.get("decision"),
    });

    await recordEnrollmentDecision({
      clerkUserId: userId,
      enrollmentId: parsed.enrollmentId,
      decision: parsed.decision,
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/rooms");
  } catch (error) {
    redirectWithMessage("/dashboard", "error", error instanceof Error ? error.message : "Сонголт хадгалах үед алдаа гарлаа.");
  }

  redirectWithMessage("/dashboard", "success", "Таны сонголт хадгалагдлаа.");
}

export async function saveCourseProgressAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/packages");
  }

  try {
    const parsed = courseProgressSchema.parse({
      courseId: formData.get("courseId"),
      percentComplete: formData.get("percentComplete"),
    });

    const enrollment = await getCurrentEnrollmentForUser(userId);

    if (!hasConfirmedPaymentAccess(enrollment)) {
      redirectWithMessage("/dashboard", "error", "Төлбөр баталгаажсаны дараа сургалтын явц хадгалагдана.");
    }

    await setCourseProgress({
      clerkUserId: userId,
      courseId: parsed.courseId,
      percentComplete: parsed.percentComplete,
      enrollmentId: enrollment?.id,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/courses/${String(formData.get("courseSlug") || "")}`);
  } catch (error) {
    redirectWithMessage("/dashboard", "error", error instanceof Error ? error.message : "Явц хадгалах үед алдаа гарлаа.");
  }

  redirectWithMessage(
    `/dashboard/courses/${String(formData.get("courseSlug") || "")}`,
    "success",
    "Явц амжилттай хадгалагдлаа.",
  );
}
