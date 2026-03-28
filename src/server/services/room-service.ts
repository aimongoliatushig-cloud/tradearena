import { ApplicantStatus, ChallengeStep, RoomPublicStatus, type AccountSize, type ChallengeRoom, type RoomLifecycleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { leaderboardTraderOrderBy } from "@/lib/leaderboard";
import { accountSizeLabels } from "@/lib/labels";
import { ACCOUNT_SIZE_OPTIONS, ROOM_LIFECYCLE_STATUS, SIGNUP_ROOM_STATUS_OPTIONS } from "@/lib/prisma-enums";
import { getDefaultEntryFeeUsd } from "@/lib/pricing";
import { normalizeFtmoUrl, parseScheduleInput } from "@/lib/validators";
import { recomputeRoomLeaderboard } from "@/server/services/leaderboard-service";
import { getDefaultScheduleConfig } from "@/server/services/settings-service";

const ACTIVE_SIGNUP_APPLICANT_STATUSES = [
  ApplicantStatus.PENDING,
  ApplicantStatus.ACCEPTED,
  ApplicantStatus.ASSIGNED,
  ApplicantStatus.INVITATION_SENT,
] as const;

export async function upsertRoom(input: {
  id?: string;
  title: string;
  description?: string;
  accountSize: ChallengeRoom["accountSize"];
  step: ChallengeRoom["step"];
  entryFeeUsd: number;
  startDate: Date;
  endDate: Date;
  publicStatus: RoomPublicStatus;
  lifecycleStatus: RoomLifecycleStatus;
  maxTraderCapacity: number;
  updateTimesInput?: string;
  updateTimezone: string;
  allowExpiredUpdates: boolean;
}) {
  const defaultSchedule = await getDefaultScheduleConfig();
  const updateTimes = parseScheduleInput(input.updateTimesInput);
  const slug = slugify(input.title);

  const data = {
    title: input.title,
    description: input.description || null,
    accountSize: input.accountSize,
    step: input.step,
    entryFeeUsd: input.entryFeeUsd,
    startDate: input.startDate,
    endDate: input.endDate,
    publicStatus: input.publicStatus,
    lifecycleStatus: input.lifecycleStatus,
    maxTraderCapacity: input.maxTraderCapacity,
    updateTimes: updateTimes.length ? updateTimes : defaultSchedule.updateTimes,
    updateTimezone: input.updateTimezone || defaultSchedule.timezone,
    allowExpiredUpdates: input.allowExpiredUpdates,
  };

  if (input.id) {
    return db.challengeRoom.update({
      where: { id: input.id },
      data,
    });
  }

  return db.challengeRoom.create({
    data: {
      ...data,
      slug,
    },
  });
}

export async function listPublicRooms() {
  const rooms = await db.challengeRoom.findMany({
    where: {
      isPackageRoom: false,
      publicStatus: RoomPublicStatus.PUBLIC,
      lifecycleStatus: {
        in: [
          ROOM_LIFECYCLE_STATUS.ACTIVE,
          ROOM_LIFECYCLE_STATUS.EXPIRED,
          ROOM_LIFECYCLE_STATUS.COMPLETED,
          ROOM_LIFECYCLE_STATUS.ARCHIVED,
        ],
      },
    },
    include: {
      traders: {
        orderBy: leaderboardTraderOrderBy,
      },
      winnerTrader: true,
    },
  });

  return rooms.sort((left, right) => sortRooms(left, right));
}

export async function listSignupRooms() {
  await ensureSignupRooms();

  const [rooms, applicants] = await Promise.all([
    db.challengeRoom.findMany({
      where: {
        isPackageRoom: false,
        publicStatus: RoomPublicStatus.PUBLIC,
        lifecycleStatus: ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN,
      },
      orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
    }),
    db.applicant.findMany({
      where: {
        desiredAccountSize: {
          in: [...ACCOUNT_SIZE_OPTIONS],
        },
        status: {
          in: [...ACTIVE_SIGNUP_APPLICANT_STATUSES],
        },
        trashedAt: null,
      },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        desiredAccountSize: true,
        fullName: true,
        telegramUsername: true,
      },
    }),
  ]);

  const roomByAccountSize = new Map(rooms.map((room) => [room.accountSize, room]));

  return ACCOUNT_SIZE_OPTIONS.flatMap((accountSize) => {
    const room = roomByAccountSize.get(accountSize);

    if (!room) {
      return [];
    }

    const sizeApplicants = applicants.filter((applicant) => applicant.desiredAccountSize === accountSize);

    return {
    id: room.id,
    title: room.title,
    slug: room.slug,
    accountSize: room.accountSize,
    step: room.step,
    entryFeeUsd: room.entryFeeUsd || getDefaultEntryFeeUsd(room.accountSize),
    maxTraderCapacity: room.maxTraderCapacity,
    activeApplicantCount: sizeApplicants.length,
    applicants: sizeApplicants.map((applicant) => ({
      id: applicant.id,
      username: formatApplicantUsername(applicant.telegramUsername, applicant.fullName),
    })),
    };
  });
}

