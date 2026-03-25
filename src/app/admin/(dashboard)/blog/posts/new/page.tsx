export const dynamic = "force-dynamic";

import Link from "next/link";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { FlashMessage } from "@/components/shared/flash-message";
import { Button } from "@/components/ui/button";
import { listActiveBlogPopups, listBlogCategories } from "@/server/services/blog-service";

export default async function AdminNewBlogPostPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const [categories, popups] = await Promise.all([listBlogCategories(), listActiveBlogPopups()]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Шинэ нийтлэл</h1>
          <p className="mt-2 text-sm text-white/60">Нийтлэл, ангилал, login gate болон popup тохируулгыг эндээс хийнэ.</p>
        </div>
        {!categories.length ? (
          <Button variant="outline" render={<Link href="/admin/blog/categories" />}>
            Эхлээд ангилал үүсгэх
          </Button>
        ) : null}
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <BlogPostForm categories={categories} popups={popups} returnPath="/admin/blog/posts/new" />
    </section>
  );
}
