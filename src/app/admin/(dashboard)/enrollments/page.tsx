export const dynamic = "force-dynamic";

import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
import { packageEnrollmentStatusLabels, paymentStatusLabels } from "@/lib/labels";
import { confirmManualPaymentAction, moveEnrollmentAction } from "@/server/actions/admin-actions";
import { listAdminEnrollments, listPackageRoomsForAdmin } from "@/server/services/enrollment-service";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const [enrollments, rooms] = await Promise.all([listAdminEnrollments(), listPackageRoomsForAdmin()]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Элсэлт ба төлбөр</h1>
        <p className="mt-2 text-sm text-white/60">Төлбөр баталгаажуулах, өрөө солих, төлөв шалгах үйлдлийг эндээс хийнэ.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="space-y-4">
        {enrollments.map((enrollment) => {
          const targetRooms = rooms.filter((room) => room.packageTierId === enrollment.packageTierId && room.id !== enrollment.roomId);

          return (
            <div key={enrollment.id} className="glass-panel p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{enrollment.payment?.customerName || enrollment.payment?.customerEmail || enrollment.clerkUserId}</div>
                    <div className="mt-1 text-sm text-white/55">{enrollment.packageTier.nameMn}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label={packageEnrollmentStatusLabels[enrollment.status]} tone={enrollment.status === "ENROLLED" ? "success" : "warning"} />
                    {enrollment.payment ? (
                      <StatusBadge
                        label={paymentStatusLabels[enrollment.payment.status]}
                        tone={enrollment.payment.status === "CONFIRMED" ? "success" : "warning"}
                      />
                    ) : null}
                    {enrollment.room ? <StatusBadge label={enrollment.room.title} tone="info" /> : null}
                  </div>
                  <div className="text-sm leading-7 text-white/60">
                    <div>Гүйлгээний утга: {enrollment.payment?.reference || "-"}</div>
                    <div>И-мэйл: {enrollment.payment?.customerEmail || "-"}</div>
                    <div>Тайлбар: {enrollment.payment?.proofNote || "-"}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {enrollment.payment?.status === "PENDING_CONFIRMATION" ? (
                    <form action={confirmManualPaymentAction}>
                      <input type="hidden" name="paymentId" value={enrollment.payment.id} />
                      <input type="hidden" name="returnPath" value="/admin/enrollments" />
                      <SubmitButton size="sm">Төлбөр баталгаажуулах</SubmitButton>
                    </form>
                  ) : null}

                  {targetRooms.length ? (
                    <form action={moveEnrollmentAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <input type="hidden" name="returnPath" value="/admin/enrollments" />
                      <select name="roomId" defaultValue={targetRooms[0]?.id} className="flex h-10 rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none">
                        {targetRooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.title}
                          </option>
                        ))}
                      </select>
                      <SubmitButton size="sm" variant="secondary">
                        Өрөө солих
                      </SubmitButton>
                    </form>
                  ) : null}
                </div>
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
