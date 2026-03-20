import { BlogPostStatus, Prisma } from "@prisma/client";

import { buildExcerptFromMarkdown, slugifyBlogValue } from "@/lib/blog";
import { db } from "@/lib/db";
import { normalizeOptionalUrl } from "@/lib/validators";

const blogListInclude = {
  category: true,
  popup: true,
} satisfies Prisma.BlogPostInclude;

export async function listBlogCategories() {
  return db.blogCategory.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getBlogCategory(id: string) {
  return db.blogCategory.findUnique({
    where: { id },
  });
}

export async function upsertBlogCategory(input: {
  id?: string;
  name: string;
  description?: string;
  sortOrder: number;
}) {
  const slug = await ensureUniqueSlug("category", input.name, input.id);

  const data = {
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    sortOrder: input.sortOrder,
  };

  if (input.id) {
    return db.blogCategory.update({
      where: { id: input.id },
      data,
    });
  }

  return db.blogCategory.create({ data });
}

export async function deleteBlogCategory(id: string) {
  const category = await db.blogCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

  if (!category) return;
  if (category._count.posts > 0) {
    throw new Error("Энэ ангилалд нийтлэл холбогдсон тул устгах боломжгүй.");
  }

  await db.blogCategory.delete({ where: { id } });
}

export async function listBlogPopups() {
  return db.blogPopup.findMany({
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function listActiveBlogPopups() {
  return db.blogPopup.findMany({
    where: { isActive: true },
    orderBy: [{ title: "asc" }],
  });
}

export async function getBlogPopup(id: string) {
  return db.blogPopup.findUnique({
    where: { id },
  });
}

export async function upsertBlogPopup(input: {
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaLabel: string;
  ctaUrl: string;
  isActive: boolean;
}) {
  const data = {
    title: input.title.trim(),
    body: input.body.trim(),
    imageUrl: input.imageUrl?.trim() || null,
    videoUrl: normalizeOptionalUrl(input.videoUrl) || null,
    ctaLabel: input.ctaLabel.trim(),
    ctaUrl: input.ctaUrl.trim(),
    isActive: input.isActive,
  };

  if (input.id) {
    return db.blogPopup.update({
      where: { id: input.id },
      data,
    });
  }

  return db.blogPopup.create({ data });
}

export async function deleteBlogPopup(id: string) {
  await db.blogPopup.delete({
    where: { id },
  });
}

export async function listAdminBlogPosts() {
  return db.blogPost.findMany({
    include: blogListInclude,
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAdminBlogPost(id: string) {
  return db.blogPost.findUnique({
    where: { id },
    include: blogListInclude,
  });
}

export async function listLatestPublishedBlogPosts(limit = 5) {
  return db.blogPost.findMany({
    where: {
      status: BlogPostStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    include: {
      category: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function listPublishedBlogPosts(categorySlug?: string) {
  return db.blogPost.findMany({
    where: {
      status: BlogPostStatus.PUBLISHED,
      publishedAt: { not: null },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      category: true,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function listPublishedBlogCategories() {
  return db.blogCategory.findMany({
    where: {
      posts: {
        some: {
          status: BlogPostStatus.PUBLISHED,
          publishedAt: { not: null },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getPublishedBlogPostBySlug(slug: string) {
  return db.blogPost.findFirst({
    where: {
      slug,
      status: BlogPostStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    include: blogListInclude,
  });
}

export async function upsertBlogPost(input: {
  id?: string;
  title: string;
  excerpt?: string;
  bodyMarkdown: string;
  coverImageUrl: string;
  categoryId: string;
  status: BlogPostStatus;
  requiresLoginForFullRead: boolean;
  showEndPopup: boolean;
  popupId?: string;
}) {
  const slug = await ensureUniqueSlug("post", input.title, input.id);
  const excerpt = input.excerpt?.trim() || buildExcerptFromMarkdown(input.bodyMarkdown);
  const popupId = input.showEndPopup ? input.popupId || null : null;

  const data = {
    title: input.title.trim(),
    slug,
    excerpt,
    bodyMarkdown: input.bodyMarkdown.trim(),
    coverImageUrl: input.coverImageUrl.trim(),
    categoryId: input.categoryId,
    status: input.status,
    publishedAt: input.status === BlogPostStatus.PUBLISHED ? new Date() : null,
    requiresLoginForFullRead: input.requiresLoginForFullRead,
    showEndPopup: input.showEndPopup,
    popupId,
  };

  if (input.id) {
    const existing = await db.blogPost.findUnique({
      where: { id: input.id },
      select: { publishedAt: true },
    });

    return db.blogPost.update({
      where: { id: input.id },
      data: {
        ...data,
        publishedAt:
          input.status === BlogPostStatus.PUBLISHED
            ? existing?.publishedAt ?? new Date()
            : null,
      },
    });
  }

  return db.blogPost.create({ data });
}

export async function deleteBlogPost(id: string) {
  await db.blogPost.delete({
    where: { id },
  });
}

async function ensureUniqueSlug(type: "category" | "post", title: string, currentId?: string) {
  const base = slugifyBlogValue(title) || "item";

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const exists =
      type === "category"
        ? await db.blogCategory.findFirst({
            where: {
              slug: candidate,
              ...(currentId ? { NOT: { id: currentId } } : {}),
            },
            select: { id: true },
          })
        : await db.blogPost.findFirst({
            where: {
              slug: candidate,
              ...(currentId ? { NOT: { id: currentId } } : {}),
            },
            select: { id: true },
          });

    if (!exists) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
