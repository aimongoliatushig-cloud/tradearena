import { Prisma, RoomLifecycleStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { leaderboardTraderOrderBy } from "@/lib/leaderboard";

export async function recomputeRoomLeaderboard(roomId: string) {
  const traders = await db.trader.findMany({
    where: { roomId },
    orderBy: leaderboardTraderOrderBy,
  });

  if (!traders.length) {
    await db.challengeRoom.update({
      where: { id: roomId },
      data: {
        leaderTraderId: null,
        winnerTraderId: null,
        winnerDeclaredAt: null,
      },
    });
    return [];
  }

  const nextRanks = traders.map((trader, index) => ({
    id: trader.id,
    rank: index + 1,
  }));
  const rankNeedsUpdate = traders.some((trader, index) => trader.rank !== index + 1);

  if (rankNeedsUpdate) {
    const values = Prisma.join(nextRanks.map((item) => Prisma.sql`(${item.id}, ${item.rank})`));

    await db.$executeRaw`
      UPDATE "Trader" AS trader
      SET "rank" = ranks.rank::int
      FROM (VALUES ${values}) AS ranks(id, rank)
      WHERE trader."id" = ranks.id::text
    `;
  }

  const room = await db.challengeRoom.findUnique({
    where: { id: roomId },
  });

  const validWinner = traders.find((trader) => !trader.violationFlag) ?? null;
  const shouldPersistWinner =
    room &&
    (room.lifecycleStatus === RoomLifecycleStatus.EXPIRED || room.lifecycleStatus === RoomLifecycleStatus.COMPLETED);

  await db.challengeRoom.update({
    where: { id: roomId },
    data: {
      leaderTraderId: traders[0].id,
      winnerTraderId: shouldPersistWinner ? validWinner?.id ?? null : room?.winnerTraderId ?? null,
      winnerDeclaredAt: shouldPersistWinner && validWinner ? new Date() : room?.winnerDeclaredAt ?? null,
    },
  });

  return traders;
}
