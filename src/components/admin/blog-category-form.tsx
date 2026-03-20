import type { BlogCategory } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveBlogCategoryAction } from "@/server/actions/blog-admin-actions";

export function BlogCategoryForm({
  category,
  returnPath,
}: {
  category?: BlogCategory | null;
  returnPath: string;
}) {
  return (
    <Card className="border-white/10 bg-white/6 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white">{category ? "Ангилал засах" : "Шинэ ангилал"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveBlogCategoryAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={category?.id} />
          <input type="hidden" name="returnPath" value={returnPath} />

          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <Field label="Ангиллын нэр">
              <input
                name="name"
                defaultValue={category?.name}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </Field>
            <Field label="Дараалал">
              <input
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={category?.sortOrder ?? 0}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </Field>
          </div>

          <Field label="Тайлбар">
            <textarea
              name="description"
              defaultValue={category?.description ?? ""}
              rows={4}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
            />
          </Field>

          <SubmitButton>{category ? "Ангилал хадгалах" : "Ангилал үүсгэх"}</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/70">{label}</label>
      {children}
    </div>
  );
}
