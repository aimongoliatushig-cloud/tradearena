export const dynamic = "force-dynamic";

import type { ReactNode } from "react";

import { FlashMessage } from "@/components/shared/flash-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { saveCourseAction } from "@/server/actions/admin-actions";
import { listAdminCourses } from "@/server/services/course-service";
import { listAdminPackageTiers } from "@/server/services/package-service";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const [courses, packages] = await Promise.all([listAdminCourses(), listAdminPackageTiers()]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Сургалтууд</h1>
        <p className="mt-2 text-sm text-white/60">Зөвхөн гаднын видео холбоос ашиглаж, багц бүрийн эрхийг checkbox-оор удирдана.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="grid gap-6">
        <CourseForm packages={packages.map((item) => ({ id: item.id, nameMn: item.nameMn }))} />
        {courses.map((course) => (
          <CourseForm
            key={course.id}
            packages={packages.map((item) => ({ id: item.id, nameMn: item.nameMn }))}
            item={{
              id: course.id,
              titleMn: course.titleMn,
              descriptionMn: course.descriptionMn ?? "",
              videoUrl: course.videoUrl ?? "",
              textContent: course.textContent ?? "",
              pdfUrlsInput: course.pdfUrls.join("\n"),
              packageTierIds: course.packageAccess.map((item) => item.packageTierId),
              sortOrder: course.sortOrder,
              isPublished: course.isPublished,
            }}
          />
        ))}
      </div>
    </section>
  );
}

function CourseForm({
  item,
  packages,
}: {
  item?: {
    id: string;
    titleMn: string;
    descriptionMn: string;
    videoUrl: string;
    textContent: string;
    pdfUrlsInput: string;
    packageTierIds: string[];
    sortOrder: number;
    isPublished: boolean;
  };
  packages: Array<{ id: string; nameMn: string }>;
}) {
  return (
    <div className="glass-panel p-6">
      <h2 className="text-xl font-semibold text-white">{item ? `${item.titleMn} засах` : "Шинэ сургалт"}</h2>
      <form action={saveCourseAction} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={item?.id} />
        <input type="hidden" name="returnPath" value="/admin/courses" />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Гарчиг">
            <input name="titleMn" defaultValue={item?.titleMn} className={inputClassName} />
          </Field>
          <Field label="Дараалал">
            <input name="sortOrder" type="number" min={0} defaultValue={item?.sortOrder ?? 0} className={inputClassName} />
          </Field>
        </div>

        <Field label="Тайлбар">
          <textarea name="descriptionMn" rows={3} defaultValue={item?.descriptionMn ?? ""} className={textareaClassName} />
        </Field>

        <Field label="Видео холбоос">
          <input name="videoUrl" defaultValue={item?.videoUrl ?? ""} className={inputClassName} placeholder="https://player.vimeo.com/..." />
        </Field>

        <Field label="Текст агуулга">
          <textarea name="textContent" rows={6} defaultValue={item?.textContent ?? ""} className={textareaClassName} />
        </Field>

        <Field label="PDF холбоосууд">
          <textarea name="pdfUrlsInput" rows={4} defaultValue={item?.pdfUrlsInput ?? ""} className={textareaClassName} placeholder="Нэг мөрөнд нэг холбоос" />
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

        <SubmitButton>{item ? "Сургалт хадгалах" : "Сургалт үүсгэх"}</SubmitButton>
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
