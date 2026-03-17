export const dynamic = "force-dynamic";

import { FlashMessage } from "@/components/shared/flash-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { env } from "@/lib/env";
import { saveSettingsAction } from "@/server/actions/admin-actions";
import { getDefaultScheduleConfig, getInvitationTemplates } from "@/server/services/settings-service";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const [schedule, templates] = await Promise.all([getDefaultScheduleConfig(), getInvitationTemplates()]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Системийн тохиргоо</h1>
        <p className="mt-2 text-sm text-white/60">Нийт schedule, урилгын template, integration readiness мэдээлэл.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="glass-panel p-6">
        <form action={saveSettingsAction} className="space-y-4">
          <input type="hidden" name="returnPath" value="/admin/settings" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Анхдагч шинэчлэлтийн цагууд</label>
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
            <label className="text-sm text-white/70">Invitation subject</label>
            <input
              name="invitationSubject"
              defaultValue={templates.subject}
              className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Invitation message template</label>
            <textarea
              name="invitationMessage"
              rows={6}
              defaultValue={templates.message}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
            />
          </div>

          <SubmitButton>Тохиргоо хадгалах</SubmitButton>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-5 text-sm text-white/65">
          <div className="font-medium text-white">SMTP</div>
          <div className="mt-2">{env.SMTP_HOST ? "Тохируулагдсан" : "Тохируулаагүй"}</div>
        </div>
        <div className="glass-panel p-5 text-sm text-white/65">
          <div className="font-medium text-white">Telegram Bot API</div>
          <div className="mt-2">{env.TELEGRAM_BOT_TOKEN ? "Token бэлэн" : "Token алга"}</div>
        </div>
        <div className="glass-panel p-5 text-sm text-white/65">
          <div className="font-medium text-white">Job endpoint</div>
          <div className="mt-2">{env.JOB_SHARED_SECRET ? "Secret тохируулагдсан" : "Secret алга"}</div>
        </div>
      </div>
    </section>
  );
}
