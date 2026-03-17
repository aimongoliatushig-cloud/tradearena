export const dynamic = "force-dynamic";

import Link from "next/link";
import { JobStatus } from "@prisma/client";

import { FlashMessage } from "@/components/shared/flash-message";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { getDashboardSummary } from "@/server/services/dashboard-service";

const alertTone: Partial<Record<JobStatus, string>> = {
  [JobStatus.FAILED]: "border-rose-400/20 bg-rose-500/10 text-rose-100/85",
  [JobStatus.PARTIAL]: "border-amber-400/20 bg-amber-500/10 text-amber-100/85",
};

const alertLabel: Partial<Record<JobStatus, string>> = {
  [JobStatus.FAILED]: "Алдаа",
  [JobStatus.PARTIAL]: "Анхааруулга",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const summary = await getDashboardSummary();

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Админ хянах самбар</h1>
          <p className="mt-2 text-sm text-white/60">Өрөө, өргөдөл, scrape хяналтыг эндээс удирдана.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/admin/rooms/new" />}>Шинэ өрөө</Button>
          <Button variant="secondary" render={<Link href="/admin/applicants" />}>
            Өргөдөл харах
          </Button>
        </div>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Идэвхтэй өрөө" value={String(summary.roomTotals.active)} />
        <MetricCard label="Түүхэн өрөө" value={String(summary.roomTotals.history)} />
        <MetricCard label="Трейдер" value={String(summary.roomTotals.traders)} />
        <MetricCard label="Хүлээгдэж буй өргөдөл" value={String(summary.roomTotals.pendingApplicants)} />
        <MetricCard label="Зөвшөөрсөн өргөдөл" value={String(summary.roomTotals.acceptedApplicants)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Сүүлд шинэчлэгдсэн өрөө</h2>
            <Button variant="outline" render={<Link href="/admin/rooms" />}>
              Бүгд
            </Button>
          </div>
          <div className="space-y-3">
            {summary.rooms.map((room) => (
              <Link
                key={room.id}
                href={`/admin/rooms/${room.id}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/8"
              >
                <div>
                  <div className="font-medium text-white">{room.title}</div>
                  <div className="text-sm text-white/55">{room.traders.length} трейдер</div>
                </div>
                <div className="text-sm text-white/50">{formatDateTime(room.updatedAt)}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Одоогийн scrape асуудлууд</h2>
          <div className="space-y-3">
            {summary.alertLogs.length ? (
              summary.alertLogs.map((log) => (
                <div key={log.id} className={`rounded-2xl border p-4 ${alertTone[log.status] ?? "border-white/10 bg-white/5 text-white/85"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-white">{log.room?.title ?? log.trader?.fullName ?? log.jobType}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/70">{alertLabel[log.status] ?? log.status}</div>
                  </div>
                  <div className="mt-2 text-sm">{log.message ?? "Алдааны тайлбар байхгүй"}</div>
                  <div className="mt-2 text-xs text-white/50">{formatDateTime(log.startedAt)}</div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">Одоогоор идэвхтэй scrape асуудал алга.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
