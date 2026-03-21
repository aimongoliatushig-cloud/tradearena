import {
  type AccountSize,
  ChallengeStep,
  EnrollmentAuditType,
  EnrollmentDecisionChoice,
  NotificationChannel,
  NotificationStatus,
  PackageEnrollmentStatus,
  PaymentProvider,
  PaymentStatus,
  RoomLifecycleStatus,
  RoomPublicStatus,
  type Prisma,
} from "@prisma/client";

import { PACKAGE_ROOM_DECISION_WINDOW_HOURS } from "@/lib/constants";
import { db } from "@/lib/db";
import { NOTIFICATION_KIND } from "@/lib/prisma-enums";
import { notifyTeamAboutProgramSignup } from "@/server/services/notification-service";

const ACTIVE_ROOM_MEMBER_STATUSES = [PackageEnrollmentStatus.ENROLLED, PackageEnrollmentStatus.AWAITING_DECISION] as const;
const OPEN_ENROLLMENT_STATUSES = [
  PackageEnrollmentStatus.PENDING_PAYMENT,
  PackageEnrollmentStatus.PENDING_CONFIRMATION,
  PackageEnrollmentStatus.ENROLLED,
  PackageEnrollmentStatus.AWAITING_DECISION,
] as const;
const INTERACTIVE_TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 20_000,
} as const;

function buildApplicantLookupKey(clerkUserId: string, accountSize: AccountSize) {
  return `${clerkUserId}:${accountSize}`;
}

function getAdminPaymentState(status: PaymentStatus | null | undefined) {
  return status === PaymentStatus.CONFIRMED ? "paid" : "pending";
}

function getPendingPaymentStatus(payment: {
  reference?: string | null;
  proofNote?: string | null;
  proofUrl?: string | null;
  submittedAt?: Date | null;
}) {
  return payment.reference || payment.proofNote || payment.proofUrl || payment.submittedAt
    ? PaymentStatus.PENDING_CONFIRMATION
    : PaymentStatus.PENDING_SUBMISSION;
}

function getPendingEnrollmentStatus(status: PaymentStatus) {
  return status === PaymentStatus.PENDING_CONFIRMATION
    ? PackageEnrollmentStatus.PENDING_CONFIRMATION
    : PackageEnrollmentStatus.PENDING_PAYMENT;
}

export function hasConfirmedPaymentAccess(
  enrollment: {
    payment?: {
      status: PaymentStatus;
    } | null;
  } | null | undefined,
) {
  return enrollment?.payment?.status === PaymentStatus.CONFIRMED;
}

function getDecisionDeadline(base = new Date()) {
  return new Date(base.getTime() + PACKAGE_ROOM_DECISION_WINDOW_HOURS * 60 * 60 * 1000);
}

function buildPackageRoomTitle(packageName: string, roomSequence: number) {
  return `${packageName} Өрөө ${roomSequence}`;
}

function buildPackageRoomSlug(packageSlug: string, roomSequence: number) {
  return `${packageSlug}-room-${roomSequence}`;
}

async function createAuditLog(
  tx: Prisma.TransactionClient,
  input: {
    enrollmentId: string;
    type: EnrollmentAuditType;
    message: string;
    actorId?: string;
    fromRoomId?: string | null;
    toRoomId?: string | null;
  },
) {
  await tx.enrollmentAuditLog.create({
    data: {
      enrollmentId: input.enrollmentId,
      type: input.type,
      message: input.message,
      actorId: input.actorId ?? null,
      fromRoomId: input.fromRoomId ?? null,
      toRoomId: input.toRoomId ?? null,
    },
  });
}

async function logEnrollmentNotification(input: {
  recipient: string;
  subject: string;
  message: string;
  roomId?: string | null;
}) {
  await db.notificationDispatch.create({
    data: {
      roomId: input.roomId ?? null,
      channel: NotificationChannel.EMAIL,
      kind: NOTIFICATION_KIND.GENERAL_UPDATE,
      recipient: input.recipient,
      subject: input.subject,
      message: input.message,
      status: NotificationStatus.SKIPPED,
      errorMessage: "Гишүүний мэдэгдлийг системд тэмдэглэл хэлбэрээр хадгаллаа.",
    },
  });
}

