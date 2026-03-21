export const dynamic = "force-dynamic";

import Link from "next/link";
import { PackageEnrollmentStatus, PaymentStatus } from "@prisma/client";

import { AdminEnrollmentsTable } from "@/components/admin/admin-enrollments-table";
import { FlashMessage } from "@/components/shared/flash-message";
import { buttonVariants } from "@/lib/button-variants";
import { formatDateTime } from "@/lib/format";
import {
  accountSizeLabels,
  applicantStatusLabels,
  packageEnrollmentStatusLabels,
  paymentStatusLabels,
} from "@/lib/labels";
import { listAdminEnrollments, listPackageRoomsForAdmin } from "@/server/services/enrollment-service";

type PaymentFilter = "all" | "pending" | "paid";

function normalizeQuery(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePaymentFilter(value: string | string[] | undefined): PaymentFilter {
  if (value === "pending" || value === "paid") {
    return value;
  }

  return "all";
}

function getEnrollmentTone(status: PackageEnrollmentStatus): "success" | "warning" {
  return status === PackageEnrollmentStatus.ENROLLED ? "success" : "warning";
}

function getPaymentTone(status: PaymentStatus | null | undefined): "success" | "warning" | "danger" {
  if (status === PaymentStatus.CONFIRMED) {
    return "success";
  }

  if (status === PaymentStatus.CANCELLED) {
    return "danger";
  }

  return "warning";
}

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = normalizeQuery(params.q);
  const paymentFilter = normalizePaymentFilter(params.payment);

  const [enrollments, rooms] = await Promise.all([
    listAdminEnrollments({
      query,
      paymentState: paymentFilter,
    }),
    listPackageRoomsForAdmin(),
  ]);

  const currentFilters = new URLSearchParams();
  if (query) {
    currentFilters.set("q", query);
  }
  if (paymentFilter !== "all") {
    currentFilters.set("payment", paymentFilter);
  }

  const returnPath = currentFilters.size ? `/admin/enrollments?${currentFilters.toString()}` : "/admin/enrollments";

  const rows = enrollments.map((enrollment) => {
    const targetRooms = rooms.filter((room) => room.packageTierId === enrollment.packageTierId && room.id !== enrollment.roomId);
    const paymentState = enrollment.payment?.status === PaymentStatus.CONFIRMED ? "paid" : "pending";

    return {
      id: enrollment.id,
      displayName:
        enrollment.applicant?.fullName ||
        enrollment.payment?.customerName ||
        enrollment.payment?.customerEmail ||
        enrollment.clerkUserId,
      displayEmail: enrollment.payment?.customerEmail || enrollment.applicant?.email || "-",
      accountSizeLabel: accountSizeLabels[enrollment.packageTier.accountSize],
      packageName: enrollment.packageTier.nameMn,
      paymentSummaryLabel: paymentState === "paid" ? "Paid" : "Pending",
      paymentSummaryTone: paymentState === "paid" ? ("success" as const) : ("warning" as const),
      paymentDetailLabel: enrollment.payment ? paymentStatusLabels[enrollment.payment.status] : "No payment record",
      paymentDetailTone: getPaymentTone(enrollment.payment?.status),
      enrollmentStatusLabel: packageEnrollmentStatusLabels[enrollment.status],
      enrollmentStatusTone: getEnrollmentTone(enrollment.status),
      appliedAtLabel: formatDateTime(enrollment.appliedAt),
      createdAtLabel: formatDateTime(enrollment.createdAt),
      updatedAtLabel: formatDateTime(enrollment.updatedAt),
      roomTitle: enrollment.room?.title ?? null,
      clerkUserId: enrollment.clerkUserId,
      payment: enrollment.payment
        ? {
            id: enrollment.payment.id,
            status: enrollment.payment.status,
            customerName: enrollment.payment.customerName,
            customerEmail: enrollment.payment.customerEmail,
            reference: enrollment.payment.reference,
            proofNote: enrollment.payment.proofNote,
            proofUrl: enrollment.payment.proofUrl,
            submittedAtLabel: formatDateTime(enrollment.payment.submittedAt),
            confirmedAtLabel: formatDateTime(enrollment.payment.confirmedAt),
            amountUsd: enrollment.payment.amountUsd,
            currency: enrollment.payment.currency,
          }
        : null,
      applicant: enrollment.applicant
        ? {
            fullName: enrollment.applicant.fullName,
            email: enrollment.applicant.email,
            phoneNumber: enrollment.applicant.phoneNumber,
            telegramUsername: enrollment.applicant.telegramUsername,
            note: enrollment.applicant.note,
            statusLabel: applicantStatusLabels[enrollment.applicant.status],
            roomTitle: enrollment.applicant.room?.title ?? null,
          }
        : null,
      auditLogs: enrollment.auditLogs.map((log) => ({
        id: log.id,
        message: log.message,
        createdAtLabel: formatDateTime(log.createdAt),
      })),
      targetRooms: targetRooms.map((room) => ({
        id: room.id,
        title: room.title,
        occupancyLabel: `${room.activeCount}/${room.maxTraderCapacity}`,
      })),
    };
  });

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Enrollments And Payments</h1>
        <p className="text-sm text-white/60">
          Review applicants, verify manual payments, and keep the most recent enrollments at the top of the list.
        </p>
      </div>

      <FlashMessage
        success={typeof params.success === "string" ? params.success : undefined}
        error={typeof params.error === "string" ? params.error : undefined}
      />

      <form method="get" className="glass-panel flex flex-col gap-3 p-4 xl:flex-row xl:items-center">
        <div className="flex-1">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name, email, or phone"
            className="h-12 w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#3daafe] focus:ring-3 focus:ring-[#0781fe]/25"
          />
        </div>
        <select
          name="payment"
          defaultValue={paymentFilter}
          className="flex h-12 rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-sm text-white outline-none"
        >
          <option value="all">All payments</option>
          <option value="pending">Pending only</option>
          <option value="paid">Paid only</option>
        </select>
        <button type="submit" className={buttonVariants({ size: "sm" })}>
          Apply Filters
        </button>
        <Link href="/admin/enrollments" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Reset
        </Link>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/55">
        <div>
          Showing <span className="font-semibold text-white">{rows.length}</span> enrollments
        </div>
        <div>Most recent applicants first</div>
      </div>

      <AdminEnrollmentsTable rows={rows} returnPath={returnPath} />
    </section>
  );
}
