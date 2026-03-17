import { RoomLifecycleStatus } from "@prisma/client";

import { db } from "@/lib/db";

export async function recomputeRoomLeaderboard(roomId: string) {
  const traders = await db.trader.findMany({
    where: { roomId },
    orderBy: [{ currentProfitPercent: "desc" }, { latestSnapshotAt: "desc" }, { fullName: "asc" }],
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

  await db.$transaction(
    traders.map((trader, index) =>
      db.trader.update({
        where: { id: trader.id },
        data: { rank: index + 1 },
      }),
    ),
  );

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
