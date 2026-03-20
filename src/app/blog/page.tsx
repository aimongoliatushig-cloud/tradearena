export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";

import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { listPublishedBlogCategories, listPublishedBlogPosts } from "@/server/services/blog-service";

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const selectedCategory = typeof params.category === "string" ? params.category : undefined;
  const [posts, categories] = await Promise.all([
    listPublishedBlogPosts(selectedCategory),
    listPublishedBlogCategories(),
  ]);

  return (
    <PublicShell>
      <section className="space-y-8">
        <div className="space-y-4">
          <div className="ftmo-kicker">Блог</div>
          <h1 className="ftmo-heading max-w-4xl">Трейдинг, challenge бэлтгэл, сэтгэлзүй, сахилгын нийтлэлүүд</h1>
          <p className="ftmo-copy max-w-3xl">
            Хамгийн сүүлийн нийтлэлүүдийг ангиллаар нь шүүж уншаарай. Зарим нийтлэл бүтэн уншихын тулд үнэгүй бүртгэл шаарддаг.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant={!selectedCategory ? "default" : "outline"} render={<Link href="/blog" />}>
            Бүгд
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              render={<Link href={`/blog?category=${category.slug}`} />}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="glass-panel overflow-hidden">
              <div className="relative aspect-[16/9] w-full">
                <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/40">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[#95e8d5]">{post.category.name}</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">{post.title}</h2>
                  <p className="text-sm leading-7 text-white/60">{post.excerpt}</p>
                </div>
                <Button render={<Link href={`/blog/${post.slug}`} />}>Дэлгэрэнгүй унших</Button>
              </div>
            </article>
          ))}
        </div>

        {!posts.length ? (
          <div className="glass-panel px-6 py-8 text-sm text-white/60">Одоогоор энэ ангилалд нийтлэгдсэн нийтлэл алга.</div>
        ) : null}
      </section>
    </PublicShell>
  );
}
