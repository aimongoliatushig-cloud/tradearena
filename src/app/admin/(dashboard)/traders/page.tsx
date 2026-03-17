export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
import { formatDateTime, formatPercent } from "@/lib/format";
import { refreshTraderAction, setTraderViolationAction } from "@/server/actions/admin-actions";

export default async function AdminTradersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const traders = await db.trader.findMany({
    include: {
      room: true,
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Трейдерийн удирдлага</h1>
        <p className="mt-2 text-sm text-white/60">Нийт трейдерийн refresh, зөрчил, харьяалах өрөөг эндээс хянана.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="space-y-3">
        {traders.map((trader) => (
          <div key={trader.id} className="glass-panel p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className={`text-lg font-semibold ${trader.violationFlag ? "text-rose-300" : "text-white"}`}>{trader.fullName}</div>
                <div className="mt-1 text-sm text-white/55">
                  {trader.room.title} | {formatPercent(trader.currentProfitPercent)} | {formatDateTime(trader.latestSnapshotAt)}
                </div>
                {trader.violationFlag ? <div className="mt-2 text-sm text-rose-200/80">{trader.violationReason || "Зөрчил тэмдэглэсэн"}</div> : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={trader.active ? "Идэвхтэй" : "Идэвхгүй"} tone={trader.active ? "success" : "muted"} />
                <form action={refreshTraderAction}>
                  <input type="hidden" name="traderId" value={trader.id} />
                  <input type="hidden" name="roomId" value={trader.roomId} />
                  <input type="hidden" name="returnPath" value="/admin/traders" />
                  <SubmitButton size="sm">Шинэчлэх</SubmitButton>
                </form>
              </div>
            </div>

            <form action={setTraderViolationAction} className="mt-4 grid gap-3 md:grid-cols-[auto_1fr_auto]">
              <input type="hidden" name="traderId" value={trader.id} />
              <input type="hidden" name="roomId" value={trader.roomId} />
              <input type="hidden" name="returnPath" value="/admin/traders" />
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
                <SubmitButton size="sm">Хадгалах</SubmitButton>
              </div>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}
