export const dynamic = "force-dynamic";

import Link from "next/link";
import { ApplicantStatus, NotificationStatus, type AccountSize } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/format";
import {
  accountSizeLabels,
  applicantStatusLabels,
  notificationChannelLabels,
  notificationKindLabels,
  notificationStatusLabels,
} from "@/lib/labels";
import { ACCOUNT_SIZE_OPTIONS } from "@/lib/prisma-enums";
import {
  addApplicantCommentAction,
  moveApplicantToTrashAction,
  restoreApplicantFromTrashAction,
  updateApplicantStatusAction,
} from "@/server/actions/admin-actions";
import { getApplicantBuckets, listApplicants } from "@/server/services/applicant-service";
import { listRecentNotificationDispatches } from "@/server/services/notification-service";

type ApplicantsView = "active" | "trash";

function normalizeView(value: string | string[] | undefined): ApplicantsView {
  return value === "trash" ? "trash" : "active";
}

function normalizeSize(value: string | string[] | undefined): AccountSize | undefined {
  return typeof value === "string" && ACCOUNT_SIZE_OPTIONS.includes(value as AccountSize) ? (value as AccountSize) : undefined;
}

function buildApplicantsHref(view: ApplicantsView, size?: AccountSize) {
  const params = new URLSearchParams();
  if (view === "trash") {
    params.set("view", "trash");
  }
  if (size) {
    params.set("size", size);
  }

  return params.size ? `/admin/applicants?${params.toString()}` : "/admin/applicants";
}

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
  const params = await searchParams;
  const view = normalizeView(params.view);
  const filterSize = normalizeSize(params.size);
  const returnPath = buildApplicantsHref(view, filterSize);

  const [applicants, recentNotifications, buckets] = await Promise.all([
    listApplicants(filterSize, view),
    view === "active" ? listRecentNotificationDispatches() : Promise.resolve([]),
    view === "active" ? getApplicantBuckets() : Promise.resolve([]),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Applicants</h1>
        <p className="mt-2 text-sm text-white/60">
          Review applicants, keep an internal comment history, and move inactive leads into trash without deleting them.
        </p>
      </div>

      <FlashMessage
        success={typeof params.success === "string" ? params.success : undefined}
        error={typeof params.error === "string" ? params.error : undefined}
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href={buildApplicantsHref("active", filterSize)}
          className={`rounded-full border px-4 py-2 text-sm ${
            view === "active" ? "border-emerald-300/60 bg-emerald-400/10 text-white" : "border-white/12 text-white/70 hover:bg-white/5"
          }`}
        >
          Active Applicants
        </Link>
        <Link
          href={buildApplicantsHref("trash", filterSize)}
          className={`rounded-full border px-4 py-2 text-sm ${
            view === "trash" ? "border-amber-300/60 bg-amber-400/10 text-white" : "border-white/12 text-white/70 hover:bg-white/5"
          }`}
        >
          Trash
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={buildApplicantsHref(view)}
          className={`rounded-full border px-4 py-2 text-sm ${
            !filterSize ? "border-sky-300/60 bg-sky-400/10 text-white" : "border-white/12 text-white/70 hover:bg-white/5"
          }`}
        >
          All sizes
        </Link>
        {ACCOUNT_SIZE_OPTIONS.map((size) => (
          <Link
            key={size}
            href={buildApplicantsHref(view, size)}
            className={`rounded-full border px-4 py-2 text-sm ${
              filterSize === size ? "border-sky-300/60 bg-sky-400/10 text-white" : "border-white/12 text-white/70 hover:bg-white/5"
            }`}
          >
            {accountSizeLabels[size]}
          </Link>
        ))}
      </div>

      {view === "active" ? (
        <>
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
        </>
      ) : (
        <div className="glass-panel p-5">
          <div className="text-lg font-semibold text-white">Trashed applicants</div>
          <div className="mt-1 text-sm text-white/55">Applicants moved to trash stay here until an admin restores them.</div>
        </div>
      )}

      <div className="space-y-4">
        {applicants.length ? (
          applicants.map((applicant) => (
            <div key={applicant.id} className="glass-panel space-y-5 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">{applicant.fullName}</div>
                  <div className="text-sm text-white/55">
                    {applicant.email} | {applicant.phoneNumber} | {applicant.telegramUsername || "No Telegram"}
                  </div>
                  <div className="text-sm text-white/45">
                    {applicant.room?.title ?? "Room not selected"} | Applied {formatDateTime(applicant.createdAt)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={accountSizeLabels[applicant.desiredAccountSize]} tone="info" />
                    <StatusBadge label={applicantStatusLabels[applicant.status]} tone={applicant.status === ApplicantStatus.REJECTED ? "danger" : "muted"} />
                    {applicant.trashedAt ? <StatusBadge label={`Trashed ${formatDateTime(applicant.trashedAt)}`} tone="warning" /> : null}
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:items-end">
                  {view === "active" ? (
                    <form action={updateApplicantStatusAction} className="flex flex-wrap items-center gap-3">
                      <input type="hidden" name="applicantId" value={applicant.id} />
                      <input type="hidden" name="returnPath" value={returnPath} />
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
                  ) : null}

                  <form action={view === "active" ? moveApplicantToTrashAction : restoreApplicantFromTrashAction}>
                    <input type="hidden" name="applicantId" value={applicant.id} />
                    <input type="hidden" name="returnPath" value={returnPath} />
                    <SubmitButton size="sm" variant={view === "active" ? "destructive" : "secondary"}>
                      {view === "active" ? "Move To Trash" : "Restore Applicant"}
                    </SubmitButton>
                  </form>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">Application note</div>
                    <div className="mt-3 text-sm leading-7 text-white/72">{applicant.note?.trim() ? applicant.note : "No application note."}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">Admin comments</div>
                      <div className="text-xs text-white/40">{applicant.comments.length} total</div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {applicant.comments.length ? (
                        applicant.comments.map((comment) => (
                          <div key={comment.id} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                              {comment.adminUser.name} | {formatDateTime(comment.createdAt)}
                            </div>
                            <div className="mt-2 whitespace-pre-line text-sm leading-7 text-white/72">{comment.body}</div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-white/55">
                          No admin comments yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm font-semibold text-white">Add comment</div>
                  <p className="mt-1 text-sm text-white/50">Internal comments stay attached to the applicant record with timestamps.</p>
                  <form action={addApplicantCommentAction} className="mt-4 space-y-3">
                    <input type="hidden" name="applicantId" value={applicant.id} />
                    <input type="hidden" name="returnPath" value={returnPath} />
                    <textarea
                      name="body"
                      rows={5}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                      placeholder="Add an internal update, next step, or note about this applicant."
                    />
                    <SubmitButton size="sm">Add Comment</SubmitButton>
                  </form>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-6 text-sm text-white/60">
            {view === "trash" ? "No applicants are in trash right now." : "No applicants match this filter."}
          </div>
        )}
      </div>
    </section>
  );
}
