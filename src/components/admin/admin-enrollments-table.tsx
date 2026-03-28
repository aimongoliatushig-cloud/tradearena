"use client";

import { useMemo, useState } from "react";
import { PaymentStatus } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { confirmManualPaymentAction, deleteEnrollmentAction, markPaymentAsUnpaidAction, moveEnrollmentAction } from "@/server/actions/admin-actions";

type Tone = "success" | "warning" | "danger" | "info" | "muted";

type EnrollmentRow = {
  id: string;
  displayName: string;
  displayEmail: string;
  accountSizeLabel: string;
  packageName: string;
  paymentSummaryLabel: string;
  paymentSummaryTone: Tone;
  paymentDetailLabel: string;
  paymentDetailTone: Tone;
  enrollmentStatusLabel: string;
  enrollmentStatusTone: Tone;
  appliedAtLabel: string;
  createdAtLabel: string;
  updatedAtLabel: string;
  roomTitle: string | null;
  clerkUserId: string;
  payment: {
    id: string;
    status: PaymentStatus;
    customerName: string | null;
    customerEmail: string | null;
    reference: string | null;
    proofNote: string | null;
    proofUrl: string | null;
    submittedAtLabel: string;
    confirmedAtLabel: string;
    amountUsd: number;
    currency: string;
  } | null;
  applicant: {
    fullName: string;
    email: string;
    phoneNumber: string;
    telegramUsername: string | null;
    note: string | null;
    statusLabel: string;
    roomTitle: string | null;
  } | null;
  auditLogs: Array<{
    id: string;
    message: string;
    createdAtLabel: string;
  }>;
  targetRooms: Array<{
    id: string;
    title: string;
    occupancyLabel: string;
  }>;
};

function detailValue(value: string | null | undefined, fallback = "-") {
  return value && value.trim().length ? value : fallback;
}