async function countRoomMembers(tx: Prisma.TransactionClient, roomId: string) {
  return tx.packageEnrollment.count({
    where: {
      roomId,
      status: {
        in: [...ACTIVE_ROOM_MEMBER_STATUSES],
      },
    },
  });
}

async function syncPackageRoomStatus(tx: Prisma.TransactionClient, roomId: string) {
  const room = await tx.challengeRoom.findUnique({
    where: { id: roomId },
    select: {
      id: true,
      isPackageRoom: true,
      lifecycleStatus: true,
      maxTraderCapacity: true,
    },
  });

  if (!room?.isPackageRoom) {
    return;
  }

  const activeCount = await countRoomMembers(tx, roomId);

  if (activeCount >= room.maxTraderCapacity) {
    await tx.challengeRoom.update({
      where: { id: roomId },
      data: {
        lifecycleStatus: RoomLifecycleStatus.READY_TO_START,
        decisionDeadlineAt: null,
      },
    });
    return;
  }

  if (activeCount === 0) {
    await tx.challengeRoom.update({
      where: { id: roomId },
      data: {
        lifecycleStatus: RoomLifecycleStatus.ARCHIVED,
        decisionDeadlineAt: null,
      },
    });
    return;
  }

  if (room.lifecycleStatus !== RoomLifecycleStatus.AWAITING_DECISION) {
    await tx.challengeRoom.update({
      where: { id: roomId },
      data: {
        lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
      },
    });
  }
}

async function createPackageRoom(tx: Prisma.TransactionClient, packageTierId: string) {
  const packageTier = await tx.packageTier.findUnique({
    where: { id: packageTierId },
  });

  if (!packageTier) {
    throw new Error("Багц олдсонгүй.");
  }

  const latestRoom = await tx.challengeRoom.findFirst({
    where: {
      isPackageRoom: true,
      packageTierId,
    },
    orderBy: [{ roomSequence: "desc" }, { createdAt: "desc" }],
    select: {
      roomSequence: true,
    },
  });

  const roomSequence = (latestRoom?.roomSequence ?? 0) + 1;
  const now = new Date();

  return tx.challengeRoom.create({
    data: {
      title: buildPackageRoomTitle(packageTier.nameMn, roomSequence),
      slug: buildPackageRoomSlug(packageTier.slug, roomSequence),
      description: `${packageTier.nameMn} багцын гишүүдийн өрөө`,
      accountSize: packageTier.accountSize,
      step: ChallengeStep.STEP_1,
      entryFeeUsd: packageTier.priceUsd,
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      publicStatus: RoomPublicStatus.HIDDEN,
      lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
      maxTraderCapacity: packageTier.maxUsers,
      updateTimes: [],
      updateTimezone: "Asia/Ulaanbaatar",
      allowExpiredUpdates: false,
      isPackageRoom: true,
      packageTierId: packageTier.id,
      roomSequence,
      decisionDeadlineAt: getDecisionDeadline(now),
    },
  });
}

