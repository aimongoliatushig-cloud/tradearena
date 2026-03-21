export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { FileText, PlayCircle } from "lucide-react";

import { FlashMessage } from "@/components/shared/flash-message";
import { buttonVariants } from "@/lib/button-variants";
import { saveCourseProgressAction } from "@/server/actions/member-actions";
import { getAccessibleCourseBySlug } from "@/server/services/course-service";
import { getCurrentEnrollmentForUser, hasConfirmedPaymentAccess } from "@/server/services/enrollment-service";

function isIframeVideo(url: string) {
  return /vimeo\.com|youtube\.com|youtu\.be|player\./i.test(url);
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|m3u8)(\?.*)?$/i.test(url);
}

export default async function DashboardCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { courseSlug } = await params;
  const flash = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    redirect("/packages");
  }

  const enrollment = await getCurrentEnrollmentForUser(userId);

  if (!enrollment) {
    redirect("/dashboard");
  }

  if (!hasConfirmedPaymentAccess(enrollment)) {
    const params = new URLSearchParams({
      error: "Төлбөр баталгаажсаны дараа сургалт нээгдэнэ.",
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  const course = await getAccessibleCourseBySlug({
    packageTierId: enrollment.packageTierId,
    slug: courseSlug,
  });

  if (!course) {
    notFound();
  }

  const viewerProgress = course.progress.find((item) => item.clerkUserId === userId) ?? null;

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="ftmo-kicker">Сургалт</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">{course.titleMn}</h1>
          {course.descriptionMn ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">{course.descriptionMn}</p> : null}
        </div>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Самбар руу буцах
        </Link>
      </div>

      <FlashMessage
        success={typeof flash.success === "string" ? flash.success : undefined}
        error={typeof flash.error === "string" ? flash.error : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {course.videoUrl ? (
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
              {isDirectVideo(course.videoUrl) ? (
                <video controls className="aspect-video w-full bg-black">
                  <source src={course.videoUrl} />
                </video>
              ) : isIframeVideo(course.videoUrl) ? (
                <iframe
                  src={course.videoUrl}
                  title={course.titleMn}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[#0c1117] text-white/68">
                  <a href={course.videoUrl} target="_blank" rel="noreferrer" className={buttonVariants()}>
                    Видеог нээх
                  </a>
                </div>
              )}
            </div>
          ) : null}

          {course.textContent ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-white/70">
              {course.textContent}
            </div>
          ) : null}

          {course.pdfUrls.length ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-4 flex items-center gap-2 text-white">
                <FileText className="size-5 text-[#83c5ff]" />
                <h2 className="text-xl font-semibold">Файл ба материал</h2>
              </div>
              <div className="grid gap-3">
                {course.pdfUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/70 transition hover:bg-white/[0.05]"
                  >
                    {url}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-2 text-white">
              <PlayCircle className="size-5 text-[#8de8d2]" />
              <h2 className="text-xl font-semibold">Явц</h2>
            </div>
            <div className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white">{viewerProgress?.percentComplete ?? 0}%</div>
            <p className="mt-2 text-sm leading-7 text-white/60">Энэ сургалтыг эхэлсэн эсвэл дууссан гэж тэмдэглээд явцаа хянаарай.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action={saveCourseProgressAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="courseSlug" value={course.slug} />
                <input type="hidden" name="percentComplete" value={Math.max(viewerProgress?.percentComplete ?? 0, 25)} />
                <button type="submit" className={buttonVariants({ size: "sm" })}>
                  Эхэлсэн гэж тэмдэглэх
                </button>
              </form>
              <form action={saveCourseProgressAction}>
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="courseSlug" value={course.slug} />
                <input type="hidden" name="percentComplete" value="100" />
                <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Дууссан
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-white/60">
            Видео файлуудыг сервер дээр хадгалахгүй. Энэ хуудас зөвхөн гаднын аюулгүй холбоосоос стрийм эсвэл оруулсан тоглуулагчаар үзүүлнэ.
          </div>
        </div>
      </div>
    </section>
  );
}
