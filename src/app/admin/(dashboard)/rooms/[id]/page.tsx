export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { SubmitButton } from "@/components/forms/submit-button";
import { RoomForm } from "@/components/admin/room-form";
import { TraderForm } from "@/components/admin/trader-form";
import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatPercent } from "@/lib/format";
import { roomStatusLabels } from "@/lib/labels";
import {
  deleteTraderFormAction,
  refreshRoomAction,
  refreshTraderAction,
  setTraderViolationAction,
} from "@/server/actions/admin-actions";
import { getAdminRoomDetail } from "@/server/services/room-service";

export default async function AdminRoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const flash = await searchParams;
  const room = await getAdminRoomDetail(id);

  if (!room) {
    notFound();
  }

  const activeTraderCount = room.traders.filter((trader) => trader.active).length;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">{room.title}</h1>
          <div className="mt-2">
            <StatusBadge
              label={roomStatusLabels[room.lifecycleStatus]}
              tone={room.lifecycleStatus === "ACTIVE" ? "success" : room.lifecycleStatus === "COMPLETED" ? "info" : "warning"}
            />
          </div>
        </div>
        <form action={refreshRoomAction} className="space-y-2 text-right">
          <input type="hidden" name="roomId" value={room.id} />
          <input type="hidden" name="returnPath" value={`/admin/rooms/${room.id}`} />
          <SubmitButton>FTMO бүх link-ээс бодит дата татах</SubmitButton>
          <p className="text-xs text-white/55">{activeTraderCount} идэвхтэй трейдерийн MetriX link дарааллаар уншигдана.</p>
        </form>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="glass-panel px-5 py-4 text-sm text-white/70">
        Энэ үйлдэл нь өрөөний бүх идэвхтэй FTMO MetriX link-ийг Playwright-аар нээж, snapshot түүх, одоогийн ашиг, зөрчилтэй эсэх болон leaderboard rank-ийг бүгдийг шинэчилнэ.
      </div>

      <RoomForm room={room} returnPath={`/admin/rooms/${room.id}`} />

      <div className="glass-panel p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Шинэ трейдер нэмэх</h2>
        </div>
        <TraderForm roomId={room.id} returnPath={`/admin/rooms/${room.id}`} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Трейдерийн удирдлага</h2>
        {room.traders.map((trader) => (
          <div key={trader.id} className="glass-panel p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className={`text-lg font-semibold ${trader.violationFlag ? "text-rose-300" : "text-white"}`}>{trader.fullName}</div>
                <div className="text-sm text-white/55">
                  Ашиг: {formatPercent(trader.currentProfitPercent)} | Сүүлд: {formatDateTime(trader.latestSnapshotAt)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={refreshTraderAction}>
                  <input type="hidden" name="traderId" value={trader.id} />
                  <input type="hidden" name="roomId" value={room.id} />
                  <input type="hidden" name="returnPath" value={`/admin/rooms/${room.id}`} />
                  <SubmitButton size="sm">Гараар шинэчлэх</SubmitButton>
                </form>
                <form action={deleteTraderFormAction}>
                  <input type="hidden" name="traderId" value={trader.id} />
                  <input type="hidden" name="roomId" value={room.id} />
                  <input type="hidden" name="returnPath" value={`/admin/rooms/${room.id}`} />
                  <SubmitButton size="sm" variant="destructive">
                    Устгах
                  </SubmitButton>
                </form>
              </div>
            </div>

            <TraderForm roomId={room.id} trader={trader} returnPath={`/admin/rooms/${room.id}`} />

            <form action={setTraderViolationAction} className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[auto_1fr_auto]">
              <input type="hidden" name="traderId" value={trader.id} />
              <input type="hidden" name="roomId" value={room.id} />
              <input type="hidden" name="returnPath" value={`/admin/rooms/${room.id}`} />
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="violationFlag" defaultChecked={trader.violationFlag} />
                Зөрчил
              </label>
              <input
                name="violationReason"
                defaultValue={trader.violationReason ?? ""}
                placeholder="Зөрчлийн шалтгаан"
                className="flex h-10 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
              <div className="flex items-center">
                <SubmitButton size="sm">Төлөв хадгалах</SubmitButton>
              </div>
            </form>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Сүүлийн өрөөний лог</h2>
        <div className="space-y-3">
          {room.jobLogs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-white">{log.jobType}</div>
                <div className="text-xs text-white/45">{formatDateTime(log.startedAt)}</div>
              </div>
              <div className="mt-2 text-sm text-white/60">{log.message ?? "-"}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
