import { ApplicantStatus, NotificationChannel, NotificationStatus, Prisma, type NotificationKind } from "@prisma/client";
import nodemailer, { type Transporter } from "nodemailer";

import { db } from "@/lib/db";
import { dayjs } from "@/lib/dayjs";
import { env } from "@/lib/env";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { leaderboardTraderOrderBy } from "@/lib/leaderboard";
import { accountSizeLabels, stepLabels } from "@/lib/labels";
import { NOTIFICATION_KIND } from "@/lib/prisma-enums";
import { formatUsd } from "@/lib/pricing";
import { getPaymentDetailsConfig, getRoomReadyEmailConfig } from "@/server/services/settings-service";

const ROOM_EMAIL_RECIPIENT_STATUSES = [
  ApplicantStatus.PENDING,
  ApplicantStatus.ACCEPTED,
  ApplicantStatus.ASSIGNED,
  ApplicantStatus.INVITATION_SENT,
  ApplicantStatus.JOINED,
] as const;

const TEAM_ALERT_RECIPIENTS = ["teamfirewfg@gmail.com", "aimongoliatushig@gmail.com"] as const;
const NEW_USER_ALERT_WINDOW_MS = 2 * 60 * 60 * 1000;
const PERFORMANCE_REPORT_TIMES = new Set(["09:00", "21:00"]);

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

function buildRoomUrl(slug: string) {
  return `${env.APP_BASE_URL.replace(/\/+$/, "")}/rooms/${slug}`;
}

function buildInternalAlertKey(type: string, uniqueId: string) {
  return `internal_alert:${type}:${uniqueId}`;
}

async function reserveInternalAlert(key: string, value: Record<string, unknown>) {
  try {
    await db.appSetting.create({
      data: {
        key,
        value: value as Prisma.InputJsonValue,
      },
    });

    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false;
    }

    throw error;
  }
}

async function sendTeamAlertEmails(input: {
  applicantId?: string;
  kind?: NotificationKind;
  message: string;
  roomId?: string;
  subject: string;
}) {
  const transporter = createTransporter();

  for (const recipient of TEAM_ALERT_RECIPIENTS) {
    await sendLoggedEmail({
      applicantId: input.applicantId,
      roomId: input.roomId,
      kind: input.kind ?? NOTIFICATION_KIND.GENERAL_UPDATE,
      recipient,
      subject: input.subject,
      message: input.message,
      transporter,
    });
  }
}

async function sendLoggedEmail(input: {
  applicantId?: string;
  kind: NotificationKind;
  message: string;
  recipient: string;
  roomId?: string;
  subject: string;
  transporter: Transporter | null;
}) {
  const { transporter, ...payload } = input;

  let status: NotificationStatus = NotificationStatus.SKIPPED;
  let errorMessage: string | null = null;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: payload.recipient,
        subject: payload.subject,
        text: payload.message,
      });
      status = NotificationStatus.SENT;
    } catch (error) {
      status = NotificationStatus.FAILED;
      errorMessage = error instanceof Error ? error.message : "Email send failed.";
    }
  } else {
    errorMessage = "SMTP is not configured.";
  }

  await db.notificationDispatch.create({
    data: {
      applicantId: payload.applicantId ?? null,
      roomId: payload.roomId ?? null,
      channel: NotificationChannel.EMAIL,
      kind: payload.kind,
      recipient: payload.recipient,
      subject: payload.subject,
      message: payload.message,
      status,
      sentAt: status === NotificationStatus.SENT ? new Date() : null,
      errorMessage,
    },
  });

  return status;
}

async function listRoomEmailRecipients(roomId: string, excludeApplicantId?: string) {
  return db.applicant.findMany({
    where: {
      roomId,
      status: {
        in: [...ROOM_EMAIL_RECIPIENT_STATUSES],
      },
      ...(excludeApplicantId ? { id: { not: excludeApplicantId } } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      fullName: true,
    },
  });
}

export async function listRecentNotificationDispatches(limit = 25) {
  return db.notificationDispatch.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      applicant: {
        select: {
          fullName: true,
        },
      },
      room: {
        select: {
          title: true,
        },
      },
    },
  });
}

