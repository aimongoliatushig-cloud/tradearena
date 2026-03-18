export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { PublicShell } from "@/components/layout/public-shell";
import { AccountSizeBadge } from "@/components/shared/account-size-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { TraderLeaderboardTable } from "@/components/shared/trader-leaderboard-table";
import { formatDate, formatDateTime, formatPercent } from "@/lib/format";
import { sortTradersForLeaderboard } from "@/lib/leaderboard";
import { roomStatusLabels, stepLabels } from "@/lib/labels";
import { getPublicRoomDetail } from "@/server/services/room-service";

export default async function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getPublicRoomDetail(id);

  if (!room) {
    notFound();
  }

  const sortedTraders = sortTradersForLeaderboard(room.traders);
  const leader = sortedTraders[0];
  const latestUpdate = room.traders.reduce<Date | null>((latest, trader) => {
    if (!trader.latestSnapshotAt) return latest;
    if (!latest || trader.latestSnapshotAt > latest) return trader.latestSnapshotAt;
    return latest;
  }, null);

  return (
    <PublicShell>
      <section className="space-y-8">
        <div className="glass-panel relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#0781fe]/18 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge label={stepLabels[room.step]} tone="info" />
                <StatusBadge
                  label={roomStatusLabels[room.lifecycleStatus]}
                  tone={room.lifecycleStatus === "ACTIVE" ? "success" : room.lifecycleStatus === "COMPLETED" ? "info" : "warning"}
                />
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-white">{room.title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
                  {room.description || "Энэ өрөөний нээлттэй эрэмбэ, явц, зөрчлийн төлөв болон түүхэн snapshot энд харагдана."}
                </p>
              </div>
              <div className="grid gap-3 text-sm text-white/62 sm:grid-cols-3">
                <div className="ftmo-panel-soft px-4 py-3">
                  Эхлэх: <span className="text-white">{formatDate(room.startDate)}</span>
                </div>
                <div className="ftmo-panel-soft px-4 py-3">
                  Дуусах: <span className="text-white">{formatDate(room.endDate)}</span>
                </div>
                <div className="ftmo-panel-soft px-4 py-3">
                  Сүүлд шинэчлэгдсэн: <span className="text-white">{formatDateTime(latestUpdate)}</span>
                </div>
              </div>
            </div>
            <AccountSizeBadge size={room.accountSize} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Оролцогч трейдер" value={String(room.traders.length)} />
          <MetricCard label="Одоогийн лидер" value={leader?.fullName ?? "-"} />
          <MetricCard label="Лидер ашиг" value={leader ? formatPercent(leader.currentProfitPercent) : "-"} />
          <MetricCard label="Ялагч" value={room.winnerTrader?.fullName ?? "Одоогоор тодроогүй"} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="ftmo-kicker">Leaderboard</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Эрэмбэ</h2>
            <p className="mt-2 text-sm text-white/52">Ашгийн хувь өндөр трейдер эхэндээ эрэмбэлэгдэнэ.</p>
          </div>
          <TraderLeaderboardTable traders={room.traders} winnerTraderId={room.winnerTraderId} />
        </div>
      </section>
    </PublicShell>
  );
}
