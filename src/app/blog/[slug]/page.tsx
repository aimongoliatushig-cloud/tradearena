export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { PublicShell } from "@/components/layout/public-shell";
import { ArticleEndPopup } from "@/components/shared/article-end-popup";
import { BlogMarkdown } from "@/components/shared/blog-markdown";
import { ClerkPromptActions } from "@/components/shared/clerk-auth-controls";
import { Button } from "@/components/ui/button";
import { buildExcerptFromMarkdown, getPreviewBlocks, parseMarkdownBlocks } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { getPublishedBlogPostBySlug } from "@/server/services/blog-service";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ userId }, post] = await Promise.all([auth(), getPublishedBlogPostBySlug(slug)]);

  if (!post) {
    notFound();
  }

  const blocks = parseMarkdownBlocks(post.bodyMarkdown);
  const locked = post.requiresLoginForFullRead && !userId;
  const visibleBlocks = locked ? getPreviewBlocks(blocks) : blocks;

  return (
    <PublicShell>
      <article className="space-y-8">
        <div className="glass-panel overflow-hidden">
          <div className="relative aspect-[16/8] w-full">
            <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/40">
              <Link
                href={`/blog?category=${post.category.slug}`}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[#95e8d5]"
              >
                {post.category.name}
              </Link>
              <span>{formatDate(post.publishedAt)}</span>
              {post.requiresLoginForFullRead ? <span>Бүтэн уншихад бүртгэлтэй байх шаардлагатай</span> : null}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">{post.title}</h1>
              <p className="max-w-3xl text-sm leading-7 text-white/62 sm:text-[15px]">
                {post.excerpt || buildExcerptFromMarkdown(post.bodyMarkdown)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8">
          <BlogMarkdown blocks={visibleBlocks} />

          {locked ? (
            <div className="mt-8 rounded-[1.75rem] border border-[#2dd0b1]/18 bg-[linear-gradient(180deg,rgba(24,199,162,0.12),rgba(255,255,255,0.02))] p-6">
              <div className="space-y-3">
                <div className="ftmo-kicker border-[#2dd0b1]/20 bg-[#18c7a2]/12 text-[#d6fff4]">Үргэлжлүүлэн унших</div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  Нийтлэлийн бүтэн хувилбарыг уншихын тулд нэвтэрнэ үү
                </h2>
                <p className="text-sm leading-7 text-white/62">
                  Энэ нийтлэлийн зөвхөн эхний 30%-ийг харуулж байна. Үнэгүй бүртгэл үүсгээд эсвэл нэвтэрч орж
                  бүтэн агуулгыг уншаарай.
                </p>
              </div>
              <ClerkPromptActions
                containerClassName="mt-5"
                returnBackUrl={`/blog/${post.slug}`}
                signInClassName="inline-flex h-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#39d3b3_0%,#18c7a2_58%,#10927c_100%)] px-5 text-sm font-semibold text-[#071210]"
                signUpClassName="inline-flex h-11 items-center justify-center rounded-2xl border border-white/12 px-5 text-sm font-semibold text-white"
                signUpLabel="Үнэгүй бүртгэл үүсгэх"
              />
            </div>
          ) : null}

          {!locked && post.showEndPopup && post.popup ? <ArticleEndPopup popup={post.popup} /> : null}
        </div>

        <div className="flex justify-start">
          <Button variant="outline" render={<Link href="/blog" />}>
            Бусад нийтлэл рүү буцах
          </Button>
        </div>
      </article>
    </PublicShell>
  );
}
