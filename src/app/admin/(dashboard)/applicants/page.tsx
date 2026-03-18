export const dynamic = "force-dynamic";

import Link from "next/link";
import { AccountSize, ApplicantStatus, NotificationStatus } from "@prisma/client";

import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  accountSizeLabels,
  applicantStatusLabels,
  notificationChannelLabels,
  notificationKindLabels,
  notificationStatusLabels,
} from "@/lib/labels";
import { formatDateTime } from "@/lib/format";
import { getApplicantBuckets, listApplicants } from "@/server/services/applicant-service";
import { listRecentNotificationDispatches } from "@/server/services/notification-service";
import { updateApplicantStatusAction } from "@/server/actions/admin-actions";

function getNotificationTone(status: NotificationStatus) {
  switch (status) {
    case NotificationStatus.SENT:
      return "success";
    case NotificationStatus.FAILED:
      return "danger";
    case NotificationStatus.SKIPPED:
      return "warning";
    default:
      return "muted";
  }
}

export default async function AdminApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const filterSize = typeof flash.size === "string" ? (flash.size as AccountSize) : undefined;
  const [buckets, applicants, recentNotifications] = await Promise.all([
    getApplicantBuckets(),
    listApplicants(filterSize),
    listRecentNotificationDispatches(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Applicants</h1>
        <p className="mt-2 text-sm text-white/60">
          Track signup queues, update applicant status, and review every email that was generated for room signup and room-ready events.
        </p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/applicants" className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:bg-white/5">
          All
        </Link>
        {Object.values(AccountSize).map((size) => (
          <Link
            key={size}
            href={`/admin/applicants?size=${size}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              filterSize === size ? "border-sky-300/60 bg-sky-400/10 text-white" : "border-white/12 text-white/70 hover:bg-white/5"
            }`}
          >
            {accountSizeLabels[size]}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {buckets.map((bucket) => (
          <div key={bucket.accountSize} className="glass-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">{accountSizeLabels[bucket.accountSize]} queue</div>
                <div className="text-sm text-white/55">
                  Active signups: {bucket.active} | Contacted: {bucket.accepted}
                </div>
              </div>
              <StatusBadge label={bucket.ready ? "Room ready" : "Waiting for 10/10"} tone={bucket.ready ? "success" : "warning"} />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Recent notifications</h2>
          <p className="mt-1 text-sm text-white/55">Every generated email is logged here for admin review.</p>
        </div>

        <div className="space-y-3">
          {recentNotifications.length ? (
            recentNotifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-medium text-white">{notification.subject ?? notificationKindLabels[notification.kind]}</div>
                    <div className="text-sm text-white/55">
                      {notification.recipient} | {notification.room?.title ?? "-"} | {notification.applicant?.fullName ?? "-"}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label={notificationChannelLabels[notification.channel]} tone="info" />
                    <StatusBadge label={notificationKindLabels[notification.kind]} tone="muted" />
                    <StatusBadge label={notificationStatusLabels[notification.status]} tone={getNotificationTone(notification.status)} />
                  </div>
                </div>
                <div className="mt-3 whitespace-pre-line text-sm leading-6 text-white/62">{notification.message}</div>
                <div className="mt-3 text-xs text-white/40">{formatDateTime(notification.createdAt)}</div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">No notifications have been logged yet.</div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {applicants.map((applicant) => (
          <div key={applicant.id} className="glass-panel p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{applicant.fullName}</div>
                <div className="mt-1 text-sm text-white/55">
                  {applicant.email} | {applicant.phoneNumber} | {applicant.telegramUsername || "No Telegram"}
                </div>
                <div className="mt-1 text-sm text-white/45">{applicant.room?.title ?? "Room not selected"}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge label={accountSizeLabels[applicant.desiredAccountSize]} tone="info" />
                  <StatusBadge label={applicantStatusLabels[applicant.status]} tone={applicant.status === ApplicantStatus.REJECTED ? "danger" : "muted"} />
                </div>
              </div>

              <form action={updateApplicantStatusAction} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="applicantId" value={applicant.id} />
                <input type="hidden" name="returnPath" value="/admin/applicants" />
                <select
                  name="status"
                  defaultValue={applicant.status}
                  className="flex h-10 rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
                >
                  {Object.values(ApplicantStatus).map((status) => (
                    <option key={status} value={status}>
                      {applicantStatusLabels[status]}
                    </option>
                  ))}
                </select>
                <SubmitButton size="sm">Save status</SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
