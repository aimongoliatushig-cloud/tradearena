import { Crown, ShieldAlert } from "lucide-react";
import type { Trader, TraderSnapshot } from "@prisma/client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildNegativePressure, buildProgressValue, formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { getTotalRiskValue } from "@/lib/ftmo-rules";
import { sortTradersForLeaderboard } from "@/lib/leaderboard";

type LeaderboardTrader = Trader & {
  snapshots?: TraderSnapshot[];
};

export function TraderLeaderboardTable({
  traders,
  winnerTraderId,
}: {
  traders: LeaderboardTrader[];
  winnerTraderId?: string | null;
}) {
  const sortedTraders = sortTradersForLeaderboard(traders);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 bg-white/[0.03] hover:bg-white/[0.03]">
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">#</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Татагдсан огноо</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Трейдер</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Ашиг</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">5%-ийн явц</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Max daily loss</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Max loss</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Total risk</TableHead>
            <TableHead className="h-12 px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Эрсдэлийн төлөв</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTraders.map((trader, index) => {
            const progress = buildProgressValue(trader.currentProfitPercent);
            const negativePressure = buildNegativePressure(trader.currentProfitPercent);
            const totalRisk = getTotalRiskValue(trader.currentDailyLossValue, trader.currentMaxLossValue);

            return (
              <TableRow key={trader.id} className="border-white/8 hover:bg-white/[0.025]">
                <TableCell className="px-4 py-4 font-medium text-white/72">{index + 1}</TableCell>
                <TableCell className="px-4 py-4 text-white/46">{formatDateTime(trader.latestSnapshotAt)}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-2 font-medium ${trader.violationFlag ? "text-red-300" : "text-white"}`}>
                      {winnerTraderId === trader.id ? <Crown className="size-4 text-orange-300" /> : null}
                      <span>{trader.fullName}</span>
                      {winnerTraderId === trader.id ? <StatusBadge label="Ялагч" tone="warning" /> : null}
                    </div>
                    {trader.currentProfitAbsolute !== null && trader.currentProfitAbsolute !== undefined ? (
                      <span className="text-xs text-white/46">{formatCurrency(trader.currentProfitAbsolute)}</span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className={`px-4 py-4 ${trader.currentProfitPercent < 0 ? "text-red-300" : "text-[#83c5ff]"}`}>
                  {formatPercent(trader.currentProfitPercent)}
                </TableCell>
                <TableCell className="min-w-56 px-4 py-4">
                  <div className="space-y-2">
                    <div className="h-2 overflow-hidden rounded-full bg-white/8">
                      <div
                        className={`h-full rounded-full transition-all ${
                          trader.currentProfitPercent < 0 ? "bg-red-400/30" : "bg-gradient-to-r from-[#0781fe] to-[#83c5ff]"
                        }`}
                        style={{
                          width: `${trader.currentProfitPercent < 0 ? negativePressure : progress}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/48">
                      <span>{trader.currentProfitPercent < 0 ? "Сөрөг бүс" : "Зорилго 5%"}</span>
                      <span>{formatPercent(trader.currentProfitPercent)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-red-200/85">{formatCurrency(trader.currentDailyLossValue)}</TableCell>
                <TableCell className="px-4 py-4 text-red-200/85">{formatCurrency(trader.currentMaxLossValue)}</TableCell>
                <TableCell className="px-4 py-4 text-white/72">{formatCurrency(totalRisk)}</TableCell>
                <TableCell className="px-4 py-4">
                  {trader.violationFlag ? (
                    <div className="space-y-1">
                      <StatusBadge label="Зөрчилтэй" tone="danger" />
                      {trader.violationReason ? (
                        <div className="flex items-center gap-1 text-xs text-red-200/80">
                          <ShieldAlert className="size-3" />
                          <span>{trader.violationReason}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <StatusBadge label="Зөрчилгүй" tone="success" />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
