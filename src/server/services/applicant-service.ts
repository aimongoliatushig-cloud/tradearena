import {
  AccountSize,
  ApplicantStatus,
  NotificationChannel,
  NotificationKind,
  NotificationStatus,
  RoomLifecycleStatus,
  RoomPublicStatus,
} from "@prisma/client";
import nodemailer from "nodemailer";

import { APPLY_RATE_LIMIT_PER_HOUR } from "@/lib/constants";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendSignupNotifications } from "@/server/services/notification-service";
import { getInvitationTemplates } from "@/server/services/settings-service";

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
  const [applicants, templates] = await Promise.all([listApplicants(), getInvitationTemplates()]);

  return Object.values(AccountSize).map((size) => {
    const sizeApplicants = applicants.filter((applicant) => applicant.desiredAccountSize === size);
    const activeApplicants = sizeApplicants.filter((item) => item.status !== ApplicantStatus.REJECTED);
    const acceptedApplicants = sizeApplicants.filter(
      (item) =>
        item.status === ApplicantStatus.ACCEPTED ||
        item.status === ApplicantStatus.INVITATION_SENT ||
        item.status === ApplicantStatus.ASSIGNED ||
        item.status === ApplicantStatus.JOINED,
    );

    return {
      accountSize: size,
      total: sizeApplicants.length,
      active: activeApplicants.length,
      accepted: acceptedApplicants.length,
      ready: activeApplicants.length >= 10,
      applicants: sizeApplicants,
      template: templates,
    };
  });
}

export async function createApplicant(input: {
  fullName: string;
  email: string;
  phoneNumber: string;
  telegramUsername?: string;
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
    throw new Error("Түр хүлээнэ үү. Та хэт олон удаа илгээсэн байна.");
  }

  await db.submissionAttempt.create({
    data: {
      route: "/apply",
      ipAddress: input.ipAddress,
      metadata: {
        email: input.email,
        roomId: input.roomId,
      },
    },
  });

  const room = await db.challengeRoom.findFirst({
    where: {
      id: input.roomId,
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
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
    throw new Error("Сонгосон өрөө идэвхгүй эсвэл олдсонгүй.");
  }

  if (room.applicants.length >= room.maxTraderCapacity) {
    throw new Error("Сонгосон өрөө дүүрсэн байна. Өөр өрөө сонгоно уу.");
  }

  const applicant = await db.applicant.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      telegramUsername: input.telegramUsername || null,
      desiredAccountSize: room.accountSize,
      roomId: room.id,
      note: input.note || null,
    },
  });

  await sendSignupNotifications(applicant.id);

  return applicant;
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

function canSendEmail() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS);
}

function createTransporter() {
  if (!canSendEmail()) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export async function sendInvitationsByAccountSize(input: {
  accountSize: AccountSize;
  roomLink: string;
  subject: string;
  extraInstructions: string;
}) {
  const templates = await getInvitationTemplates();
  const applicants = await db.applicant.findMany({
    where: {
      desiredAccountSize: input.accountSize,
      status: ApplicantStatus.ACCEPTED,
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  if (applicants.length < 10) {
    throw new Error("Энэ ангилалд имэйл илгээхэд 10 зөвшөөрсөн өргөдөл бүрдээгүй байна.");
  }

  const transporter = createTransporter();

  for (const applicant of applicants) {
    const message = (templates.message || input.extraInstructions)
      .replace("{roomLink}", input.roomLink)
      .replace("{extraInstructions}", input.extraInstructions);

    let status: NotificationStatus = NotificationStatus.SKIPPED;
    let errorMessage: string | null = null;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: env.SMTP_FROM,
          to: applicant.email,
          subject: input.subject || templates.subject,
          text: message,
        });
        status = NotificationStatus.SENT;
      } catch (error) {
        status = NotificationStatus.FAILED;
        errorMessage = error instanceof Error ? error.message : "Имэйл илгээх алдаа.";
      }
    }

    await db.notificationDispatch.create({
      data: {
        applicantId: applicant.id,
        channel: NotificationChannel.EMAIL,
        kind: NotificationKind.ROOM_INVITATION,
        recipient: applicant.email,
        subject: input.subject || templates.subject,
        message,
        status,
        sentAt: status === NotificationStatus.SENT ? new Date() : null,
        errorMessage,
      },
    });

    if (applicant.telegramUsername) {
      await db.notificationDispatch.create({
        data: {
          applicantId: applicant.id,
          channel: NotificationChannel.TELEGRAM,
          kind: NotificationKind.ROOM_INVITATION,
          recipient: applicant.telegramUsername,
          subject: "Telegram бэлэн",
          message,
          status: NotificationStatus.SKIPPED,
          errorMessage: "Telegram Bot API бүтэц бэлэн, v1 дээр автоматаар илгээгээгүй.",
        },
      });
    }

    await db.applicant.update({
      where: { id: applicant.id },
      data: {
        status: ApplicantStatus.INVITATION_SENT,
        invitationSentAt: new Date(),
      },
    });
  }

  return applicants.length;
}
