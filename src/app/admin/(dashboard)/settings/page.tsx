export const dynamic = "force-dynamic";

import { FlashMessage } from "@/components/shared/flash-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { env } from "@/lib/env";
import { saveSettingsAction } from "@/server/actions/admin-actions";
import {
  getDefaultScheduleConfig,
  getMemberExperienceConfig,
  getPaymentDetailsConfig,
  getRoomReadyEmailConfig,
} from "@/server/services/settings-service";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const [schedule, roomReadyEmail, paymentDetails, memberExperience] = await Promise.all([
    getDefaultScheduleConfig(),
    getRoomReadyEmailConfig(),
    getPaymentDetailsConfig(),
    getMemberExperienceConfig(),
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Тохиргоо</h1>
        <p className="mt-2 text-sm text-white/60">Төлбөр, мэдэгдэл, коучинг болон дэмжлэгийн холбоосуудыг эндээс удирдана.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="glass-panel p-6">
        <form action={saveSettingsAction} className="space-y-6">
          <input type="hidden" name="returnPath" value="/admin/settings" />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="FTMO refresh цагууд">
              <input name="defaultScheduleInput" defaultValue={schedule.updateTimes.join(", ")} className={inputClassName} />
            </Field>
            <Field label="Timezone">
              <input name="timezone" defaultValue={schedule.timezone} className={inputClassName} />
            </Field>
          </div>

          <Field label="Өрөө бэлэн болсон мэдэгдлийн гарчиг">
            <input name="roomReadySubject" defaultValue={roomReadyEmail.subject} className={inputClassName} />
          </Field>

          <Field label="Өрөө бэлэн болсон мэдэгдлийн текст">
            <textarea name="roomReadyMessage" rows={10} defaultValue={roomReadyEmail.message} className={textareaClassName} />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Банк">
              <input name="bankName" defaultValue={paymentDetails.bankName} className={inputClassName} />
            </Field>
            <Field label="Хүлээн авагч">
              <input name="accountHolder" defaultValue={paymentDetails.accountHolder} className={inputClassName} />
            </Field>
            <Field label="Данс">
              <input name="accountNumber" defaultValue={paymentDetails.accountNumber} className={inputClassName} />
            </Field>
            <Field label="Гүйлгээний утга">
              <input name="transactionValueHint" defaultValue={paymentDetails.transactionValueHint} className={inputClassName} />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Коучингийн товчны текст">
              <input name="coachingCtaLabel" defaultValue={memberExperience.coachingCtaLabel} className={inputClassName} />
            </Field>
            <Field label="Коучингийн холбоос">
              <input name="coachingCtaUrl" defaultValue={memberExperience.coachingCtaUrl} className={inputClassName} />
            </Field>
            <Field label="Дэмжлэгийн товчны текст">
              <input name="supportCtaLabel" defaultValue={memberExperience.supportCtaLabel} className={inputClassName} />
            </Field>
            <Field label="Дэмжлэгийн холбоос">
              <input name="supportCtaUrl" defaultValue={memberExperience.supportCtaUrl} className={inputClassName} />
            </Field>
          </div>

          <SubmitButton>Тохиргоо хадгалах</SubmitButton>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusBox title="SMTP" value={env.SMTP_HOST ? "Тохируулагдсан" : "Дутуу"} />
        <StatusBox title="Telegram Bot API" value={env.TELEGRAM_BOT_TOKEN ? "Бэлэн" : "Дутуу"} />
        <StatusBox title="Job endpoint" value={env.JOB_SHARED_SECRET ? "Тохируулагдсан" : "Дутуу"} />
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-white/70">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatusBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="glass-panel p-5 text-sm text-white/65">
      <div className="font-medium text-white">{title}</div>
      <div className="mt-2">{value}</div>
    </div>
  );
}

const inputClassName = "flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none";
const textareaClassName = "w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none";
