export const dynamic = "force-dynamic";

import Link from "next/link";
import { AccountSize, ApplicantStatus } from "@prisma/client";

import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";
import { accountSizeLabels, applicantStatusLabels } from "@/lib/labels";
import { getApplicantBuckets, listApplicants } from "@/server/services/applicant-service";
import { sendInvitationsAction, updateApplicantStatusAction } from "@/server/actions/admin-actions";

export default async function AdminApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const filterSize = typeof flash.size === "string" ? (flash.size as AccountSize) : undefined;
  const [buckets, applicants] = await Promise.all([getApplicantBuckets(), listApplicants(filterSize)]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Өргөдлийн удирдлага</h1>
        <p className="mt-2 text-sm text-white/60">Дансны хэмжээний ангиллаар шүүж, төлөв шинэчилж, 10 хүрэхэд урилга боловсруулах боломжтой.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/applicants" className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:bg-white/5">
          Бүгд
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
                <div className="text-lg font-semibold text-white">{accountSizeLabels[bucket.accountSize]} ангилал</div>
                <div className="text-sm text-white/55">
                  Идэвхтэй: {bucket.active} | Зөвшөөрсөн: {bucket.accepted}
                </div>
              </div>
              <StatusBadge label={bucket.ready ? "Өрөө бэлэн" : "Хүлээлттэй"} tone={bucket.ready ? "success" : "warning"} />
            </div>

            <form action={sendInvitationsAction} className="mt-4 space-y-3">
              <input type="hidden" name="accountSize" value={bucket.accountSize} />
              <input type="hidden" name="returnPath" value="/admin/applicants" />
              <input
                name="subject"
                defaultValue={bucket.template.subject}
                className="flex h-10 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
              <input
                name="roomLink"
                placeholder="https://your-room-link"
                className="flex h-10 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
              <textarea
                name="extraInstructions"
                defaultValue="Өрөөний заавар, Discord/Telegram холбоос, эхлэх хугацааг энд оруулна."
                rows={3}
                className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
              />
              <SubmitButton className="w-full justify-center" variant="secondary">
                Энэ ангиллын урилга боловсруулах
              </SubmitButton>
            </form>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {applicants.map((applicant) => (
          <div key={applicant.id} className="glass-panel p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{applicant.fullName}</div>
                <div className="mt-1 text-sm text-white/55">
                  {applicant.email} | {applicant.phoneNumber} | {applicant.telegramUsername || "Telegram мэдээлэлгүй"}
                </div>
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
                <SubmitButton size="sm">Төлөв хадгалах</SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