async function findAssignableRoom(tx: Prisma.TransactionClient, packageTierId: string) {
  const rooms = await tx.challengeRoom.findMany({
    where: {
      isPackageRoom: true,
      packageTierId,
      lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
    },
    orderBy: [{ roomSequence: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      maxTraderCapacity: true,
    },
  });

  for (const room of rooms) {
    const activeCount = await countRoomMembers(tx, room.id);
    if (activeCount < room.maxTraderCapacity) {
      return room;
    }
  }

  return null;
}

async function moveEnrollment(tx: Prisma.TransactionClient, input: {
  actorId?: string;
  enrollmentId: string;
  targetRoomId: string;
  note: string;
}) {
  const enrollment = await tx.packageEnrollment.findUnique({
    where: { id: input.enrollmentId },
    include: {
      room: true,
      packageTier: true,
    },
  });

  if (!enrollment) {
    throw new Error("Элсэлт олдсонгүй.");
  }

  const targetRoom = await tx.challengeRoom.findUnique({
    where: { id: input.targetRoomId },
    include: {
      packageTier: true,
    },
  });

  if (!targetRoom?.isPackageRoom) {
    throw new Error("Зөвхөн багцын өрөө рүү шилжүүлнэ.");
  }

  if (targetRoom.packageTierId !== enrollment.packageTierId) {
    throw new Error("Өөр багцын өрөө рүү шилжүүлэх боломжгүй.");
  }

  const activeCount = await countRoomMembers(tx, targetRoom.id);
  if (activeCount >= targetRoom.maxTraderCapacity) {
    throw new Error("Сонгосон өрөө дүүрсэн байна.");
  }

  const previousRoomId = enrollment.roomId;

  const updated = await tx.packageEnrollment.update({
    where: { id: enrollment.id },
    data: {
      roomId: targetRoom.id,
      status: PackageEnrollmentStatus.ENROLLED,
      unlockedAt: enrollment.unlockedAt ?? new Date(),
    },
  });

  await createAuditLog(tx, {
    enrollmentId: enrollment.id,
    type: previousRoomId ? EnrollmentAuditType.ROOM_MOVED : EnrollmentAuditType.ROOM_ASSIGNED,
    message: input.note,
    actorId: input.actorId,
    fromRoomId: previousRoomId,
    toRoomId: targetRoom.id,
  });

  if (previousRoomId) {
    await syncPackageRoomStatus(tx, previousRoomId);
  }
  await syncPackageRoomStatus(tx, targetRoom.id);

  return updated;
}

export async function evaluateUnderfilledPackageRooms(now = new Date()) {
  const rooms = await db.challengeRoom.findMany({
    where: {
      isPackageRoom: true,
      lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
      decisionDeadlineAt: {
        lte: now,
      },
    },
    include: {
      packageTier: true,
      packageEnrollments: {
        where: {
          status: PackageEnrollmentStatus.ENROLLED,
        },
        include: {
          payment: true,
        },
      },
    },
    orderBy: [{ roomSequence: "asc" }, { createdAt: "asc" }],
  });

  for (const room of rooms) {
    if (room.packageEnrollments.length >= room.maxTraderCapacity) {
      await db.challengeRoom.update({
        where: { id: room.id },
        data: {
          lifecycleStatus: RoomLifecycleStatus.READY_TO_START,
          decisionDeadlineAt: null,
        },
      });
      continue;
    }

    await db.$transaction(async (tx) => {
      await tx.challengeRoom.update({
        where: { id: room.id },
        data: {
          lifecycleStatus: RoomLifecycleStatus.AWAITING_DECISION,
        },
      });

      await tx.packageEnrollment.updateMany({
        where: {
          roomId: room.id,
          status: PackageEnrollmentStatus.ENROLLED,
        },
        data: {
          status: PackageEnrollmentStatus.AWAITING_DECISION,
        },
      });

      for (const enrollment of room.packageEnrollments) {
        await createAuditLog(tx, {
          enrollmentId: enrollment.id,
          type: EnrollmentAuditType.NOTE,
          message: `${room.title} 48 цагийн дотор дүүрээгүй тул шийдвэр сонгох төлөвт шилжлээ.`,
          fromRoomId: room.id,
        });
      }
    });

    for (const enrollment of room.packageEnrollments) {
      const recipient = enrollment.payment?.customerEmail;
      if (!recipient) {
        continue;
      }

      await logEnrollmentNotification({
        recipient,
        roomId: room.id,
        subject: `${room.title} шийдвэр шаардлагатай`,
        message: `Таны ${room.title} 48 цагийн дотор дүүрээгүй тул "Нэгтгэх" эсвэл "Хүлээх" сонголтоос нэгийг хийнэ үү.`,
      });
    }
  }
}

export async function createCheckoutEnrollment(input: {
  clerkUserId: string;
  packageSlug: string;
  customerName?: string;
  customerEmail?: string;
}) {
  await evaluateUnderfilledPackageRooms();

  const packageTier = await db.packageTier.findFirst({
    where: {
      slug: input.packageSlug,
      isActive: true,
    },
  });

  if (!packageTier) {
    throw new Error("Сонгосон багц олдсонгүй.");
  }

  const existing = await db.packageEnrollment.findFirst({
    where: {
      clerkUserId: input.clerkUserId,
      status: {
        in: [...OPEN_ENROLLMENT_STATUSES],
      },
    },
    include: {
      payment: true,
      packageTier: true,
      room: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    if (existing.packageTier.slug !== input.packageSlug) {
      throw new Error("Та одоогоор өөр идэвхтэй багцтай байна.");
    }

    return existing;
  }

  const enrollment = await db.$transaction(async (tx) => {
    const payment = await tx.paymentRecord.create({
      data: {
        clerkUserId: input.clerkUserId,
        packageTierId: packageTier.id,
        customerName: input.customerName ?? null,
        customerEmail: input.customerEmail ?? null,
        provider: PaymentProvider.MANUAL,
        status: PaymentStatus.PENDING_SUBMISSION,
        amountUsd: packageTier.priceUsd,
        currency: "USD",
      },
    });

    const enrollment = await tx.packageEnrollment.create({
      data: {
        clerkUserId: input.clerkUserId,
        packageTierId: packageTier.id,
        paymentId: payment.id,
        status: PackageEnrollmentStatus.PENDING_PAYMENT,
      },
      include: {
        payment: true,
        packageTier: true,
        room: true,
      },
    });

    await createAuditLog(tx, {
      enrollmentId: enrollment.id,
      type: EnrollmentAuditType.CREATED,
      message: `${packageTier.nameMn} багцын checkout эхэллээ.`,
    });

    return enrollment;
  });

  await notifyTeamAboutProgramSignup({
    clerkUserId: input.clerkUserId,
    enrollmentId: enrollment.id,
    packageName: enrollment.packageTier.nameMn,
    packageSlug: enrollment.packageTier.slug,
    customerName: enrollment.payment?.customerName ?? input.customerName ?? null,
    customerEmail: enrollment.payment?.customerEmail ?? input.customerEmail ?? null,
  });

  return enrollment;
}

export async function submitManualPayment(input: {
  clerkUserId: string;
  enrollmentId: string;
  reference: string;
  proofNote?: string;
  proofUrl?: string;
  customerName?: string;
  customerEmail?: string;
}) {
  const enrollment = await db.packageEnrollment.findUnique({
    where: { id: input.enrollmentId },
    include: {
      payment: true,
      packageTier: true,
    },
  });

  if (!enrollment || enrollment.clerkUserId !== input.clerkUserId) {
    throw new Error("Элсэлтийн мэдээлэл олдсонгүй.");
  }

  if (!enrollment.paymentId) {
    throw new Error("Төлбөрийн мэдээлэл дутуу байна.");
  }

  await db.$transaction(async (tx) => {
    await tx.paymentRecord.update({
      where: { id: enrollment.paymentId! },
      data: {
        customerName: input.customerName ?? enrollment.payment?.customerName ?? null,
        customerEmail: input.customerEmail ?? enrollment.payment?.customerEmail ?? null,
        reference: input.reference,
        proofNote: input.proofNote || null,
        proofUrl: input.proofUrl || null,
        status: PaymentStatus.PENDING_CONFIRMATION,
        submittedAt: new Date(),
      },
    });

    await tx.packageEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: PackageEnrollmentStatus.PENDING_CONFIRMATION,
      },
    });

    await createAuditLog(tx, {
      enrollmentId: enrollment.id,
      type: EnrollmentAuditType.PAYMENT_SUBMITTED,
      message: `${enrollment.packageTier.nameMn} багцын төлбөрийн мэдээлэл илгээгдлээ.`,
    });
  });

  return getCurrentEnrollmentForUser(input.clerkUserId);
}

