import {
  AccountSize,
  ApplicantStatus,
  Prisma,
  RoomLifecycleStatus,
  RoomPublicStatus,
} from "@prisma/client";

import { APPLY_RATE_LIMIT_PER_HOUR } from "@/lib/constants";
import { db } from "@/lib/db";
import { sendRoomReadyNotifications, sendSignupNotifications } from "@/server/services/notification-service";
import { ensureOpenSignupRoom } from "@/server/services/room-service";

const ACTIVE_SIGNUP_STATUSES = [
  ApplicantStatus.PENDING,
  ApplicantStatus.ACCEPTED,
  ApplicantStatus.ASSIGNED,
  ApplicantStatus.INVITATION_SENT,
] as const;

export async function listApplicants(accountSize?: AccountSize) {
  return db.applicant.findMany({
    where: accountSize ? { desiredAccountSize: accountSize } : undefined,
    include: {
      room: true,
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getApplicantBuckets() {
  const applicants = await listApplicants();

  return Object.values(AccountSize).map((size) => {
    const sizeApplicants = applicants.filter((applicant) => applicant.desiredAccountSize === size);
    const openRoomApplicants = sizeApplicants.filter(
      (item) => item.status !== ApplicantStatus.REJECTED && item.room?.lifecycleStatus === RoomLifecycleStatus.SIGNUP_OPEN,
    );
    const readyRoomApplicants = sizeApplicants.filter(
      (item) => item.status !== ApplicantStatus.REJECTED && item.room?.lifecycleStatus === RoomLifecycleStatus.READY_TO_START,
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
    throw new Error("Too many attempts. Please wait and try again.");
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
          lifecycleStatus: RoomLifecycleStatus.SIGNUP_OPEN,
          publicStatus: RoomPublicStatus.PUBLIC,
        },
        include: {
          applicants: {
            where: {
              status: {
                not: ApplicantStatus.REJECTED,
              },
            },
            select: { id: true },
          },
        },
      });

      if (!room) {
        throw new Error("This room is closed for signup.");
      }

      if (room.applicants.length >= room.maxTraderCapacity) {
        throw new Error("This room is already full. Choose a different room.");
      }

      const existingApplicant = await tx.applicant.findFirst({
        where: {
          clerkUserId: input.clerkUserId,
          desiredAccountSize: room.accountSize,
          status: {
            in: [...ACTIVE_SIGNUP_STATUSES],
          },
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
        throw new Error(`You already have an active signup for ${existingApplicant.room?.title ?? "this account size"}.`);
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
            lifecycleStatus: RoomLifecycleStatus.READY_TO_START,
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
