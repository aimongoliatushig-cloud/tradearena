import Link from "next/link";
import { ArrowRight, Crown, Users } from "lucide-react";
import type { ChallengeRoom, Trader } from "@prisma/client";

import { AccountSizeBadge } from "@/components/shared/account-size-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-variants";
import { formatDate, formatDateTime, formatPercent } from "@/lib/format";
import { sortTradersForLeaderboard } from "@/lib/leaderboard";
import { roomStatusLabels, stepLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type RoomCardRoom = ChallengeRoom & {
  traders: Trader[];
};

function getRoomTone(status: ChallengeRoom["lifecycleStatus"]) {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "EXPIRED":
      return "warning";
    case "COMPLETED":
      return "info";
    default:
      return "muted";
  }
}

export function RoomCard({ room, href }: { room: RoomCardRoom; href: string }) {
  const sortedTraders = sortTradersForLeaderboard(room.traders);
  const leader = sortedTraders[0];
  const latestUpdated = room.traders.reduce<Date | null>((latest, trader) => {
    if (!trader.latestSnapshotAt) return latest;
    if (!latest || trader.latestSnapshotAt > latest) return trader.latestSnapshotAt;
    return latest;
  }, null);

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1014]/88 shadow-[0_28px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3daafe]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(7,129,254,0.18),transparent_72%)]" />
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <StatusBadge label={stepLabels[room.step]} tone="info" />
            <CardTitle className="text-xl tracking-[-0.03em] text-white">{room.title}</CardTitle>
          </div>
          <AccountSizeBadge size={room.accountSize} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/66">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">Эхлэх</div>
            <div className="mt-2 text-white">{formatDate(room.startDate)}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">Дуусах</div>
            <div className="mt-2 text-white">{formatDate(room.endDate)}</div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between text-sm text-white/58">
            <span className="flex items-center gap-2">
              <Users className="size-4" />
              Трэйдер
            </span>
            <span>{room.traders.length}</span>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46">
                <Crown className="size-4" />
                Одоогийн лидер
              </div>
              <div className="mt-3 text-lg font-semibold tracking-[-0.02em] text-white">{leader?.fullName ?? "Одоогоор байхгүй"}</div>
            </div>
            <div className={`text-2xl font-semibold tracking-[-0.03em] ${leader && leader.currentProfitPercent < 0 ? "text-red-300" : "text-[#83c5ff]"}`}>
              {leader ? formatPercent(leader.currentProfitPercent) : "-"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label={roomStatusLabels[room.lifecycleStatus]} tone={getRoomTone(room.lifecycleStatus)} />
          <span className="text-xs text-white/45">Сүүлд шинэчлэгдсэн: {formatDateTime(latestUpdated)}</span>
        </div>
      </CardContent>
      <CardFooter className="border-white/10 bg-black/20">
        <Link href={href} className={cn(buttonVariants(), "w-full justify-between rounded-[1.25rem]")}>
          Эрэмбэ харах
          <ArrowRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