export async function confirmPaymentAndEnroll(input: { paymentId: string; actorId?: string }) {
  await evaluateUnderfilledPackageRooms();

  return db.$transaction(async (tx) => {
    const payment = await tx.paymentRecord.findUnique({
      where: { id: input.paymentId },
      include: {
        packageTier: true,
        enrollment: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!payment?.enrollment) {
      throw new Error("Төлбөртэй холбогдсон элсэлт олдсонгүй.");
    }

    const enrollment = payment.enrollment;

    if (payment.status === PaymentStatus.CONFIRMED && enrollment.status === PackageEnrollmentStatus.ENROLLED) {
      return enrollment;
    }

    await tx.paymentRecord.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CONFIRMED,
        confirmedAt: payment.confirmedAt ?? new Date(),
      },
    });

    await createAuditLog(tx, {
      enrollmentId: enrollment.id,
      type: EnrollmentAuditType.PAYMENT_CONFIRMED,
      message: `${payment.packageTier.nameMn} багцын төлбөр баталгаажлаа.`,
      actorId: input.actorId,
    });

    const assignableRoom = (await findAssignableRoom(tx, payment.packageTierId)) ?? (await createPackageRoom(tx, payment.packageTierId));

    const updatedEnrollment = await moveEnrollment(tx, {
      enrollmentId: enrollment.id,
      targetRoomId: assignableRoom.id,
      actorId: input.actorId,
      note: `${payment.packageTier.nameMn} багцын төлбөр баталгаажсаны дараа өрөөнд автоматаар оноов.`,
    });

    return tx.packageEnrollment.findUnique({
      where: { id: updatedEnrollment.id },
      include: {
        payment: true,
        packageTier: true,
        room: true,
      },
    });
  }, INTERACTIVE_TRANSACTION_OPTIONS);
}