export function AdminEnrollmentsTable({
  rows,
  returnPath,
}: {
  rows: EnrollmentRow[];
  returnPath: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId],
  );
  const approvablePayment =
    selectedRow?.payment &&
    selectedRow.payment.status !== PaymentStatus.CONFIRMED &&
    selectedRow.payment.status !== PaymentStatus.CANCELLED
      ? selectedRow.payment
      : null;
  const confirmedPayment = selectedRow?.payment?.status === PaymentStatus.CONFIRMED ? selectedRow.payment : null;

  return (
    <>
      <div className="glass-panel overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 bg-white/[0.03] hover:bg-white/[0.03]">
              <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Name</TableHead>
              <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Email</TableHead>
              <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Room Size</TableHead>
              <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Payment</TableHead>
              <TableHead className="h-11 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/48">Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(row.id);
                    }
                  }}
                  className="cursor-pointer border-white/8 bg-transparent text-left hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3daafe]/50"
                >
                  <TableCell className="px-3 py-2.5 whitespace-normal">
                    <div className="max-w-[16rem] truncate font-medium text-white">{row.displayName}</div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-white/62">
                    <div className="max-w-[18rem] truncate">{row.displayEmail}</div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-white/72">{row.accountSizeLabel}</TableCell>
                  <TableCell className="px-3 py-2.5">
                    <StatusBadge label={row.paymentSummaryLabel} tone={row.paymentSummaryTone} />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-white/55">{row.appliedAtLabel}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-white/8 hover:bg-transparent">
                <TableCell colSpan={5} className="px-4 py-8 text-center text-sm text-white/55">
                  No matching enrollments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(selectedRow)} onOpenChange={(open) => (!open ? setSelectedId(null) : undefined)}>
        {selectedRow ? (
          <DialogContent className="max-w-[calc(100%-1rem)] rounded-[1.75rem] border border-white/10 bg-[#0f151c] p-0 text-white sm:max-w-5xl">
            <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-7">
              <DialogHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={selectedRow.paymentSummaryLabel} tone={selectedRow.paymentSummaryTone} />
                  <StatusBadge label={selectedRow.paymentDetailLabel} tone={selectedRow.paymentDetailTone} />
                  <StatusBadge label={selectedRow.enrollmentStatusLabel} tone={selectedRow.enrollmentStatusTone} />
                  {selectedRow.roomTitle ? <StatusBadge label={selectedRow.roomTitle} tone="info" /> : null}
                </div>
                <DialogTitle className="text-3xl font-semibold tracking-[-0.04em] text-white">{selectedRow.displayName}</DialogTitle>
                <DialogDescription className="text-sm leading-7 text-white/62">
                  Review applicant details, payment proof, and room assignment from one place.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <DetailCard label="Email" value={selectedRow.displayEmail} />
                    <DetailCard label="Phone" value={selectedRow.applicant?.phoneNumber ?? "-"} />
                    <DetailCard label="Telegram" value={selectedRow.applicant?.telegramUsername ?? "-"} />
                    <DetailCard label="Package" value={selectedRow.packageName} />
                    <DetailCard label="Room Size" value={selectedRow.accountSizeLabel} />
                    <DetailCard label="Applied" value={selectedRow.appliedAtLabel} />
                    <DetailCard label="Checkout" value={selectedRow.createdAtLabel} />
                    <DetailCard label="Updated" value={selectedRow.updatedAtLabel} />
                    <DetailCard label="Current Room" value={selectedRow.roomTitle ?? "Not assigned"} />
                  </div>

                  <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-lg font-semibold text-white">Applicant Details</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <DetailCard label="Applicant Name" value={selectedRow.applicant?.fullName ?? selectedRow.displayName} />
                      <DetailCard label="Applicant Status" value={selectedRow.applicant?.statusLabel ?? "-"} />
                      <DetailCard label="Applicant Email" value={selectedRow.applicant?.email ?? selectedRow.displayEmail} />
                      <DetailCard label="Signup Room" value={selectedRow.applicant?.roomTitle ?? "-"} />
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-white/68">
                      {detailValue(selectedRow.applicant?.note, "No applicant note provided.")}
                    </div>
                  </section>

                  <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-lg font-semibold text-white">Payment Details</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <DetailCard label="Amount" value={selectedRow.payment ? `${selectedRow.payment.amountUsd} ${selectedRow.payment.currency}` : "-"} />
                      <DetailCard label="Reference" value={selectedRow.payment?.reference ?? "-"} />
                      <DetailCard label="Submitted" value={selectedRow.payment?.submittedAtLabel ?? "-"} />
                      <DetailCard label="Confirmed" value={selectedRow.payment?.confirmedAtLabel ?? "-"} />
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-white/68">
                      {detailValue(selectedRow.payment?.proofNote, "No payment note submitted yet.")}
                    </div>
                    {selectedRow.payment?.proofUrl ? (
                      <a
                        href={selectedRow.payment.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex text-sm font-medium text-[#8de8d2] underline underline-offset-4"
                      >
                        Open proof link
                      </a>
                    ) : null}
                  </section>

                  <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-lg font-semibold text-white">Activity</h3>
                    <div className="mt-4 space-y-3">
                      {selectedRow.auditLogs.length ? (
                        selectedRow.auditLogs.map((log) => (
                          <div key={log.id} className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.18em] text-white/38">{log.createdAtLabel}</div>
                            <div className="mt-2 text-sm leading-7 text-white/70">{log.message}</div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1rem] border border-dashed border-white/10 px-4 py-4 text-sm text-white/55">
                          No activity logged yet.
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-lg font-semibold text-white">Actions</h3>
                    <div className="mt-4 space-y-4">
                      {approvablePayment ? (
                        <form action={confirmManualPaymentAction} className="space-y-3">
                          <input type="hidden" name="paymentId" value={approvablePayment.id} />
                          <input type="hidden" name="returnPath" value={returnPath} />
                          <div className="rounded-[1rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-7 text-emerald-100/90">
                            {approvablePayment.status === PaymentStatus.PENDING_SUBMISSION
                              ? "No proof has been submitted yet, but you can still mark this applicant as paid and unlock access manually."
                              : "Approve this payment to mark the applicant as paid and unlock courses/resources immediately."}
                          </div>
                          <SubmitButton className="w-full justify-center" size="sm">
                            Mark As Paid
                          </SubmitButton>
                        </form>
                      ) : confirmedPayment ? (
                        <form action={markPaymentAsUnpaidAction} className="space-y-3">
                          <input type="hidden" name="paymentId" value={confirmedPayment.id} />
                          <input type="hidden" name="returnPath" value={returnPath} />
                          <div className="rounded-[1rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-100/90">
                            Mark this enrollment as unpaid to remove access to courses/resources and release the room assignment.
                          </div>
                          <SubmitButton className="w-full justify-center" size="sm" variant="destructive">
                            Mark As Unpaid
                          </SubmitButton>
                        </form>
                      ) : (
                        <div className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-white/60">
                          {!selectedRow.payment
                            ? "Payment record is missing for this enrollment."
                            : selectedRow.payment.status === PaymentStatus.CONFIRMED
                              ? "Payment is already approved."
                              : "This payment was cancelled and cannot be approved from here."}
                        </div>
                      )}

                      {selectedRow.targetRooms.length ? (
                        <form action={moveEnrollmentAction} className="space-y-3">
                          <input type="hidden" name="enrollmentId" value={selectedRow.id} />
                          <input type="hidden" name="returnPath" value={returnPath} />
                          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Move to room</label>
                          <select
                            name="roomId"
                            defaultValue={selectedRow.targetRooms[0]?.id}
                            className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-sm text-white outline-none"
                          >
                            {selectedRow.targetRooms.map((room) => (
                              <option key={room.id} value={room.id}>
                                {room.title} ({room.occupancyLabel})
                              </option>
                            ))}
                          </select>
                          <SubmitButton className="w-full justify-center" size="sm" variant="secondary">
                            Move Enrollment
                          </SubmitButton>
                        </form>
                      ) : (
                        <div className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-white/60">
                          No alternative rooms are available for this package right now.
                        </div>
                      )}

                      <form
                        action={deleteEnrollmentAction}
                        className="space-y-3"
                        onSubmit={(event) => {
                          if (!window.confirm(`Delete ${selectedRow.displayName}'s signup? This removes the payment record and frees the room spot.`)) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="enrollmentId" value={selectedRow.id} />
                        <input type="hidden" name="returnPath" value={returnPath} />
                        <div className="rounded-[1rem] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-7 text-rose-100/90">
                          Permanently delete this signup, its payment proof, and any current room assignment. Room counts update immediately after removal.
                        </div>
                        <SubmitButton className="w-full justify-center" size="sm" variant="destructive">
                          Delete Signup
                        </SubmitButton>
                      </form>
                    </div>
                  </section>

                  <section className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                    <h3 className="text-lg font-semibold text-white">System</h3>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-white/68">
                      <div>
                        <div className="text-white/42">Clerk User</div>
                        <div className="break-all text-white">{selectedRow.clerkUserId}</div>
                      </div>
                      <div>
                        <div className="text-white/42">Enrollment Status</div>
                        <div>{selectedRow.enrollmentStatusLabel}</div>
                      </div>
                      <div>
                        <div className="text-white/42">Payment Status</div>
                        <div>{selectedRow.paymentDetailLabel}</div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">{label}</div>
      <div className="mt-2 text-sm leading-6 text-white">{detailValue(value)}</div>
    </div>
  );
}
