export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { BlogCategoryForm } from "@/components/admin/blog-category-form";
import { getBlogCategory } from "@/server/services/blog-service";

export default async function AdminBlogCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getBlogCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Ангилал засах</h1>
      </div>

      <BlogCategoryForm category={category} returnPath={`/admin/blog/categories/${category.id}`} />
    </section>
  );
}
