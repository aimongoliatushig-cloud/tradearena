export const dynamic = "force-dynamic";

import { PublicShell } from "@/components/layout/public-shell";
import { RoomCard } from "@/components/shared/room-card";
import { listPublicRooms } from "@/server/services/room-service";

export default async function RoomsPage() {
  const rooms = await listPublicRooms();
  const activeRooms = rooms.filter((room) => room.lifecycleStatus === "ACTIVE");
  const archivedRooms = rooms.filter((room) => room.lifecycleStatus !== "ACTIVE");

  return (
    <PublicShell>
      <section className="space-y-8">
        <div className="glass-panel relative overflow-hidden p-8">
          <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-[#0781fe]/18 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="ftmo-kicker">Challenge Rooms</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">Challenge өрөөнүүд</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
                Sort дараалал: эхлээд хамгийн сүүлийн идэвхтэй room, дараа нь бусад active room, төгсгөлд history.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="ftmo-panel-soft px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Active</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">{activeRooms.length}</div>
              </div>
              <div className="ftmo-panel-soft px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">History</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">{archivedRooms.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Идэвхтэй өрөө</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/55">{activeRooms.length} өрөө</span>
          </div>
          <div className="section-grid">
            {activeRooms.map((room) => (
              <RoomCard key={room.id} room={room} href={`/rooms/${room.slug}`} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Түүх</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/55">{archivedRooms.length} өрөө</span>
          </div>
          <div className="section-grid">
            {archivedRooms.map((room) => (
              <RoomCard key={room.id} room={room} href={`/rooms/${room.slug}`} />
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
