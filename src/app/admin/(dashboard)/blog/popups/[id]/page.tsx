export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { BlogPopupForm } from "@/components/admin/blog-popup-form";
import { getBlogPopup } from "@/server/services/blog-service";

export default async function AdminBlogPopupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const popup = await getBlogPopup(id);

  if (!popup) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Popup засах</h1>
      </div>

      <BlogPopupForm popup={popup} returnPath={`/admin/blog/popups/${popup.id}`} />
    </section>
  );
}