export async function sendSignupNotifications(applicantId: string) {
  const applicant = await db.applicant.findUnique({
    where: { id: applicantId },
    include: {
      room: true,
    },
  });

  if (!applicant?.room) {
    return;
  }

  const transporter = createTransporter();

  await sendLoggedEmail({
    applicantId: applicant.id,
    roomId: applicant.room.id,
    kind: NOTIFICATION_KIND.GENERAL_UPDATE,
    recipient: applicant.email,
    subject: `${applicant.room.title} signup received`,
    message: [
      `Hello ${applicant.fullName},`,
      "",
      `Your signup for ${applicant.room.title} has been received.`,
      `Account size: ${accountSizeLabels[applicant.room.accountSize]}`,
      `Challenge step: ${stepLabels[applicant.room.step]}`,
      "",
      `Once the room reaches ${applicant.room.maxTraderCapacity} traders, we will contact you to pay the entry fee and start the challenge.`,
      "",
      "TradeArena team",
    ].join("\n"),
    transporter,
  });
}

export async function notifyTeamAboutNewUserSignup(input: {
  clerkUserId: string;
  createdAt?: Date | number | null;
  email?: string | null;
  name?: string | null;
}) {
  const createdAt =
    input.createdAt instanceof Date
      ? input.createdAt
      : typeof input.createdAt === "number"
        ? new Date(input.createdAt)
        : null;

  if (!createdAt || Number.isNaN(createdAt.getTime()) || Date.now() - createdAt.getTime() > NEW_USER_ALERT_WINDOW_MS) {
    return false;
  }

  const markerKey = buildInternalAlertKey("new-user-signup", input.clerkUserId);
  const reserved = await reserveInternalAlert(markerKey, {
    clerkUserId: input.clerkUserId,
    createdAt: createdAt.toISOString(),
    email: input.email ?? null,
    name: input.name ?? null,
    reservedAt: new Date().toISOString(),
  });

  if (!reserved) {
    return false;
  }

  await sendTeamAlertEmails({
    subject: "Шинэ хэрэглэгч бүртгүүллээ",
    message: [
      "Шинэ хэрэглэгч бүртгүүллээ.",
      "",
      `Нэр: ${input.name?.trim() || "-"}`,
      `И-мэйл: ${input.email?.trim() || "-"}`,
      `Clerk ID: ${input.clerkUserId}`,
    ].join("\n"),
  });

  return true;
}

export async function notifyTeamAboutProgramSignup(input: {
  clerkUserId: string;
  customerEmail?: string | null;
  customerName?: string | null;
  enrollmentId: string;
  packageName: string;
  packageSlug: string;
}) {
  const markerKey = buildInternalAlertKey("program-signup", input.enrollmentId);
  const reserved = await reserveInternalAlert(markerKey, {
    clerkUserId: input.clerkUserId,
    customerEmail: input.customerEmail ?? null,
    customerName: input.customerName ?? null,
    enrollmentId: input.enrollmentId,
    packageName: input.packageName,
    packageSlug: input.packageSlug,
    reservedAt: new Date().toISOString(),
  });

  if (!reserved) {
    return false;
  }

  await sendTeamAlertEmails({
    subject: `Хөтөлбөрт бүртгүүллээ: ${input.packageName}`,
    message: [
      "Хэрэглэгч хөтөлбөрт бүртгүүллээ.",
      "",
      `Хөтөлбөр: ${input.packageName}`,
      `Slug: ${input.packageSlug}`,
      `Нэр: ${input.customerName?.trim() || "-"}`,
      `И-мэйл: ${input.customerEmail?.trim() || "-"}`,
      `Clerk ID: ${input.clerkUserId}`,
      `Enrollment ID: ${input.enrollmentId}`,
    ].join("\n"),
  });

  return true;
}

