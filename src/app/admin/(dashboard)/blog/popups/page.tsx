export const dynamic = "force-dynamic";

import Link from "next/link";

import { BlogPopupForm } from "@/components/admin/blog-popup-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FlashMessage } from "@/components/shared/flash-message";
import { Button } from "@/components/ui/button";
import { deleteBlogPopupAction } from "@/server/actions/blog-admin-actions";
import { listBlogPopups } from "@/server/services/blog-service";

export default async function AdminBlogPopupsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const popups = await listBlogPopups();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Нийтлэлийн popup-ууд</h1>
        <p className="mt-2 text-sm text-white/60">Challenge-д бүртгүүлэх popup-уудыг эндээс үүсгэж холбоно.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <BlogPopupForm returnPath="/admin/blog/popups" />

      <div className="grid gap-4">
        {popups.map((popup) => (
          <div key={popup.id} className="glass-panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="text-lg font-semibold text-white">{popup.title}</div>
              <div className="text-sm text-white/55 line-clamp-2">{popup.body}</div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/35">
                {popup.isActive ? "Идэвхтэй" : "Идэвхгүй"} | Холбогдсон нийтлэл {popup._count.posts}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" render={<Link href={`/admin/blog/popups/${popup.id}`} />}>
                Засах
              </Button>
              <form action={deleteBlogPopupAction}>
                <input type="hidden" name="id" value={popup.id} />
                <input type="hidden" name="imageUrl" value={popup.imageUrl ?? ""} />
                <input type="hidden" name="returnPath" value="/admin/blog/popups" />
                <SubmitButton variant="destructive">Устгах</SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
