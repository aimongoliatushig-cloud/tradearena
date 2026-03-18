import { ApplicantStatus, NotificationChannel, NotificationKind, NotificationStatus } from "@prisma/client";
import nodemailer, { type Transporter } from "nodemailer";

import { db } from "@/lib/db";
import { dayjs } from "@/lib/dayjs";
import { env } from "@/lib/env";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { leaderboardTraderOrderBy } from "@/lib/leaderboard";
import { accountSizeLabels, stepLabels } from "@/lib/labels";

const ROOM_EMAIL_RECIPIENT_STATUSES = [
  ApplicantStatus.PENDING,
  ApplicantStatus.ACCEPTED,
  ApplicantStatus.ASSIGNED,
  ApplicantStatus.INVITATION_SENT,
  ApplicantStatus.JOINED,
] as const;

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
      errorMessage = error instanceof Error ? error.message : "Имэйл илгээх үед алдаа гарлаа.";
    }
  } else {
    errorMessage = "SMTP тохируулаагүй байна.";
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
  const roomUrl = buildRoomUrl(applicant.room.slug);

  await sendLoggedEmail({
    applicantId: applicant.id,
    roomId: applicant.room.id,
    kind: NotificationKind.GENERAL_UPDATE,
    recipient: applicant.email,
    subject: `${applicant.room.title} өрөөний бүртгэл хүлээн авлаа`,
    message: [
      `Сайн байна уу, ${applicant.fullName}.`,
      "",
      `Таны "${applicant.room.title}" өрөөний бүртгэлийг амжилттай хүлээн авлаа.`,
      `Өрөөний хэмжээ: ${accountSizeLabels[applicant.room.accountSize]}`,
      `Алхам: ${stepLabels[applicant.room.step]}`,
      `Өрөөний холбоос: ${roomUrl}`,
      "",
      "Өрөөнд шинэ гишүүн нэмэгдэх болон 09:00, 21:00 цагийн гүйцэтгэлийн тайланг энэ имэйлээр илгээх болно.",
      "",
      "TradeArena баг",
    ].join("\n"),
    transporter,
  });

  const otherApplicants = await listRoomEmailRecipients(applicant.room.id, applicant.id);

  for (const recipient of otherApplicants) {
    await sendLoggedEmail({
      applicantId: recipient.id,
      roomId: applicant.room.id,
      kind: NotificationKind.GENERAL_UPDATE,
      recipient: recipient.email,
      subject: `${applicant.room.title} өрөөнд шинэ гишүүн нэмэгдлээ`,
      message: [
        `Сайн байна уу, ${recipient.fullName}.`,
        "",
        `"${applicant.room.title}" өрөөнд ${applicant.fullName} шинээр бүртгүүллээ.`,
        `Өрөөний холбоос: ${roomUrl}`,
        "",
        "Өрөөний бүрэлдэхүүн шинэчлэгдсэн тул дараагийн тайлангуудаа имэйлээр авч байх болно.",
        "",
        "TradeArena баг",
      ].join("\n"),
      transporter,
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

  const subject = `${room.title} өрөөний тайлан • ${localMinute.format("YYYY.MM.DD HH:mm")}`;
  const existingDispatch = await db.notificationDispatch.findFirst({
    where: {
      roomId,
      kind: NotificationKind.GENERAL_UPDATE,
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
              `   Ашиг: ${formatPercent(trader.currentProfitPercent)}`,
              `   Balance: ${formatCurrency(trader.currentBalance)}`,
              `   Equity: ${formatCurrency(trader.currentEquity)}`,
            ];

            if (trader.violationFlag) {
              parts.push(`   Тэмдэглэл: ${trader.violationReason ?? "Зөрчилтэй"}`);
            }

            if (trader.latestSnapshotAt) {
              parts.push(`   Сүүлд шинэчилсэн: ${formatDateTime(trader.latestSnapshotAt)}`);
            }

            return parts.join("\n");
          })
          .join("\n\n")
      : "Одоогоор энэ өрөөний трейдерийн шинэ дата байхгүй байна.";

  for (const applicant of room.applicants) {
    await sendLoggedEmail({
      applicantId: applicant.id,
      roomId: room.id,
      kind: NotificationKind.GENERAL_UPDATE,
      recipient: applicant.email,
      subject,
      message: [
        `Сайн байна уу, ${applicant.fullName}.`,
        "",
        `"${room.title}" өрөөний ${localMinute.format("YYYY.MM.DD HH:mm")}-ийн гүйцэтгэлийн тайланг хүргэж байна.`,
        `Өрөөний хэмжээ: ${accountSizeLabels[room.accountSize]}`,
        `Алхам: ${stepLabels[room.step]}`,
        `Өрөөний холбоос: ${roomUrl}`,
        `Сүүлийн шинэчлэгдсэн дата: ${formatDateTime(latestSnapshotAt)}`,
        "",
        traderSummary,
        "",
        "TradeArena баг",
      ].join("\n"),
      transporter,
    });
  }

  return true;
}