export async function markPaymentAsUnpaid(input: { paymentId: string; actorId?: string }) {
  await evaluateUnderfilledPackageRooms();

  return db.$transaction(async (tx) => {
    const payment = await tx.paymentRecord.findUnique({
      where: { id: input.paymentId },
      include: {
        packageTier: true,
        enrollment: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!payment?.enrollment) {
      throw new Error("Ð¢Ó©Ð»Ð±Ó©Ñ€Ñ‚ÑÐ¹ Ñ…Ð¾Ð»Ð±Ð¾Ð³Ð´ÑÐ¾Ð½ ÑÐ»ÑÑÐ»Ñ‚ Ð¾Ð»Ð´ÑÐ¾Ð½Ð³Ò¯Ð¹.");
    }

    const enrollment = payment.enrollment;
    const nextPaymentStatus = getPendingPaymentStatus(payment);
    const nextEnrollmentStatus = getPendingEnrollmentStatus(nextPaymentStatus);
    const previousRoomId = enrollment.roomId;

    await tx.paymentRecord.update({
      where: { id: payment.id },
      data: {
        status: nextPaymentStatus,
        confirmedAt: null,
      },
    });

    await tx.packageEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: nextEnrollmentStatus,
        roomId: null,
        unlockedAt: null,
        decisionChoice: null,
        decidedAt: null,
      },
    });

    await createAuditLog(tx, {
      enrollmentId: enrollment.id,
      type: EnrollmentAuditType.NOTE,
      message: `${payment.packageTier.nameMn} payment was returned to unpaid status by admin.`,
      actorId: input.actorId,
      fromRoomId: previousRoomId,
    });

    if (previousRoomId) {
      await syncPackageRoomStatus(tx, previousRoomId);
    }

    return tx.packageEnrollment.findUnique({
      where: { id: enrollment.id },
      include: {
        payment: true,
        packageTier: true,
        room: true,
      },
    });
  }, INTERACTIVE_TRANSACTION_OPTIONS);
}

