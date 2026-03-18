import type { Prisma, Trader } from "@prisma/client";

export const leaderboardTraderOrderBy = [
  { currentProfitPercent: "desc" },
  { latestSnapshotAt: "desc" },
  { fullName: "asc" },
] satisfies Prisma.TraderOrderByWithRelationInput[];

export function sortTradersForLeaderboard<T extends Pick<Trader, "currentProfitPercent" | "latestSnapshotAt" | "fullName">>(traders: T[]) {
  return [...traders].sort((left, right) => {
    if (left.currentProfitPercent !== right.currentProfitPercent) {
      return right.currentProfitPercent - left.currentProfitPercent;
    }

    const leftSnapshotTime = left.latestSnapshotAt?.getTime() ?? Number.NEGATIVE_INFINITY;
    const rightSnapshotTime = right.latestSnapshotAt?.getTime() ?? Number.NEGATIVE_INFINITY;

    if (leftSnapshotTime !== rightSnapshotTime) {
      return rightSnapshotTime - leftSnapshotTime;
    }

    return left.fullName.localeCompare(right.fullName);
  });
}
