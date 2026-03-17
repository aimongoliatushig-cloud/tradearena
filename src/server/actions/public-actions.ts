"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { applicantFormSchema } from "@/lib/validators";
import type { ActionState } from "@/server/actions/action-state";
import { createApplicant } from "@/server/services/applicant-service";

function getClientIp(headerStore: Headers) {
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function submitApplicantAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = applicantFormSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    telegramUsername: formData.get("telegramUsername") || undefined,
    desiredAccountSize: formData.get("desiredAccountSize"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Маягтын мэдээллээ шалгана уу.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const headerStore = await headers();
    await createApplicant({
      ...parsed.data,
      ipAddress: getClientIp(headerStore),
    });

    revalidatePath("/admin/applicants");

    return {
      status: "success",
      message: "Таны хүсэлтийг хүлээн авлаа. Админ удахгүй холбогдоно.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Илгээх үед алдаа гарлаа.",
    };
  }
}
