"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getUserFacingErrorMessage } from "@/lib/error-utils";
import { blogCategorySchema, blogPopupSchema, blogPostSchema } from "@/lib/validators";
import { removeStoredBlogImage, saveBlogImageUpload } from "@/server/services/blog-media-service";
import {
  deleteBlogCategory,
  deleteBlogPopup,
  deleteBlogPost,
  upsertBlogCategory,
  upsertBlogPopup,
  upsertBlogPost,
} from "@/server/services/blog-service";

function toBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function buildRedirect(pathname: string, type: "success" | "error", message: string) {
  const params = new URLSearchParams({ [type]: message });
  return `${pathname}?${params.toString()}`;
}

function redirectWithMessage(pathname: string, type: "success" | "error", message: string): never {
  redirect(buildRedirect(pathname, type, message));
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog/categories");
  revalidatePath("/admin/blog/posts");
  revalidatePath("/admin/blog/popups");

  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }
}

export async function saveBlogCategoryAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/blog/categories");

  try {
    const parsed = blogCategorySchema.parse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      sortOrder: formData.get("sortOrder"),
    });

    await upsertBlogCategory(parsed);
    revalidateBlogPaths();
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Ангиллыг хадгалж чадсангүй."));
  }

  redirectWithMessage(returnPath, "success", "Ангилал хадгалагдлаа.");
}

export async function deleteBlogCategoryAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/blog/categories");

  try {
    await deleteBlogCategory(String(formData.get("id")));
    revalidateBlogPaths();
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Ангиллыг устгаж чадсангүй."));
  }

  redirectWithMessage(returnPath, "success", "Ангилал устгагдлаа.");
}

export async function saveBlogPopupAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/blog/popups");
  const existingImageUrl = String(formData.get("existingImageUrl") || "");
  const upload = formData.get("imageFile");
  let imageUrl = existingImageUrl || undefined;

  try {
    if (upload instanceof File && upload.size > 0) {
      imageUrl = await saveBlogImageUpload(upload);
      if (existingImageUrl && existingImageUrl !== imageUrl) {
        await removeStoredBlogImage(existingImageUrl);
      }
    } else if (toBoolean(formData.get("removeImage"))) {
      imageUrl = undefined;
      await removeStoredBlogImage(existingImageUrl);
    }

    const parsed = blogPopupSchema.parse({
      id: formData.get("id") || undefined,
      title: formData.get("title"),
      body: formData.get("body"),
      imageUrl,
      videoUrl: formData.get("videoUrl") || undefined,
      ctaLabel: formData.get("ctaLabel"),
      ctaUrl: formData.get("ctaUrl"),
      isActive: toBoolean(formData.get("isActive")),
    });

    await upsertBlogPopup(parsed);
    revalidateBlogPaths();
  } catch (error) {
    if (imageUrl && imageUrl !== existingImageUrl) {
      await removeStoredBlogImage(imageUrl);
    }

    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Popup хадгалж чадсангүй."));
  }

  redirectWithMessage(returnPath, "success", "Popup хадгалагдлаа.");
}

export async function deleteBlogPopupAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/blog/popups");
  const imageUrl = String(formData.get("imageUrl") || "");

  try {
    await deleteBlogPopup(String(formData.get("id")));
    await removeStoredBlogImage(imageUrl);
    revalidateBlogPaths();
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Popup устгаж чадсангүй."));
  }

  redirectWithMessage(returnPath, "success", "Popup устгагдлаа.");
}

export async function saveBlogPostAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/blog/posts");
  const existingImageUrl = String(formData.get("existingImageUrl") || "");
  const upload = formData.get("coverImageFile");
  let imageUrl = existingImageUrl || undefined;

  try {
    if (upload instanceof File && upload.size > 0) {
      imageUrl = await saveBlogImageUpload(upload);
      if (existingImageUrl && existingImageUrl !== imageUrl) {
        await removeStoredBlogImage(existingImageUrl);
      }
    }

    const parsed = blogPostSchema.parse({
      id: formData.get("id") || undefined,
      title: formData.get("title"),
      excerpt: formData.get("excerpt") || undefined,
      bodyMarkdown: formData.get("bodyMarkdown"),
      coverImageUrl: imageUrl,
      categoryId: formData.get("categoryId"),
      status: formData.get("status"),
      requiresLoginForFullRead: toBoolean(formData.get("requiresLoginForFullRead")),
      showEndPopup: toBoolean(formData.get("showEndPopup")),
      popupId: formData.get("popupId") || undefined,
    });

    const post = await upsertBlogPost(parsed);
    revalidateBlogPaths(post.slug);
  } catch (error) {
    if (imageUrl && imageUrl !== existingImageUrl) {
      await removeStoredBlogImage(imageUrl);
    }

    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Нийтлэл хадгалж чадсангүй."));
  }

  redirectWithMessage(returnPath, "success", "Нийтлэл хадгалагдлаа.");
}

export async function deleteBlogPostAction(formData: FormData) {
  const returnPath = String(formData.get("returnPath") || "/admin/blog/posts");
  const imageUrl = String(formData.get("coverImageUrl") || "");

  try {
    await deleteBlogPost(String(formData.get("id")));
    await removeStoredBlogImage(imageUrl);
    revalidateBlogPaths();
  } catch (error) {
    redirectWithMessage(returnPath, "error", getUserFacingErrorMessage(error, "Нийтлэл устгаж чадсангүй."));
  }

  redirectWithMessage(returnPath, "success", "Нийтлэл устгагдлаа.");
}
