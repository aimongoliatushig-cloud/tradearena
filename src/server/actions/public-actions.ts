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
      message: "Өрөөнд бүртгүүлэхийн өмнө нэвтэрнэ үү.",
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
      message: "Маягтын талбаруудаа шалгана уу.",
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

    revalidatePath("/");
    revalidatePath("/apply");
    revalidatePath("/packages");
    revalidatePath("/admin/applicants");

    return {
      status: "success",
      message: "Таны бүртгэлийг хүлээн авлаа. Өрөө 10 трейдертэй болмогц орох хураамж төлөх болон эхлэх бэлтгэлийн мэдээллийг и-мэйлээр илгээнэ.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Бүртгэлийг илгээж чадсангүй.",
    };
  }
}
