import Image from "next/image";
import type { BlogCategory, BlogPopup, BlogPost } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blogPostStatusLabels } from "@/lib/labels";
import { BLOG_POST_STATUS_OPTIONS } from "@/lib/prisma-enums";
import { saveBlogPostAction } from "@/server/actions/blog-admin-actions";

type BlogPostWithRelations = BlogPost & {
  category?: BlogCategory | null;
  popup?: BlogPopup | null;
};

export function BlogPostForm({
  post,
  categories,
  popups,
  returnPath,
}: {
  post?: BlogPostWithRelations | null;
  categories: BlogCategory[];
  popups: BlogPopup[];
  returnPath: string;
}) {
  return (
    <Card className="border-white/10 bg-white/6 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white">{post ? "Нийтлэл засах" : "Шинэ нийтлэл"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveBlogPostAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={post?.id} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <input type="hidden" name="existingImageUrl" value={post?.coverImageUrl ?? ""} />

          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <Field label="Нийтлэлийн гарчиг">
              <input
                name="title"
                defaultValue={post?.title}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </Field>
            <Field label="Төлөв">
              <select
                name="status"
                defaultValue={post?.status ?? "DRAFT"}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              >
                {BLOG_POST_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {blogPostStatusLabels[status]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Ангилал">
              <select
                name="categoryId"
                defaultValue={post?.categoryId ?? categories[0]?.id ?? ""}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Popup сонгох">
              <select
                name="popupId"
                defaultValue={post?.popupId ?? ""}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              >
                <option value="">Popup холбохгүй</option>
                {popups.map((popup) => (
                  <option key={popup.id} value={popup.id}>
                    {popup.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Товч тайлбар">
            <textarea
              name="excerpt"
              defaultValue={post?.excerpt ?? ""}
              rows={3}
              placeholder="Хоосон үлдээвэл агуулгаас автоматаар үүсгэнэ."
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
            />
          </Field>

          <Field label="Гарчгийн зураг">
            <div className="space-y-3">
              {post?.coverImageUrl ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/10">
                  <div className="relative aspect-[16/9] w-full max-w-2xl">
                    <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
                  </div>
                </div>
              ) : null}
              <input
                type="file"
                name="coverImageFile"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block w-full text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
              />
            </div>
          </Field>

          <Field label="Markdown агуулга">
            <textarea
              name="bodyMarkdown"
              defaultValue={post?.bodyMarkdown}
              rows={18}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none"
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <input
                type="checkbox"
                name="requiresLoginForFullRead"
                defaultChecked={post?.requiresLoginForFullRead ?? false}
              />
              Бүтэн уншихад нэвтрэх шаардлагатай
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <input type="checkbox" name="showEndPopup" defaultChecked={post?.showEndPopup ?? false} />
              Нийтлэлийн төгсгөлд popup үзүүлэх
            </label>
          </div>

          <SubmitButton disabled={!categories.length}>{post ? "Нийтлэл хадгалах" : "Нийтлэл үүсгэх"}</SubmitButton>
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