export async function getCurrentEnrollmentForUser(clerkUserId: string) {
  await evaluateUnderfilledPackageRooms();

  return db.packageEnrollment.findFirst({
    where: {
      clerkUserId,
      status: {
        in: [...OPEN_ENROLLMENT_STATUSES],
      },
    },
    include: {
      payment: true,
      packageTier: true,
      room: {
        include: {
          packageEnrollments: {
            where: {
              status: {
                in: [...ACTIVE_ROOM_MEMBER_STATUSES],
              },
            },
            select: {
              id: true,
            },
          },
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function listAdminEnrollments(filters?: {
  query?: string;
  paymentState?: "all" | "pending" | "paid";
}) {
  await evaluateUnderfilledPackageRooms();

  const enrollments = await db.packageEnrollment.findMany({
    include: {
      packageTier: true,
      room: true,
      payment: true,
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
  });

  const clerkUserIds = [...new Set(enrollments.map((item) => item.clerkUserId))];
  const applicants = clerkUserIds.length
    ? await db.applicant.findMany({
        where: {
          clerkUserId: {
            in: clerkUserIds,
          },
        },
        select: {
          id: true,
          clerkUserId: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          telegramUsername: true,
          desiredAccountSize: true,
          note: true,
          status: true,
          createdAt: true,
          room: {
            select: {
              title: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      })
    : [];

  const applicantByEnrollmentKey = new Map<string, (typeof applicants)[number]>();
  for (const applicant of applicants) {
    if (!applicant.clerkUserId) {
      continue;
    }

    const key = buildApplicantLookupKey(applicant.clerkUserId, applicant.desiredAccountSize);
    if (!applicantByEnrollmentKey.has(key)) {
      applicantByEnrollmentKey.set(key, applicant);
    }
  }

  let results = enrollments.map((enrollment) => {
    const applicant =
      applicantByEnrollmentKey.get(buildApplicantLookupKey(enrollment.clerkUserId, enrollment.packageTier.accountSize)) ?? null;
    const appliedAt = applicant?.createdAt ?? enrollment.createdAt;

    return {
      ...enrollment,
      applicant,
      appliedAt,
    };
  });

  if (filters?.paymentState && filters.paymentState !== "all") {
    results = results.filter((enrollment) => getAdminPaymentState(enrollment.payment?.status) === filters.paymentState);
  }

  const normalizedQuery = filters?.query?.trim().toLowerCase();
  if (normalizedQuery) {
    results = results.filter((enrollment) => {
      const haystack = [
        enrollment.applicant?.fullName,
        enrollment.applicant?.email,
        enrollment.applicant?.phoneNumber,
        enrollment.applicant?.telegramUsername,
        enrollment.payment?.customerName,
        enrollment.payment?.customerEmail,
        enrollment.payment?.reference,
        enrollment.clerkUserId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }

  return results.sort((left, right) => {
    const appliedDifference = new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime();
    if (appliedDifference !== 0) {
      return appliedDifference;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

export async function listPackageRoomsForAdmin() {
  await evaluateUnderfilledPackageRooms();

  const rooms = await db.challengeRoom.findMany({
    where: {
      isPackageRoom: true,
    },
    include: {
      packageTier: true,
      packageEnrollments: {
        where: {
          status: {
            in: [...ACTIVE_ROOM_MEMBER_STATUSES, PackageEnrollmentStatus.PENDING_CONFIRMATION],
          },
        },
        include: {
          payment: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ packageTier: { sortOrder: "asc" } }, { roomSequence: "asc" }],
  });

  return rooms.map((room) => ({
    ...room,
    activeCount: room.packageEnrollments.filter(
      (item) => item.status === PackageEnrollmentStatus.ENROLLED || item.status === PackageEnrollmentStatus.AWAITING_DECISION,
    ).length,
    pendingConfirmationCount: room.packageEnrollments.filter((item) => item.status === PackageEnrollmentStatus.PENDING_CONFIRMATION).length,
  }));
}

export async function recordEnrollmentDecision(input: {
  clerkUserId: string;
  enrollmentId: string;
  decision: EnrollmentDecisionChoice;
}) {
  await evaluateUnderfilledPackageRooms();

  const enrollment = await db.packageEnrollment.findUnique({
    where: { id: input.enrollmentId },
    include: {
      room: true,
      packageTier: true,
    },
  });

  if (!enrollment || enrollment.clerkUserId !== input.clerkUserId) {
    throw new Error("Элсэлтийн мэдээлэл олдсонгүй.");
  }

  if (!enrollment.roomId) {
    throw new Error("Өрөө оноогдоогүй байна.");
  }

  if (input.decision === EnrollmentDecisionChoice.WAIT) {
    return db.$transaction(async (tx) => {
      const updated = await tx.packageEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: PackageEnrollmentStatus.ENROLLED,
          decisionChoice: EnrollmentDecisionChoice.WAIT,
          decidedAt: new Date(),
        },
      });

      await tx.challengeRoom.update({
        where: { id: enrollment.roomId! },
        data: {
          lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
          decisionDeadlineAt: getDecisionDeadline(),
        },
      });

      await createAuditLog(tx, {
        enrollmentId: enrollment.id,
        type: EnrollmentAuditType.WAIT_SELECTED,
        message: `${enrollment.room?.title ?? "Өрөө"} дээр хүлээх сонголт хийлээ.`,
        fromRoomId: enrollment.roomId,
      });

      return updated;
    });
  }

  return db.$transaction(async (tx) => {
    const candidateRoom =
      (await findAssignableRoom(tx, enrollment.packageTierId)) ??
      (await createPackageRoom(tx, enrollment.packageTierId));

    const updated = await moveEnrollment(tx, {
      enrollmentId: enrollment.id,
      targetRoomId: candidateRoom.id,
      note: `${enrollment.packageTier.nameMn} багцын ижил төрлийн өрөө рүү нэгтгэлээ.`,
    });

    await tx.packageEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: PackageEnrollmentStatus.ENROLLED,
        decisionChoice: EnrollmentDecisionChoice.MERGE,
        decidedAt: new Date(),
      },
    });

    await createAuditLog(tx, {
      enrollmentId: enrollment.id,
      type: EnrollmentAuditType.MERGE_SELECTED,
      message: "Гишүүн ижил багцын өөр өрөөтэй нэгтгэх сонголт хийлээ.",
      fromRoomId: enrollment.roomId,
      toRoomId: candidateRoom.id,
    });

    return updated;
  });
}

export async function moveEnrollmentToRoom(input: { enrollmentId: string; roomId: string; actorId?: string }) {
  return db.$transaction(async (tx) =>
    moveEnrollment(tx, {
      enrollmentId: input.enrollmentId,
      targetRoomId: input.roomId,
      actorId: input.actorId,
      note: "Админ гараар өрөө сольсон.",
    }),
  );
}

export async function mergePackageRooms(input: { sourceRoomId: string; targetRoomId: string; actorId?: string }) {
  return db.$transaction(async (tx) => {
    const [sourceRoom, targetRoom] = await Promise.all([
      tx.challengeRoom.findUnique({
        where: { id: input.sourceRoomId },
      }),
      tx.challengeRoom.findUnique({
        where: { id: input.targetRoomId },
      }),
    ]);

    if (!sourceRoom?.isPackageRoom || !targetRoom?.isPackageRoom) {
      throw new Error("Зөвхөн багцын өрөөнүүдийг нэгтгэнэ.");
    }

    if (sourceRoom.packageTierId !== targetRoom.packageTierId) {
      throw new Error("Ижил багцын өрөөнүүдийг л нэгтгэнэ.");
    }

    const sourceEnrollments = await tx.packageEnrollment.findMany({
      where: {
        roomId: sourceRoom.id,
        status: {
          in: [...ACTIVE_ROOM_MEMBER_STATUSES],
        },
      },
    });

    const targetActiveCount = await countRoomMembers(tx, targetRoom.id);
    if (targetActiveCount + sourceEnrollments.length > targetRoom.maxTraderCapacity) {
      throw new Error("Сонгосон зорилтот өрөөнд хангалттай суудал алга.");
    }

    for (const enrollment of sourceEnrollments) {
      await moveEnrollment(tx, {
        enrollmentId: enrollment.id,
        targetRoomId: targetRoom.id,
        actorId: input.actorId,
        note: "Админ хоёр өрөөг нэгтгэлээ.",
      });

      await createAuditLog(tx, {
        enrollmentId: enrollment.id,
        type: EnrollmentAuditType.ROOM_MERGED,
        message: "Элсэлт өөр өрөөтэй нэгтгэгдлээ.",
        actorId: input.actorId,
        fromRoomId: sourceRoom.id,
        toRoomId: targetRoom.id,
      });
    }

    await tx.challengeRoom.update({
      where: { id: sourceRoom.id },
      data: {
        lifecycleStatus: RoomLifecycleStatus.ARCHIVED,
        mergeTargetRoomId: targetRoom.id,
        decisionDeadlineAt: null,
      },
    });

    await syncPackageRoomStatus(tx, targetRoom.id);

    return targetRoom;
  });
}
