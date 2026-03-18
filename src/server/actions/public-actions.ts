"use server";

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { applicantFormSchema } from "@/lib/validators";
import type { ActionState } from "@/server/actions/action-state";
import { createApplicant } from "@/server/services/applicant-service";

function getClientIp(headerStore: Headers) {
  return headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || "127.0.0.1";
}

export async function submitApplicantAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const { userId } = await auth();

  if (!userId) {
    return {
      status: "error",
      message: "Please sign in before joining a room.",
    };
  }

  const parsed = applicantFormSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    telegramUsername: formData.get("telegramUsername"),
    roomId: formData.get("roomId"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please review the form fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const headerStore = await headers();
    await createApplicant({
      clerkUserId: userId,
      ...parsed.data,
      ipAddress: getClientIp(headerStore),
    });

    revalidatePath("/apply");
    revalidatePath("/admin/applicants");

    return {
      status: "success",
      message: "Your signup was received. When the room reaches 10 traders, we will email you to pay the entry fee and prepare to start.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to submit your signup.",
    };
  }
}
