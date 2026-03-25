export const dynamic = "force-dynamic";

import Link from "next/link";

import { SubmitButton } from "@/components/forms/submit-button";
import { FlashMessage } from "@/components/shared/flash-message";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { blogPostStatusLabels } from "@/lib/labels";
import { deleteBlogPostAction } from "@/server/actions/blog-admin-actions";
import { listAdminBlogPosts } from "@/server/services/blog-service";

export default async function AdminBlogPostsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const posts = await listAdminBlogPosts();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Блог нийтлэлүүд</h1>
          <p className="mt-2 text-sm text-white/60">Нийтлэл үүсгэх, нийтлэх, popup болон ангилал холбох удирдлага.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/admin/blog/analytics" />}>
            Analytics
          </Button>
          <Button render={<Link href="/admin/blog/posts/new" />}>Шинэ нийтлэл</Button>
        </div>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="glass-panel flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-white">{post.title}</div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  {blogPostStatusLabels[post.status]}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                  {post.category.name}
                </span>
              </div>
              <div className="text-sm text-white/55 line-clamp-2">{post.excerpt}</div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/35">
                {post.requiresLoginForFullRead ? "Нэвтрэх gate-тэй" : "Нээлттэй"} | {post.showEndPopup ? "Popup идэвхтэй" : "Popupгүй"} |{" "}
                {post.publishedAt ? formatDateTime(post.publishedAt) : "Нийтлээгүй"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" render={<Link href={`/admin/blog/posts/${post.id}`} />}>
                Засах
              </Button>
              <Button variant="outline" render={<Link href={`/admin/blog/analytics?range=weekly&postId=${post.id}`} />}>
                Analytics
              </Button>
              {post.status === "PUBLISHED" ? (
                <Button variant="secondary" render={<Link href={`/blog/${post.slug}`} />}>
                  Харах
                </Button>
              ) : null}
              <form action={deleteBlogPostAction}>
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="coverImageUrl" value={post.coverImageUrl} />
                <input type="hidden" name="returnPath" value="/admin/blog/posts" />
                <SubmitButton variant="destructive">Устгах</SubmitButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
