import { Prisma } from "@prisma/client";

export function getUserFacingErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const rawTarget = error.meta?.target;
      const targets =
        typeof rawTarget === "string"
          ? [rawTarget]
          : Array.isArray(rawTarget)
            ? rawTarget.map((value) => String(value))
            : [];

      if (targets.includes("metrixUrl")) {
        return "Энэ FTMO MetriX URL аль хэдийн өөр трейдер дээр бүртгэгдсэн байна.";
      }

      if (targets.includes("roomId") && targets.includes("fullName")) {
        return "Энэ өрөөнд ижил нэртэй трейдер аль хэдийн бүртгэлтэй байна.";
      }

      if (targets.includes("email")) {
        return "Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна.";
      }

      return "Давхардсан мэдээлэл илэрлээ. Өмнө нь бүртгэгдсэн эсэхийг шалгана уу.";
    }

    if (error.code === "P2025") {
      return "Хүссэн бүртгэл олдсонгүй эсвэл аль хэдийн өөрчлөгдсөн байна.";
    }

    if (error.code === "P1000") {
      return "Өгөгдлийн сантай холбогдох нэвтрэх мэдээлэл буруу байна.";
    }

    if (error.code === "P1001") {
      return "Өгөгдлийн сантай холбогдож чадсангүй.";
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("Invalid `") || error.message.includes("invocation in")) {
      return fallback;
    }

    return error.message;
  }

  return fallback;
}