export async function getPublicHomepageData() {
  const [rooms, signupRooms] = await Promise.all([listPublicRooms(), listSignupRooms()]);
  const activeRooms = rooms.filter((room) => room.lifecycleStatus === ROOM_LIFECYCLE_STATUS.ACTIVE);
  const historicalRooms = rooms.filter((room) => room.lifecycleStatus !== ROOM_LIFECYCLE_STATUS.ACTIVE);

  return {
    activeRooms,
    historicalRooms,
    signupRooms,
    totals: {
      roomCount: rooms.length,
      traderCount: rooms.reduce((sum, room) => sum + room.traders.length, 0),
      updatedCount: rooms.filter((room) => room.traders.some((trader) => trader.latestSnapshotAt)).length,
    },
  };
}

export async function listHistoricalRooms() {
  return db.challengeRoom.findMany({
    where: {
      isPackageRoom: false,
      publicStatus: RoomPublicStatus.PUBLIC,
      lifecycleStatus: {
        in: [ROOM_LIFECYCLE_STATUS.EXPIRED, ROOM_LIFECYCLE_STATUS.COMPLETED, ROOM_LIFECYCLE_STATUS.ARCHIVED],
      },
    },
    include: {
      traders: {
        orderBy: leaderboardTraderOrderBy,
      },
      winnerTrader: true,
    },
    orderBy: [{ endDate: "desc" }],
  });
}

export async function getPublicRoomDetail(roomIdOrSlug: string) {
  return db.challengeRoom.findFirst({
    where: {
      isPackageRoom: false,
      publicStatus: RoomPublicStatus.PUBLIC,
      lifecycleStatus: {
        in: [
          ROOM_LIFECYCLE_STATUS.READY_TO_START,
          ROOM_LIFECYCLE_STATUS.ACTIVE,
          ROOM_LIFECYCLE_STATUS.EXPIRED,
          ROOM_LIFECYCLE_STATUS.COMPLETED,
          ROOM_LIFECYCLE_STATUS.ARCHIVED,
        ],
      },
      OR: [{ id: roomIdOrSlug }, { slug: roomIdOrSlug }],
    },
    include: {
      traders: {
        orderBy: leaderboardTraderOrderBy,
        include: {
          snapshots: {
            orderBy: { fetchedAt: "desc" },
            take: 8,
          },
        },
      },
      winnerTrader: true,
    },
  });
}

