export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { RoomForm } from "@/components/admin/room-form";
import { TraderForm } from "@/components/admin/trader-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { buildTraderCompletionStatus, getTotalRiskValue } from "@/lib/ftmo-rules";
import { packageEnrollmentStatusLabels, paymentStatusLabels, roomStatusLabels } from "@/lib/labels";
import {
  deleteTraderFormAction,
  mergePackageRoomsAction,
  moveEnrollmentAction,
  refreshRoomAction,
  refreshTraderAction,
  setTraderCompletionRecordedAction,
  setTraderViolationAction,
} from "@/server/actions/admin-actions";
import { listPackageRoomsForAdmin } from "@/server/services/enrollment-service";
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

  if (room.isPackageRoom) {
    const rooms = await listPackageRoomsForAdmin();
    const siblingRooms = rooms.filter((item) => item.packageTierId === room.packageTierId && item.id !== room.id);
    const activeMembers = room.packageEnrollments.filter((item) => item.status === "ENROLLED" || item.status === "AWAITING_DECISION");

    return (
      <section className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">{room.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge label={room.packageTier?.nameMn ?? "Багцгүй"} tone="info" />
              <StatusBadge label={roomStatusLabels[room.lifecycleStatus]} tone={room.lifecycleStatus === "AWAITING_DECISION" ? "warning" : "success"} />
            </div>
          </div>
          <Button variant="outline" render={<Link href="/admin/rooms" />}>
            Жагсаалт руу буцах
          </Button>
        </div>

        <FlashMessage
          success={typeof flash.success === "string" ? flash.success : undefined}
          error={typeof flash.error === "string" ? flash.error : undefined}
        />

        <div className="grid gap-5 md:grid-cols-3">
          <MetricBox label="Идэвхтэй гишүүн" value={`${activeMembers.length}/${room.maxTraderCapacity}`} />
          <MetricBox label="Өрөөний дараалал" value={String(room.roomSequence ?? "-")} />
          <MetricBox label="48 цагийн хугацаа" value={formatDateTime(room.decisionDeadlineAt)} />
        </div>

        {siblingRooms.length ? (
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white">Өрөө нэгтгэх</h2>
            <form action={mergePackageRoomsAction} className="mt-4 flex flex-wrap items-center gap-3">
              <input type="hidden" name="sourceRoomId" value={room.id} />
              <input type="hidden" name="returnPath" value={`/admin/rooms/${room.id}`} />
              <select name="targetRoomId" defaultValue={siblingRooms[0]?.id} className="flex h-11 rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none">
                {siblingRooms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <SubmitButton>Нэгтгэх</SubmitButton>
            </form>
          </div>
        ) : null}

        <div className="space-y-4">
          {room.packageEnrollments.map((enrollment) => {
            const targetRooms = siblingRooms.filter((item) => item.id !== enrollment.roomId);

            return (
              <div key={enrollment.id} className="glass-panel p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {enrollment.payment?.customerName || enrollment.payment?.customerEmail || enrollment.clerkUserId}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge label={packageEnrollmentStatusLabels[enrollment.status]} tone={enrollment.status === "ENROLLED" ? "success" : "warning"} />
                      {enrollment.payment ? (
                        <StatusBadge
                          label={paymentStatusLabels[enrollment.payment.status]}
                          tone={enrollment.payment.status === "CONFIRMED" ? "success" : "warning"}
                        />
                      ) : null}
                    </div>
                    <div className="mt-3 text-sm leading-7 text-white/60">
                      <div>Reference: {enrollment.payment?.reference || "-"}</div>
                      <div>И-мэйл: {enrollment.payment?.customerEmail || "-"}</div>
                      <div>Тайлбар: {enrollment.payment?.proofNote || "-"}</div>
                    </div>
                  </div>

                  {targetRooms.length ? (
                    <form action={moveEnrollmentAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <input type="hidden" name="returnPath" value={`/admin/rooms/${room.id}`} />
                      <select name="roomId" defaultValue={targetRooms[0]?.id} className="flex h-10 rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none">
                        {targetRooms.map((target) => (
                          <option key={target.id} value={target.id}>
                            {target.title}
                          </option>
                        ))}
                      </select>
                      <SubmitButton size="sm">Өөр өрөө рүү шилжүүлэх</SubmitButton>
                    </form>
                  ) : null}
                </div>

                {enrollment.auditLogs.length ? (
                  <div className="mt-4 grid gap-2">
                    {enrollment.auditLogs.map((log) => (
                      <div key={log.id} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
                        {log.message}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  const activeTraderCount = room.traders.filter((trader) => trader.active).length;
  const reportRows = room.traders.map((trader) => {
    const latestSnapshot = trader.snapshots[0] ?? null;
    const completion = buildTraderCompletionStatus({
      accountSize: room.accountSize,
      currentProfitAbsolute: trader.currentProfitAbsolute,
      currentProfitPercent: trader.currentProfitPercent,
      violationFlag: trader.violationFlag,
      rawPayload: latestSnapshot?.rawPayload,
    });

    return {
      trader,
      completion,
      totalRisk: getTotalRiskValue(trader.currentDailyLossValue, trader.currentMaxLossValue),
    };
  });

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
          <SubmitButton>FTMO бүх link-ээс дата татах</SubmitButton>
          <p className="text-xs text-white/55">{activeTraderCount} идэвхтэй трейдерийн MetriX link дарааллаар уншигдана.</p>
        </form>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

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
        <div className="mb-4 space-y-2">
          <h2 className="text-xl font-semibold text-white">Reporting</h2>
          <p className="text-sm text-white/60">Биелүүлсэн = 5% target хүрсэн, зөрчилгүй, мөн 2 өдөр 2.5%-иас дээш ашигтай.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 bg-white/[0.03] hover:bg-white/[0.03]">
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Трейдер</TableHead>
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Ашиг</TableHead>
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">2.5%+ өдөр</TableHead>
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Max daily loss</TableHead>
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Max loss</TableHead>
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Total risk</TableHead>
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Биелүүлсэн</TableHead>
              <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">OK recorded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportRows.map(({ trader, completion, totalRisk }) => {
              const canRecord = completion.completed || trader.completionRecorded;

              return (
                <TableRow key={`report-${trader.id}`} className="border-white/8 hover:bg-white/[0.025]">
                  <TableCell className="px-4 py-4">
                    <div className="space-y-1">
                      <div className={`font-medium ${trader.violationFlag ? "text-rose-300" : "text-white"}`}>{trader.fullName}</div>
                      <div className="text-xs text-white/45">{formatDateTime(trader.latestSnapshotAt)}</div>
                    </div>
                  </TableCell>
                  <TableCell className={`px-4 py-4 ${trader.currentProfitPercent < 0 ? "text-red-300" : "text-[#83c5ff]"}`}>
                    <div className="space-y-1">
                      <div>{formatPercent(trader.currentProfitPercent)}</div>
                      <div className="text-xs text-white/45">{formatCurrency(trader.currentProfitAbsolute)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-white/70">
                    <div className="space-y-1">
                      <div>
                        {completion.qualifiedProfitDays}/{completion.requiredQualifyingDayCount} өдөр
                      </div>
                      <div className="text-xs text-white/45">{formatCurrency(completion.qualifyingDayProfitUsd)}+</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-red-200/85">{formatCurrency(trader.currentDailyLossValue)}</TableCell>
                  <TableCell className="px-4 py-4 text-red-200/85">{formatCurrency(trader.currentMaxLossValue)}</TableCell>
                  <TableCell className="px-4 py-4 text-white/78">{formatCurrency(totalRisk)}</TableCell>
                  <TableCell className="px-4 py-4">
                    {completion.completed ? (
                      <StatusBadge label="Тийм" tone="success" />
                    ) : trader.violationFlag ? (
                      <StatusBadge label="Зөрчилтэй" tone="danger" />
                    ) : (
                      <StatusBadge label="Үгүй" tone="muted" />
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <form action={setTraderCompletionRecordedAction} className="flex min-w-44 items-center gap-3">
                      <input type="hidden" name="traderId" value={trader.id} />
                      <input type="hidden" name="roomId" value={room.id} />
                      <input type="hidden" name="returnPath" value={`/admin/rooms/${room.id}`} />
                      <label className={`flex items-center gap-2 text-sm ${canRecord ? "text-white/72" : "text-white/35"}`}>
                        <input type="checkbox" name="completionRecorded" defaultChecked={trader.completionRecorded} disabled={!canRecord} />
                        OK
                      </label>
                      <SubmitButton size="sm" disabled={!canRecord}>
                        Хадгалах
                      </SubmitButton>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-5">
      <div className="text-sm text-white/55">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">{value}</div>
    </div>
  );
}
