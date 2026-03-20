export const dynamic = "force-dynamic";

import type { ReactNode } from "react";

import { FlashMessage } from "@/components/shared/flash-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { resourceTypeLabels } from "@/lib/labels";
import { RESOURCE_TYPE_OPTIONS } from "@/lib/prisma-enums";
import { saveResourceAction } from "@/server/actions/admin-actions";
import { listAdminPackageTiers } from "@/server/services/package-service";
import { listAdminResources } from "@/server/services/resource-service";

export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const [resources, packages] = await Promise.all([listAdminResources(), listAdminPackageTiers()]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Нөөцүүд</h1>
        <p className="mt-2 text-sm text-white/60">Стратеги, индикатор, хэрэгслийн холбоосуудыг багцын эрхээр удирдана.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="grid gap-6">
        <ResourceForm packages={packages.map((item) => ({ id: item.id, nameMn: item.nameMn }))} />
        {resources.map((resource) => (
          <ResourceForm
            key={resource.id}
            packages={packages.map((item) => ({ id: item.id, nameMn: item.nameMn }))}
            item={{
              id: resource.id,
              titleMn: resource.titleMn,
              descriptionMn: resource.descriptionMn ?? "",
              type: resource.type,
              linkUrl: resource.linkUrl,
              packageTierIds: resource.packageAccess.map((item) => item.packageTierId),
              sortOrder: resource.sortOrder,
              isPublished: resource.isPublished,
            }}
          />
        ))}
      </div>
    </section>
  );
}

function ResourceForm({
  item,
  packages,
}: {
  item?: {
    id: string;
    titleMn: string;
    descriptionMn: string;
    type: (typeof RESOURCE_TYPE_OPTIONS)[number];
    linkUrl: string;
    packageTierIds: string[];
    sortOrder: number;
    isPublished: boolean;
  };
  packages: Array<{ id: string; nameMn: string }>;
}) {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">{item ? `${item.titleMn} засах` : "Шинэ нөөц"}</h2>
      <form action={saveResourceAction} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={item?.id} />
        <input type="hidden" name="returnPath" value="/admin/resources" />

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Нэр">
            <input name="titleMn" defaultValue={item?.titleMn} className={inputClassName} />
          </Field>
          <Field label="Төрөл">
            <select name="type" defaultValue={item?.type ?? RESOURCE_TYPE_OPTIONS[0]} className={inputClassName}>
              {RESOURCE_TYPE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {resourceTypeLabels[value]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Дараалал">
            <input name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} className={inputClassName} />
          </Field>
        </div>

        <Field label="Тайлбар">
          <textarea name="descriptionMn" rows={3} defaultValue={item?.descriptionMn ?? ""} className={textareaClassName} />
        </Field>

        <Field label="Гаднын холбоос">
          <input name="linkUrl" defaultValue={item?.linkUrl ?? ""} className={inputClassName} placeholder="https://..." />
        </Field>

        <Field label="Нээгдэх багцууд">
          <div className="grid gap-3 md:grid-cols-3">
            {packages.map((pkg) => (
              <label key={pkg.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
                <input type="checkbox" name="packageTierIds" value={pkg.id} defaultChecked={item?.packageTierIds.includes(pkg.id) ?? false} />
                {pkg.nameMn}
              </label>
            ))}
          </div>
        </Field>

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/72">
          <input type="checkbox" name="isPublished" defaultChecked={item?.isPublished ?? true} />
          Нийтлэх
        </label>

        <SubmitButton>{item ? "Нөөц хадгалах" : "Нөөц үүсгэх"}</SubmitButton>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-sm text-white/70">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputClassName = "flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none";
const textareaClassName = "w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none";
