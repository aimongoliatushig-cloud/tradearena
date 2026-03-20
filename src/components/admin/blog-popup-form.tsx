import Image from "next/image";
import type { BlogPopup } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveBlogPopupAction } from "@/server/actions/blog-admin-actions";

export function BlogPopupForm({
  popup,
  returnPath,
}: {
  popup?: BlogPopup | null;
  returnPath: string;
}) {
  return (
    <Card className="border-white/10 bg-white/6 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white">{popup ? "Popup засах" : "Шинэ popup"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveBlogPopupAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={popup?.id} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <input type="hidden" name="existingImageUrl" value={popup?.imageUrl ?? ""} />

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Popup гарчиг">
              <input
                name="title"
                defaultValue={popup?.title}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </Field>
            <Field label="CTA текст">
              <input
                name="ctaLabel"
                defaultValue={popup?.ctaLabel}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="CTA холбоос">
              <input
                name="ctaUrl"
                defaultValue={popup?.ctaUrl}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </Field>
            <Field label="Видео холбоос">
              <input
                name="videoUrl"
                defaultValue={popup?.videoUrl ?? ""}
                placeholder="https://..."
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </Field>
          </div>

          <Field label="Popup текст">
            <textarea
              name="body"
              defaultValue={popup?.body}
              rows={5}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
            />
          </Field>

          <Field label="Popup зураг">
            <div className="space-y-3">
              {popup?.imageUrl ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/10">
                  <div className="relative aspect-[16/9] w-full max-w-xl">
                    <Image src={popup.imageUrl} alt={popup.title} fill className="object-cover" />
                  </div>
                </div>
              ) : null}
              <input
                type="file"
                name="imageFile"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block w-full text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
              />
              {popup?.imageUrl ? (
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input type="checkbox" name="removeImage" />
                  Одоогийн зургийг устгах
                </label>
              ) : null}
            </div>
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <input type="checkbox" name="isActive" defaultChecked={popup?.isActive ?? true} />
            Popup идэвхтэй
          </label>

          <SubmitButton>{popup ? "Popup хадгалах" : "Popup үүсгэх"}</SubmitButton>
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
