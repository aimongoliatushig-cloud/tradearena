import { ApplicantStatus, RoomLifecycleStatus, RoomPublicStatus, type ChallengeRoom } from "@prisma/client";

import { db } from "@/lib/db";
import { normalizeFtmoUrl, parseScheduleInput } from "@/lib/validators";
import { recomputeRoomLeaderboard } from "@/server/services/leaderboard-service";
import { getDefaultScheduleConfig } from "@/server/services/settings-service";

export async function upsertRoom(input: {
  id?: string;
  title: string;
  description?: string;
  accountSize: ChallengeRoom["accountSize"];
  step: ChallengeRoom["step"];
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
      publicStatus: RoomPublicStatus.PUBLIC,
    },
    include: {
      traders: {
        orderBy: [{ rank: "asc" }, { currentProfitPercent: "desc" }],
      },
      winnerTrader: true,
    },
  });

  return rooms.sort((left, right) => sortRooms(left, right));
}

export async function listSignupRooms() {
  const rooms = await db.challengeRoom.findMany({
    where: {
      publicStatus: RoomPublicStatus.PUBLIC,
      lifecycleStatus: RoomLifecycleStatus.ACTIVE,
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
    orderBy: [{ startDate: "asc" }, { createdAt: "asc" }],
  });

  return rooms.map((room) => ({
    id: room.id,
    title: room.title,
    slug: room.slug,
    accountSize: room.accountSize,
    step: room.step,
    maxTraderCapacity: room.maxTraderCapacity,
    activeApplicantCount: room.applicants.length,
  }));
}

export async function getPublicHomepageData() {
  const rooms = await listPublicRooms();
  const activeRooms = rooms.filter((room) => room.lifecycleStatus === RoomLifecycleStatus.ACTIVE);
  const historicalRooms = rooms.filter((room) => room.lifecycleStatus !== RoomLifecycleStatus.ACTIVE);

  return {
    activeRooms,
    historicalRooms,
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
      publicStatus: RoomPublicStatus.PUBLIC,
      lifecycleStatus: {
        in: [RoomLifecycleStatus.EXPIRED, RoomLifecycleStatus.COMPLETED, RoomLifecycleStatus.ARCHIVED],
      },
    },
    include: {
      traders: {
        orderBy: [{ rank: "asc" }, { currentProfitPercent: "desc" }],
      },
      winnerTrader: true,
    },
    orderBy: [{ endDate: "desc" }],
  });
}

export async function getPublicRoomDetail(roomIdOrSlug: string) {
  return db.challengeRoom.findFirst({
    where: {
      publicStatus: RoomPublicStatus.PUBLIC,
      OR: [{ id: roomIdOrSlug }, { slug: roomIdOrSlug }],
    },
    include: {
      traders: {
        orderBy: [{ rank: "asc" }, { currentProfitPercent: "desc" }, { fullName: "asc" }],
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
      traders: {
        orderBy: [{ rank: "asc" }],
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAdminRoomDetail(roomId: string) {
  return db.challengeRoom.findUnique({
    where: { id: roomId },
    include: {
      traders: {
        orderBy: [{ rank: "asc" }, { currentProfitPercent: "desc" }],
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

export function sortRooms(
  left: { lifecycleStatus: RoomLifecycleStatus; startDate: Date },
  right: { lifecycleStatus: RoomLifecycleStatus; startDate: Date },
) {
  const leftPriority = left.lifecycleStatus === RoomLifecycleStatus.ACTIVE ? 0 : 1;
  const rightPriority = right.lifecycleStatus === RoomLifecycleStatus.ACTIVE ? 0 : 1;

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
