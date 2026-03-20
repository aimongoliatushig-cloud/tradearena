export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { getAdminBlogPost, listActiveBlogPopups, listBlogCategories } from "@/server/services/blog-service";

export default async function AdminBlogPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

      <BlogPostForm post={post} categories={categories} popups={popups} returnPath={`/admin/blog/posts/${post.id}`} />
    </section>
  );
}
