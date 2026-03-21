import {
  ApplicantStatus,
  Prisma,
  RoomPublicStatus,
  type AccountSize,
} from "@prisma/client";

import { APPLY_RATE_LIMIT_PER_HOUR } from "@/lib/constants";
import { db } from "@/lib/db";
import { ACCOUNT_SIZE_OPTIONS, ROOM_LIFECYCLE_STATUS } from "@/lib/prisma-enums";
import { sendRoomReadyNotifications, sendSignupNotifications } from "@/server/services/notification-service";
import { ensureOpenSignupRoom } from "@/server/services/room-service";

const ACTIVE_SIGNUP_STATUSES = [
  ApplicantStatus.PENDING,
  ApplicantStatus.ACCEPTED,
  ApplicantStatus.ASSIGNED,
  ApplicantStatus.INVITATION_SENT,
] as const;

export type ApplicantListView = "active" | "trash";

export async function listApplicants(accountSize?: AccountSize, view: ApplicantListView = "active") {
  return db.applicant.findMany({
    where: {
      ...(accountSize ? { desiredAccountSize: accountSize } : {}),
      trashedAt: view === "trash" ? { not: null } : null,
    },
    include: {
      room: true,
      comments: {
        include: {
          adminUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      },
    },
    orderBy: view === "trash" ? [{ trashedAt: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }],
  });
}

export async function getApplicantBuckets() {
  const applicants = await listApplicants(undefined, "active");

  return ACCOUNT_SIZE_OPTIONS.map((size) => {
    const sizeApplicants = applicants.filter((applicant) => applicant.desiredAccountSize === size);
    const openRoomApplicants = sizeApplicants.filter(
      (item) => item.status !== ApplicantStatus.REJECTED && item.room?.lifecycleStatus === ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN,
    );
    const readyRoomApplicants = sizeApplicants.filter(
      (item) => item.status !== ApplicantStatus.REJECTED && item.room?.lifecycleStatus === ROOM_LIFECYCLE_STATUS.READY_TO_START,
    );
    const contactedApplicants = sizeApplicants.filter((item) => item.status === ApplicantStatus.INVITATION_SENT);

    return {
      accountSize: size,
      total: sizeApplicants.length,
      active: openRoomApplicants.length,
      accepted: contactedApplicants.length,
      ready: readyRoomApplicants.length > 0,
      applicants: sizeApplicants,
    };
  });
}

export async function createApplicant(input: {
  clerkUserId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  telegramUsername: string;
  roomId: string;
  note?: string;
  ipAddress: string;
}) {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000);

  const recentAttempts = await db.submissionAttempt.count({
    where: {
      route: "/apply",
      ipAddress: input.ipAddress,
      createdAt: {
        gte: windowStart,
      },
    },
  });

  if (recentAttempts >= APPLY_RATE_LIMIT_PER_HOUR) {
    throw new Error("Хэт олон удаа оролдлоо. Түр хүлээгээд дахин оролдоно уу.");
  }

  await db.submissionAttempt.create({
    data: {
      route: "/apply",
      ipAddress: input.ipAddress,
      metadata: {
        email: input.email,
        roomId: input.roomId,
        clerkUserId: input.clerkUserId,
      },
    },
  });

  const result = await db.$transaction(
    async (tx) => {
      const room = await tx.challengeRoom.findFirst({
        where: {
          id: input.roomId,
          lifecycleStatus: ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN,
          publicStatus: RoomPublicStatus.PUBLIC,
        },
        include: {
          applicants: {
            where: {
              status: {
                not: ApplicantStatus.REJECTED,
              },
              trashedAt: null,
            },
            select: { id: true },
          },
        },
      });

      if (!room) {
        throw new Error("Энэ өрөөний бүртгэл хаагдсан байна.");
      }

      if (room.applicants.length >= room.maxTraderCapacity) {
        throw new Error("Энэ өрөө дүүрсэн байна. Өөр өрөө сонгоно уу.");
      }

      const existingApplicant = await tx.applicant.findFirst({
        where: {
          clerkUserId: input.clerkUserId,
          desiredAccountSize: room.accountSize,
          status: {
            in: [...ACTIVE_SIGNUP_STATUSES],
          },
          trashedAt: null,
        },
        include: {
          room: {
            select: {
              title: true,
            },
          },
        },
      });

      if (existingApplicant) {
        throw new Error(`Та ${existingApplicant.room?.title ?? "энэ ангилалд"} аль хэдийн идэвхтэй бүртгэлтэй байна.`);
      }

      const applicant = await tx.applicant.create({
        data: {
          clerkUserId: input.clerkUserId,
          fullName: input.fullName,
          email: input.email,
          phoneNumber: input.phoneNumber,
          telegramUsername: input.telegramUsername,
          desiredAccountSize: room.accountSize,
          roomId: room.id,
          note: input.note || null,
        },
      });

      const nextApplicantCount = room.applicants.length + 1;
      const roomJustFilled = nextApplicantCount >= room.maxTraderCapacity;

      if (roomJustFilled) {
        await tx.challengeRoom.update({
          where: { id: room.id },
          data: {
            lifecycleStatus: ROOM_LIFECYCLE_STATUS.READY_TO_START,
          },
        });
      }

      return { applicant, room, roomJustFilled };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  if (result.roomJustFilled) {
    await ensureOpenSignupRoom(result.room.accountSize, {
      description: result.room.description ?? undefined,
      entryFeeUsd: result.room.entryFeeUsd,
      maxTraderCapacity: result.room.maxTraderCapacity,
      step: result.room.step,
      updateTimes: result.room.updateTimes,
      updateTimezone: result.room.updateTimezone,
      allowExpiredUpdates: result.room.allowExpiredUpdates,
    });

    await sendRoomReadyNotifications(result.room.id);
  } else {
    await sendSignupNotifications(result.applicant.id);
  }

  return result.applicant;
}

export async function updateApplicantStatus(input: {
  applicantId: string;
  status: ApplicantStatus;
  roomId?: string;
}) {
  return db.applicant.update({
    where: { id: input.applicantId },
    data: {
      status: input.status,
      ...(input.roomId !== undefined ? { roomId: input.roomId || null } : {}),
      invitationSentAt: input.status === ApplicantStatus.INVITATION_SENT ? new Date() : undefined,
      joinedAt: input.status === ApplicantStatus.JOINED ? new Date() : undefined,
    },
  });
}

export async function addApplicantComment(input: {
  applicantId: string;
  adminUserId: string;
  body: string;
}) {
  const applicant = await db.applicant.findUnique({
    where: { id: input.applicantId },
    select: { id: true },
  });

  if (!applicant) {
    throw new Error("Applicant not found.");
  }

  return db.applicantComment.create({
    data: {
      applicantId: input.applicantId,
      adminUserId: input.adminUserId,
      body: input.body,
    },
  });
}

export async function moveApplicantToTrash(input: { applicantId: string }) {
  return db.applicant.update({
    where: { id: input.applicantId },
    data: {
      trashedAt: new Date(),
    },
  });
}

export async function restoreApplicantFromTrash(input: { applicantId: string }) {
  return db.applicant.update({
    where: { id: input.applicantId },
    data: {
      trashedAt: null,
    },
  });
}
