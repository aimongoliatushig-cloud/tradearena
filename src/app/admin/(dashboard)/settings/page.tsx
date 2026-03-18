export const dynamic = "force-dynamic";

import { FlashMessage } from "@/components/shared/flash-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { env } from "@/lib/env";
import { saveSettingsAction } from "@/server/actions/admin-actions";
import {
  getDefaultScheduleConfig,
  getPaymentDetailsConfig,
  getRoomReadyEmailConfig,
} from "@/server/services/settings-service";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const [schedule, roomReadyEmail, paymentDetails] = await Promise.all([
    getDefaultScheduleConfig(),
    getRoomReadyEmailConfig(),
    getPaymentDetailsConfig(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">System settings</h1>
        <p className="mt-2 text-sm text-white/60">Default schedule, room-ready email template, and bank details.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="glass-panel p-6">
        <form action={saveSettingsAction} className="space-y-6">
          <input type="hidden" name="returnPath" value="/admin/settings" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Default refresh times</label>
              <input
                name="defaultScheduleInput"
                defaultValue={schedule.updateTimes.join(", ")}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Timezone</label>
              <input
                name="timezone"
                defaultValue={schedule.timezone}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Room ready email subject</label>
            <input
              name="roomReadySubject"
              defaultValue={roomReadyEmail.subject}
              className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Room ready email template</label>
            <textarea
              name="roomReadyMessage"
              rows={10}
              defaultValue={roomReadyEmail.message}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
            />
            <p className="text-xs text-white/45">
              Available placeholders: {"{fullName}"}, {"{roomTitle}"}, {"{roomSize}"}, {"{step}"}, {"{entryFee}"}, {"{bankName}"},{" "}
              {"{accountHolder}"}, {"{accountNumber}"}, {"{transactionValueHint}"}, {"{roomUrl}"}.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Bank name</label>
              <input
                name="bankName"
                defaultValue={paymentDetails.bankName}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Account holder</label>
              <input
                name="accountHolder"
                defaultValue={paymentDetails.accountHolder}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Account number</label>
              <input
                name="accountNumber"
                defaultValue={paymentDetails.accountNumber}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Payment reference hint</label>
              <input
                name="transactionValueHint"
                defaultValue={paymentDetails.transactionValueHint}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
          </div>

          <SubmitButton>Save settings</SubmitButton>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-5 text-sm text-white/65">
          <div className="font-medium text-white">SMTP</div>
          <div className="mt-2">{env.SMTP_HOST ? "Configured" : "Missing"}</div>
        </div>
        <div className="glass-panel p-5 text-sm text-white/65">
          <div className="font-medium text-white">Telegram Bot API</div>
          <div className="mt-2">{env.TELEGRAM_BOT_TOKEN ? "Token ready" : "Missing"}</div>
        </div>
        <div className="glass-panel p-5 text-sm text-white/65">
          <div className="font-medium text-white">Job endpoint</div>
          <div className="mt-2">{env.JOB_SHARED_SECRET ? "Configured" : "Missing"}</div>
        </div>
      </div>
    </section>
  );
}
