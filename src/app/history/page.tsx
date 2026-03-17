export const dynamic = "force-dynamic";

import { PublicShell } from "@/components/layout/public-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { RoomCard } from "@/components/shared/room-card";
import { listHistoricalRooms } from "@/server/services/room-service";

export default async function HistoryPage() {
  const rooms = await listHistoricalRooms();

  return (
    <PublicShell>
      <section className="space-y-8">
        <div className="glass-panel p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="ftmo-kicker">History</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">Өрөөний түүх</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                Дууссан болон хугацаа дууссан өрөөнүүдийн эцсийн эрэмбэ, ялагч, зөрчлийн төлөв энд хадгалагдана.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Түүхэн өрөө" value={String(rooms.length)} />
              <MetricCard label="Ялагчтай өрөө" value={String(rooms.filter((room) => room.winnerTraderId).length)} />
            </div>
          </div>
        </div>

        <div className="section-grid">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} href={`/rooms/${room.slug}`} />
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
