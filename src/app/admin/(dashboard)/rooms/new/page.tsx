export const dynamic = "force-dynamic";

import { RoomForm } from "@/components/admin/room-form";

export default function NewRoomPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Шинэ өрөө</h1>
        <p className="mt-2 text-sm text-white/60">Өрөөний metadata, schedule, lifecycle төлөвийг эндээс үүсгэнэ.</p>
      </div>

      <RoomForm returnPath="/admin/rooms/new" />
    </section>
  );
}
