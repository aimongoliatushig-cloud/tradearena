export const dynamic = "force-dynamic";

import { FlashMessage } from "@/components/shared/flash-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { accountSizeLabels, courseAccessLevelLabels } from "@/lib/labels";
import { ACCOUNT_SIZE_OPTIONS, COURSE_ACCESS_LEVEL_OPTIONS } from "@/lib/prisma-enums";
import { savePackageTierAction } from "@/server/actions/admin-actions";
import { listAdminPackageTiers } from "@/server/services/package-service";

export default async function AdminPackagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const packages = await listAdminPackageTiers();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Багцууд</h1>
        <p className="mt-2 text-sm text-white/60">Үнэ, түвшин, давуу тал, коучинг, индикатор, сургалтын эрхийг эндээс удирдана.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PackageForm returnPath="/admin/packages" />
        {packages.map((item) => (
          <PackageForm
            key={item.id}
            item={{
              ...item,
              featuresInput: item.featuresMn.join("\n"),
            }}
            returnPath="/admin/packages"
          />
        ))}
      </div>
    </section>
  );
}

function PackageForm({
  item,
  returnPath,
}: {
  item?: {
    id: string;
    accountSize: (typeof ACCOUNT_SIZE_OPTIONS)[number];
    coachingHours: number;
    courseAccessLevel: (typeof COURSE_ACCESS_LEVEL_OPTIONS)[number];
    featuresInput: string;
    includesCoaching: boolean;
    includesIndicators: boolean;
    isActive: boolean;
    maxUsers: number;
    nameMn: string;
    priceUsd: number;
    prioritySupport: boolean;
    sortOrder: number;
    strategyCount: number;
  };
  returnPath: string;
}) {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">{item ? `${item.nameMn} засах` : "Шинэ багц"}</h2>
      <form action={savePackageTierAction} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={item?.id} />
        <input type="hidden" name="returnPath" value={returnPath} />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Нэр">
            <input name="nameMn" defaultValue={item?.nameMn} className={inputClassName} />
          </Field>
          <Field label="Дараалал">
            <input name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} className={inputClassName} />
          </Field>
          <Field label="Дүн">
            <select name="accountSize" defaultValue={item?.accountSize ?? ACCOUNT_SIZE_OPTIONS[0]} className={inputClassName}>
              {ACCOUNT_SIZE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {accountSizeLabels[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Үнэ (USD)">
            <input name="priceUsd" type="number" min={0} step="0.01" defaultValue={item?.priceUsd ?? 0} className={inputClassName} />
          </Field>
          <Field label="Өрөөний дээд хүн">
            <input name="maxUsers" type="number" min={1} max={50} defaultValue={item?.maxUsers ?? 10} className={inputClassName} />
          </Field>
          <Field label="Стратегийн тоо">
            <input name="strategyCount" type="number" min={0} defaultValue={item?.strategyCount ?? 0} className={inputClassName} />
          </Field>
          <Field label="Коучингийн цаг">
            <input name="coachingHours" type="number" min={0} defaultValue={item?.coachingHours ?? 0} className={inputClassName} />
          </Field>
          <Field label="Сургалтын түвшин">
            <select name="courseAccessLevel" defaultValue={item?.courseAccessLevel ?? COURSE_ACCESS_LEVEL_OPTIONS[0]} className={inputClassName}>
              {COURSE_ACCESS_LEVEL_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {courseAccessLevelLabels[value]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Давуу талууд">
          <textarea name="featuresInput" rows={6} defaultValue={item?.featuresInput ?? ""} className={textareaClassName} />
        </Field>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <CheckboxField name="includesCoaching" label="Коучинг орно" defaultChecked={item?.includesCoaching ?? false} />
          <CheckboxField name="includesIndicators" label="Индикатор орно" defaultChecked={item?.includesIndicators ?? false} />
          <CheckboxField name="prioritySupport" label="Давуу дэмжлэг" defaultChecked={item?.prioritySupport ?? false} />
          <CheckboxField name="isActive" label="Идэвхтэй" defaultChecked={item?.isActive ?? true} />
        </div>

        <SubmitButton>{item ? "Багц хадгалах" : "Багц үүсгэх"}</SubmitButton>
      </form>
    </div>
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

function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

const inputClassName = "flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none";
const textareaClassName = "w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none";
