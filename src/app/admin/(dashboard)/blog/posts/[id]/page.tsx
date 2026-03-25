export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { FlashMessage } from "@/components/shared/flash-message";
import { getAdminBlogPost, listActiveBlogPopups, listBlogCategories } from "@/server/services/blog-service";

export default async function AdminBlogPostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const { id } = await params;
  const [post, categories, popups] = await Promise.all([
    getAdminBlogPost(id),
    listBlogCategories(),
    listActiveBlogPopups(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Нийтлэл засах</h1>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <BlogPostForm post={post} categories={categories} popups={popups} returnPath={`/admin/blog/posts/${post.id}`} />
    </section>
  );
}
