export const dynamic = "force-dynamic";

import Link from "next/link";

import { SubmitButton } from "@/components/forms/submit-button";
import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/format";
import { roomStatusLabels, stepLabels } from "@/lib/labels";
import { refreshRoomAction } from "@/server/actions/admin-actions";
import { listAdminRooms } from "@/server/services/room-service";

export default async function AdminRoomsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const rooms = await listAdminRooms();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Өрөөний удирдлага</h1>
          <p className="mt-2 text-sm text-white/60">Үүсгэх, засах, хугацаа дуусгах, архивлах болон schedule тохиргоог эндээс удирдана.</p>
        </div>
        <Button render={<Link href="/admin/rooms/new" />}>Шинэ өрөө</Button>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="glass-panel px-5 py-4 text-sm text-white/70">
        FTMO дата татах товч нь тухайн өрөөний бүх идэвхтэй MetriX link-ийг Playwright-аар уншиж, трейдер бүрийн хамгийн сүүлийн snapshot болон rank-ийг шинэчилнэ.
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead>Өрөө</TableHead>
              <TableHead>Алхам</TableHead>
              <TableHead>Огноо</TableHead>
              <TableHead>Трейдер</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Сүүлд шинэчлэгдсэн</TableHead>
              <TableHead className="text-right">FTMO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} className="border-white/8">
                <TableCell>
                  <Link href={`/admin/rooms/${room.id}`} className="font-medium text-white hover:text-sky-200">
                    {room.title}
                  </Link>
                </TableCell>
                <TableCell className="text-white/70">{stepLabels[room.step]}</TableCell>
                <TableCell className="text-white/55">
                  {formatDate(room.startDate)} - {formatDate(room.endDate)}
                </TableCell>
                <TableCell className="text-white/70">{room.traders.length}</TableCell>
                <TableCell>
                  <StatusBadge
                    label={roomStatusLabels[room.lifecycleStatus]}
                    tone={room.lifecycleStatus === "ACTIVE" ? "success" : room.lifecycleStatus === "COMPLETED" ? "info" : "warning"}
                  />
                </TableCell>
                <TableCell className="text-white/55">{formatDateTime(room.updatedAt)}</TableCell>
                <TableCell className="text-right">
                  <form action={refreshRoomAction} className="inline-flex">
                    <input type="hidden" name="roomId" value={room.id} />
                    <input type="hidden" name="returnPath" value="/admin/rooms" />
                    <SubmitButton size="sm">FTMO дата татах</SubmitButton>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
