import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const BLOG_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads", "blog");
const BLOG_UPLOAD_PREFIX = "/uploads/blog/";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function saveBlogImageUpload(file: File | null | undefined) {
  if (!file || file.size === 0) return undefined;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Зөвхөн JPG, PNG, WEBP эсвэл GIF зураг оруулна уу.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Зургийн хэмжээ 5MB-аас ихгүй байна.");
  }

  await mkdir(BLOG_UPLOAD_ROOT, { recursive: true });

  const extension = getExtension(file.name, file.type);
  const fileName = `${Date.now().toString(36)}-${crypto.randomUUID()}.${extension}`;
  const targetPath = path.join(BLOG_UPLOAD_ROOT, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(targetPath, buffer);

  return `${BLOG_UPLOAD_PREFIX}${fileName}`;
}

export async function removeStoredBlogImage(imageUrl?: string | null) {
  if (!imageUrl?.startsWith(BLOG_UPLOAD_PREFIX)) return;

  const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, "").replace(/\//g, path.sep));

  try {
    await unlink(filePath);
  } catch {
    // Ignore missing file cleanup failures.
  }
}

function getExtension(fileName: string, mimeType: string) {
  const ext = path.extname(fileName).replace(".", "").toLowerCase();
  if (ext) return ext;
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "gif";
}
