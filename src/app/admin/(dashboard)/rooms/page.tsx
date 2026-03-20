export const dynamic = "force-dynamic";

import Link from "next/link";

import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
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
          <h1 className="text-3xl font-semibold text-white">Өрөөнүүд</h1>
          <p className="mt-2 text-sm text-white/60">FTMO өрөөнүүд болон багцын өрөөнүүдийг нэг цэгээс хянана.</p>
        </div>
        <Button render={<Link href="/admin/rooms/new" />}>Шинэ FTMO өрөө</Button>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead>Өрөө</TableHead>
              <TableHead>Төрөл</TableHead>
              <TableHead>Тайлбар</TableHead>
              <TableHead>Хүний тоо</TableHead>
              <TableHead>Төлөв</TableHead>
              <TableHead>Шинэчлэгдсэн</TableHead>
              <TableHead className="text-right">Үйлдэл</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => {
              const activeEnrollmentCount = room.packageEnrollments.filter((item) => item.status === "ENROLLED" || item.status === "AWAITING_DECISION").length;

              return (
                <TableRow key={room.id} className="border-white/8">
                  <TableCell>
                    <Link href={`/admin/rooms/${room.id}`} className="font-medium text-white hover:text-sky-200">
                      {room.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-white/70">{room.isPackageRoom ? "Багцын өрөө" : "FTMO өрөө"}</TableCell>
                  <TableCell className="text-white/55">
                    {room.isPackageRoom ? room.packageTier?.nameMn : stepLabels[room.step]}
                  </TableCell>
                  <TableCell className="text-white/70">
                    {room.isPackageRoom ? `${activeEnrollmentCount}/${room.maxTraderCapacity}` : String(room.traders.length)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      label={roomStatusLabels[room.lifecycleStatus]}
                      tone={room.lifecycleStatus === "ACTIVE" || room.lifecycleStatus === "READY_TO_START" ? "success" : room.lifecycleStatus === "AWAITING_DECISION" ? "warning" : "info"}
                    />
                  </TableCell>
                  <TableCell className="text-white/55">{formatDateTime(room.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" render={<Link href={`/admin/rooms/${room.id}`} />}>
                        Дэлгэрэнгүй
                      </Button>
                      {!room.isPackageRoom ? (
                        <form action={refreshRoomAction}>
                          <input type="hidden" name="roomId" value={room.id} />
                          <input type="hidden" name="returnPath" value="/admin/rooms" />
                          <SubmitButton size="sm">FTMO шинэчлэх</SubmitButton>
                        </form>
                      ) : null}
                    </div>
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
