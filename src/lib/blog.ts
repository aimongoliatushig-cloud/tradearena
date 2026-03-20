export type MarkdownInlinePart =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "link"; value: string; href: string }
  | { type: "inlineCode"; value: string };

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: MarkdownInlinePart[] }
  | { type: "paragraph"; content: MarkdownInlinePart[] }
  | { type: "list"; items: MarkdownInlinePart[][] }
  | { type: "image"; alt: string; src: string };

const IMAGE_PATTERN = /^!\[(.*?)\]\((.+?)\)$/;
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const STRONG_PATTERN = /\*\*(.+?)\*\*/g;
const INLINE_CODE_PATTERN = /`([^`]+)`/g;

export function slugifyBlogValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripMarkdown(value: string) {
  return value
    .replace(/!\[(.*?)\]\((.+?)\)/g, "$1")
    .replace(/\[(.*?)\]\((.+?)\)/g, "$1")
    .replace(/[#>*`_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildExcerptFromMarkdown(value: string, maxLength = 180) {
  const plain = stripMarkdown(value);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
}

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks = normalized
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.every((line) => line.startsWith("- "))) {
      return {
        type: "list" as const,
        items: lines.map((line) => parseInlineMarkdown(line.slice(2).trim())),
      };
    }

    if (lines.length === 1) {
      const imageMatch = lines[0].match(IMAGE_PATTERN);
      if (imageMatch) {
        return {
          type: "image" as const,
          alt: imageMatch[1],
          src: imageMatch[2],
        };
      }

      const headingMatch = lines[0].match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        return {
          type: "heading" as const,
          level: headingMatch[1].length as 1 | 2 | 3,
          content: parseInlineMarkdown(headingMatch[2]),
        };
      }
    }

    return {
      type: "paragraph" as const,
      content: parseInlineMarkdown(lines.join(" ")),
    };
  });
}

export function getPreviewBlocks(blocks: MarkdownBlock[], ratio = 0.3) {
  if (!blocks.length) return [];
  const count = Math.max(1, Math.ceil(blocks.length * ratio));
  return blocks.slice(0, count);
}

export function parseInlineMarkdown(value: string): MarkdownInlinePart[] {
  const tokens: MarkdownInlinePart[] = [];
  let cursor = 0;
  const pattern = new RegExp(`${LINK_PATTERN.source}|${STRONG_PATTERN.source}|${INLINE_CODE_PATTERN.source}`, "g");

  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      tokens.push({ type: "text", value: value.slice(cursor, index) });
    }

    if (match[1] && match[2]) {
      tokens.push({ type: "link", value: match[1], href: match[2] });
    } else if (match[3]) {
      tokens.push({ type: "strong", value: match[3] });
    } else if (match[4]) {
      tokens.push({ type: "inlineCode", value: match[4] });
    }

    cursor = index + match[0].length;
  }

  if (cursor < value.length) {
    tokens.push({ type: "text", value: value.slice(cursor) });
  }

  return tokens.filter((token) => token.type !== "text" || token.value.length > 0);
}
