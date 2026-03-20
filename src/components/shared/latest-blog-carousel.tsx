"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type CarouselPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  categoryName: string;
};

export function LatestBlogCarousel({ posts }: { posts: CarouselPost[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % posts.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [posts.length]);

  function scrollToIndex(index: number) {
    const container = containerRef.current;
    if (!container) return;

    const card = container.children[index] as HTMLElement | undefined;
    if (!card) return;

    container.scrollTo({
      left: card.offsetLeft,
      behavior: "smooth",
    });
  }

  function move(direction: -1 | 1) {
    const next = (activeIndex + direction + posts.length) % posts.length;
    setActiveIndex(next);
    scrollToIndex(next);
  }

  if (!posts.length) return null;

  return (
    <section className="mt-12 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="ftmo-kicker">Сүүлийн нийтлэлүүд</div>
          <div>
            <h2 className="ftmo-heading">Шинэ нийтлэлүүдээс онцлох 5</h2>
            <p className="ftmo-copy mt-3 max-w-3xl">Сүүлийн нийтлэлүүдийг гүйлгэж харж, шууд дэлгэрэнгүй унших боломжтой.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => move(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => move(1)}>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <article
            key={post.id}
            className="glass-panel min-w-[85%] snap-start overflow-hidden border-white/10 sm:min-w-[420px] lg:min-w-[460px]"
          >
            <div className="relative aspect-[16/9] w-full">
              <Image src={post.coverImageUrl} alt={post.title} fill className="object-cover" />
            </div>
            <div className="space-y-4 p-6">
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#95e8d5]">
                {post.categoryName}
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{post.title}</h3>
                <p className="text-sm leading-7 text-white/60">{post.excerpt}</p>
              </div>
              <Button render={<Link href={`/blog/${post.slug}`} />}>Дэлгэрэнгүй унших</Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
