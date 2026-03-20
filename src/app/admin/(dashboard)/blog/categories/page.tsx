export const dynamic = "force-dynamic";

import Link from "next/link";

import { BlogCategoryForm } from "@/components/admin/blog-category-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FlashMessage } from "@/components/shared/flash-message";
import { Button } from "@/components/ui/button";
import { deleteBlogCategoryAction } from "@/server/actions/blog-admin-actions";
import { listBlogCategories } from "@/server/services/blog-service";

export default async function AdminBlogCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const categories = await listBlogCategories();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Блог ангиллууд</h1>
        <p className="mt-2 text-sm text-white/60">Нийтлэлүүдийн ангилал, дарааллыг эндээс удирдана.</p>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <BlogCategoryForm returnPath="/admin/blog/categories" />

      <div className="grid gap-4">
        {categories.map((category) => (
          <div key={category.id} className="glass-panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="text-lg font-semibold text-white">{category.name}</div>
              <div className="text-sm text-white/55">{category.description || "Тайлбаргүй"}</div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/35">
                Нийтлэл {category._count.posts} | Дараалал {category.sortOrder}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" render={<Link href={`/admin/blog/categories/${category.id}`} />}>
                Засах
              </Button>
              <form action={deleteBlogCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <input type="hidden" name="returnPath" value="/admin/blog/categories" />
                <SubmitButton variant="destructive">Устгах</SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
