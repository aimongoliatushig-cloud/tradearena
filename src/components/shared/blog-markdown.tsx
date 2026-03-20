import Image from "next/image";
import Link from "next/link";

import type { MarkdownBlock, MarkdownInlinePart } from "@/lib/blog";

function InlineContent({ parts }: { parts: MarkdownInlinePart[] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "strong") {
          return (
            <strong key={`${part.type}-${index}`} className="font-semibold text-white">
              {part.value}
            </strong>
          );
        }

        if (part.type === "link") {
          return (
            <Link
              key={`${part.type}-${index}`}
              href={part.href}
              className="text-[#95e8d5] underline decoration-white/20 underline-offset-4 transition hover:text-white"
            >
              {part.value}
            </Link>
          );
        }

        if (part.type === "inlineCode") {
          return (
            <code key={`${part.type}-${index}`} className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[0.92em] text-[#c6fff1]">
              {part.value}
            </code>
          );
        }

        return <span key={`${part.type}-${index}`}>{part.value}</span>;
      })}
    </>
  );
}

export function BlogMarkdown({ blocks }: { blocks: MarkdownBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
          return (
            <HeadingTag
              key={`${block.type}-${index}`}
              className={
                block.level === 1
                  ? "text-3xl font-semibold tracking-[-0.04em] text-white"
                  : block.level === 2
                    ? "text-2xl font-semibold tracking-[-0.03em] text-white"
                    : "text-xl font-semibold tracking-[-0.02em] text-white"
              }
            >
              <InlineContent parts={block.content} />
            </HeadingTag>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="grid gap-3 pl-5 text-[15px] leading-8 text-white/74">
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`} className="list-disc">
                  <InlineContent parts={item} />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "image") {
          return (
            <div key={`${block.type}-${index}`} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/15">
              <div className="relative aspect-[16/9] w-full">
                <Image src={block.src} alt={block.alt || "Нийтлэлийн зураг"} fill className="object-cover" />
              </div>
            </div>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-[15px] leading-8 text-white/74 sm:text-base">
            <InlineContent parts={block.content} />
          </p>
        );
      })}
    </div>
  );
}