export async function listAdminRooms() {
  return db.challengeRoom.findMany({
    include: {
      packageTier: true,
      packageEnrollments: {
        include: {
          payment: true,
          packageTier: true,
        },
      },
      traders: {
        orderBy: leaderboardTraderOrderBy,
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAdminRoomDetail(roomId: string) {
  return db.challengeRoom.findUnique({
    where: { id: roomId },
    include: {
      packageTier: true,
      packageEnrollments: {
        orderBy: { createdAt: "asc" },
        include: {
          payment: true,
          packageTier: true,
          auditLogs: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      traders: {
        orderBy: leaderboardTraderOrderBy,
        include: {
          snapshots: {
            orderBy: { fetchedAt: "desc" },
            take: 5,
          },
        },
      },
      applicants: {
        orderBy: { createdAt: "desc" },
      },
      jobLogs: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
      winnerTrader: true,
    },
  });
}

export async function upsertTrader(input: {
  roomId: string;
  traderId?: string;
  fullName: string;
  metrixUrl: string;
  active: boolean;
}) {
  const normalizedMetrixUrl = normalizeFtmoUrl(input.metrixUrl);
  const normalizedFullName = input.fullName.trim();

  const room = await db.challengeRoom.findUnique({
    where: { id: input.roomId },
    select: {
      id: true,
      title: true,
      maxTraderCapacity: true,
      _count: {
        select: {
          traders: true,
        },
      },
    },
  });

  if (!room) {
    throw new Error("Өрөө олдсонгүй.");
  }

  if (!input.traderId && room._count.traders >= room.maxTraderCapacity) {
    throw new Error(`"${room.title}" өрөө дүүрсэн байна. Дээд хэмжээ: ${room.maxTraderCapacity}.`);
  }

  const existingUrlTrader = await db.trader.findFirst({
    where: {
      metrixUrl: normalizedMetrixUrl,
      ...(input.traderId ? { NOT: { id: input.traderId } } : {}),
    },
    include: {
      room: {
        select: {
          title: true,
        },
      },
    },
  });

  if (existingUrlTrader) {
    throw new Error(
      `Энэ FTMO MetriX URL нь "${existingUrlTrader.fullName}" трейдер дээр (${existingUrlTrader.room.title}) аль хэдийн ашиглагдаж байна.`,
    );
  }

  const existingNameTrader = await db.trader.findFirst({
    where: {
      roomId: input.roomId,
      fullName: normalizedFullName,
      ...(input.traderId ? { NOT: { id: input.traderId } } : {}),
    },
  });

  if (existingNameTrader) {
    throw new Error("Энэ өрөөнд ижил нэртэй трейдер аль хэдийн бүртгэлтэй байна.");
  }

  const data = {
    roomId: input.roomId,
    fullName: normalizedFullName,
    metrixUrl: normalizedMetrixUrl,
    active: input.active,
  };

  const trader = input.traderId
    ? await db.trader.update({
        where: { id: input.traderId },
        data,
      })
    : await db.trader.create({
        data,
      });

  await recomputeRoomLeaderboard(input.roomId);
  return trader;
}

export async function deleteTrader(traderId: string) {
  const trader = await db.trader.findUnique({
    where: { id: traderId },
  });

  if (!trader) return;

  await db.trader.delete({
    where: { id: traderId },
  });

  await recomputeRoomLeaderboard(trader.roomId);
}

export async function ensureSignupRooms() {
  await Promise.all(ACCOUNT_SIZE_OPTIONS.map((accountSize) => ensureOpenSignupRoom(accountSize)));
}

export async function ensureOpenSignupRoom(
  accountSize: AccountSize,
  template?: Partial<
    Pick<
      ChallengeRoom,
      "description" | "entryFeeUsd" | "maxTraderCapacity" | "step" | "updateTimes" | "updateTimezone" | "allowExpiredUpdates"
    >
  >,
) {
  const existingRoom = await db.challengeRoom.findFirst({
    where: {
      isPackageRoom: false,
      accountSize,
      publicStatus: RoomPublicStatus.PUBLIC,
      lifecycleStatus: ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN,
    },
    orderBy: [{ createdAt: "asc" }],
  });

  if (existingRoom) {
    return existingRoom;
  }

  const defaultSchedule = await getDefaultScheduleConfig();
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const roomCount = await db.challengeRoom.count({
    where: {
      isPackageRoom: false,
      accountSize,
      lifecycleStatus: {
        in: [...SIGNUP_ROOM_STATUS_OPTIONS],
      },
    },
  });
  const title = `${accountSizeLabels[accountSize]} Trader Room ${roomCount + 1}`;

  return db.challengeRoom.create({
    data: {
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      description: template?.description ?? `${accountSizeLabels[accountSize]} signup room.`,
      accountSize,
      step: template?.step ?? ChallengeStep.STEP_1,
      entryFeeUsd: template?.entryFeeUsd ?? getDefaultEntryFeeUsd(accountSize),
      startDate: now,
      endDate,
      publicStatus: RoomPublicStatus.PUBLIC,
      lifecycleStatus: ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN,
      maxTraderCapacity: template?.maxTraderCapacity ?? 10,
      updateTimes: template?.updateTimes?.length ? template.updateTimes : defaultSchedule.updateTimes,
      updateTimezone: template?.updateTimezone ?? defaultSchedule.timezone,
      allowExpiredUpdates: template?.allowExpiredUpdates ?? false,
      isPackageRoom: false,
    },
  });
}

export function sortRooms(
  left: { lifecycleStatus: RoomLifecycleStatus; startDate: Date },
  right: { lifecycleStatus: RoomLifecycleStatus; startDate: Date },
) {
  const leftPriority = left.lifecycleStatus === ROOM_LIFECYCLE_STATUS.ACTIVE ? 0 : 1;
  const rightPriority = right.lifecycleStatus === ROOM_LIFECYCLE_STATUS.ACTIVE ? 0 : 1;

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  return right.startDate.getTime() - left.startDate.getTime();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatApplicantUsername(telegramUsername: string | null, fullName: string) {
  const cleanedTelegram = telegramUsername?.trim();

  if (cleanedTelegram) {
    return cleanedTelegram.startsWith("@") ? cleanedTelegram : `@${cleanedTelegram}`;
  }

  return fullName.trim();
}