export async function sendRoomReadyNotifications(roomId: string) {
  const [room, template, paymentDetails] = await Promise.all([
    db.challengeRoom.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        title: true,
        slug: true,
        accountSize: true,
        step: true,
        entryFeeUsd: true,
      },
    }),
    getRoomReadyEmailConfig(),
    getPaymentDetailsConfig(),
  ]);

  if (!room) {
    return;
  }

  const recipients = await listRoomEmailRecipients(roomId);
  if (!recipients.length) {
    return;
  }

  const transporter = createTransporter();

  for (const recipient of recipients) {
    const subject = template.subject.replaceAll("{roomTitle}", room.title);
    const message = template.message
      .replaceAll("{fullName}", recipient.fullName)
      .replaceAll("{roomTitle}", room.title)
      .replaceAll("{roomSize}", accountSizeLabels[room.accountSize])
      .replaceAll("{step}", stepLabels[room.step])
      .replaceAll("{entryFee}", formatUsd(room.entryFeeUsd))
      .replaceAll("{bankName}", paymentDetails.bankName)
      .replaceAll("{accountHolder}", paymentDetails.accountHolder)
      .replaceAll("{accountNumber}", paymentDetails.accountNumber)
      .replaceAll("{transactionValueHint}", paymentDetails.transactionValueHint)
      .replaceAll("{roomUrl}", buildRoomUrl(room.slug));

    await sendLoggedEmail({
      applicantId: recipient.id,
      roomId: room.id,
      kind: NOTIFICATION_KIND.ROOM_READY,
      recipient: recipient.email,
      subject,
      message,
      transporter,
    });

    await db.applicant.update({
      where: { id: recipient.id },
      data: {
        status: ApplicantStatus.INVITATION_SENT,
        invitationSentAt: new Date(),
      },
    });
  }
}

export async function sendRoomPerformanceReportIfDue(roomId: string, minuteKey: Date, timezone: string) {
  const localMinute = dayjs(minuteKey).tz(timezone);
  const currentTime = localMinute.format("HH:mm");

  if (!PERFORMANCE_REPORT_TIMES.has(currentTime)) {
    return false;
  }

  const room = await db.challengeRoom.findUnique({
    where: { id: roomId },
    include: {
      traders: {
        where: { active: true },
        orderBy: leaderboardTraderOrderBy,
      },
      applicants: {
        where: {
          status: {
            in: [...ROOM_EMAIL_RECIPIENT_STATUSES],
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!room || !room.applicants.length) {
    return false;
  }

  const subject = `${room.title} performance report ${localMinute.format("YYYY.MM.DD HH:mm")}`;
  const existingDispatch = await db.notificationDispatch.findFirst({
    where: {
      roomId,
      kind: NOTIFICATION_KIND.GENERAL_UPDATE,
      subject,
    },
  });

  if (existingDispatch) {
    return false;
  }

  const transporter = createTransporter();
  const roomUrl = buildRoomUrl(room.slug);
  const latestSnapshotAt = room.traders.reduce<Date | null>((latest, trader) => {
    if (!trader.latestSnapshotAt) {
      return latest;
    }

    if (!latest || trader.latestSnapshotAt > latest) {
      return trader.latestSnapshotAt;
    }

    return latest;
  }, null);

  const traderSummary =
    room.traders.length > 0
      ? room.traders
          .map((trader, index) => {
            const parts = [
              `${index + 1}. ${trader.fullName}`,
              `   Profit: ${formatPercent(trader.currentProfitPercent)}`,
              `   Balance: ${formatCurrency(trader.currentBalance)}`,
              `   Equity: ${formatCurrency(trader.currentEquity)}`,
            ];

            if (trader.violationFlag) {
              parts.push(`   Risk note: ${trader.violationReason ?? "Violation flagged"}`);
            }

            if (trader.latestSnapshotAt) {
              parts.push(`   Updated: ${formatDateTime(trader.latestSnapshotAt)}`);
            }

            return parts.join("\n");
          })
          .join("\n\n")
      : "No fresh trader data is available for this room yet.";

  for (const applicant of room.applicants) {
    await sendLoggedEmail({
      applicantId: applicant.id,
      roomId: room.id,
      kind: NOTIFICATION_KIND.GENERAL_UPDATE,
      recipient: applicant.email,
      subject,
      message: [
        `Hello ${applicant.fullName},`,
        "",
        `${room.title} performance report for ${localMinute.format("YYYY.MM.DD HH:mm")}.`,
        `Account size: ${accountSizeLabels[room.accountSize]}`,
        `Challenge step: ${stepLabels[room.step]}`,
        `Room page: ${roomUrl}`,
        `Latest update: ${formatDateTime(latestSnapshotAt)}`,
        "",
        traderSummary,
        "",
        "TradeArena team",
      ].join("\n"),
      transporter,
    });
  }

  return true;
}
