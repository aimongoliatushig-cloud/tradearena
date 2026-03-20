export const dynamic = "force-dynamic";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, BookOpen, GraduationCap, Headphones, Sparkles, Wrench } from "lucide-react";
import type { ComponentType } from "react";

import { PublicShell } from "@/components/layout/public-shell";
import { ClerkPromptActions } from "@/components/shared/clerk-auth-controls";
import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/lib/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { packageEnrollmentStatusLabels, paymentStatusLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { recordEnrollmentDecisionAction } from "@/server/actions/member-actions";
import { getMemberDashboard } from "@/server/services/member-dashboard-service";

function getProgressPercent(value: unknown) {
  if (!value || typeof value !== "object") {
    return 0;
  }

  const percentComplete = "percentComplete" in value ? value.percentComplete : 0;
  return typeof percentComplete === "number" ? percentComplete : 0;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    return (
      <PublicShell>
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(11,16,22,0.92))] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="ftmo-kicker">Хяналтын самбар</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">Нэвтэрсний дараа самбар нээгдэнэ</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Багцын төлөв, сургалт, стратеги, хэрэгслүүд болон коучингийн мэдээллээ харахын тулд эхлээд
              нэвтэрнэ үү.
            </p>
            <ClerkPromptActions
              containerClassName="mt-6"
              returnBackUrl="/dashboard"
              signUpClassName={cn(buttonVariants({ variant: "outline" }), "border-white/12 text-white")}
            />
          </div>
        </section>
      </PublicShell>
    );
  }

  const dashboard = await getMemberDashboard(userId);

  if (!dashboard.enrollment) {
    return (
      <PublicShell>
        <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(11,16,22,0.92))] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <div className="ftmo-kicker">Хяналтын самбар</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">Идэвхтэй багц алга</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Багц сонгож төлбөрийн мэдээллээ илгээсний дараа сургалт, стратеги, хэрэгслүүд энд автоматаар
              нээгдэнэ.
            </p>
            <Link href="/packages" className={cn(buttonVariants(), "mt-6 inline-flex")}>
              Багц сонгох
            </Link>
          </div>
        </section>
      </PublicShell>
    );
  }

  const enrollment = dashboard.enrollment;
  const roomOccupancy = enrollment.room?.packageEnrollments.length ?? 0;
  const completionCount = dashboard.courses.filter((course) => getProgressPercent(course.viewerProgress) >= 100).length;

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div>
            <div className="ftmo-kicker">Хяналтын самбар</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">Таны нээгдсэн эрхүүд</h1>
          </div>
          <FlashMessage
            success={typeof flash.success === "string" ? flash.success : undefined}
            error={typeof flash.error === "string" ? flash.error : undefined}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-white/[0.035] backdrop-blur-xl">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge label="Миний багц" tone="info" />
                <StatusBadge label={packageEnrollmentStatusLabels[enrollment.status]} tone={enrollment.status === "ENROLLED" ? "success" : "warning"} />
                {enrollment.payment ? (
                  <StatusBadge
                    label={paymentStatusLabels[enrollment.payment.status]}
                    tone={enrollment.payment.status === "CONFIRMED" ? "success" : "warning"}
                  />
                ) : null}
              </div>
              <CardTitle className="text-3xl tracking-[-0.04em] text-white">{enrollment.packageTier.nameMn}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-white/68">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">Өрөө</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {enrollment.room ? `${roomOccupancy}/${enrollment.room.maxTraderCapacity}` : "Хүлээгдэж байна"}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">Сургалт</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {completionCount}/{dashboard.courses.length}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">Шинэчлэгдсэн</div>
                  <div className="mt-2 text-sm text-white">{formatDateTime(enrollment.updatedAt)}</div>
                </div>
              </div>

              {(enrollment.status === "PENDING_PAYMENT" || enrollment.status === "PENDING_CONFIRMATION") ? (
                <div className="rounded-[1.4rem] border border-[#3daafe]/18 bg-[#0781fe]/10 px-4 py-4">
                  <div className="font-semibold text-white">Төлбөрийн эрх нээгдэхийг хүлээж байна</div>
                  <p className="mt-2 leading-7 text-white/72">
                    Багцын эрх бүрэн нээгдэхийн тулд төлбөрийн мэдээллээ илгээж, админаар баталгаажуулах
                    шаардлагатай.
                  </p>
                  <Link href={`/checkout/${enrollment.packageTier.slug}`} className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}>
                    Төлбөрийн хуудас руу очих
                  </Link>
                </div>
              ) : null}

              {enrollment.status === "AWAITING_DECISION" ? (
                <div className="rounded-[1.4rem] border border-amber-400/25 bg-amber-500/10 px-4 py-4">
                  <div className="font-semibold text-white">Өрөө 48 цагийн дотор дүүрээгүй байна</div>
                  <p className="mt-2 leading-7 text-white/72">
                    Та ижил багцын өөр өрөөтэй нэгдэх эсвэл одоогийн өрөөндөө үргэлжлүүлэн хүлээх сонголт
                    хийнэ үү.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={recordEnrollmentDecisionAction}>
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <input type="hidden" name="decision" value="MERGE" />
                      <button type="submit" className={buttonVariants({ size: "sm" })}>
                        Нэгдэх
                      </button>
                    </form>
                    <form action={recordEnrollmentDecisionAction}>
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <input type="hidden" name="decision" value="WAIT" />
                      <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Хүлээх
                      </button>
                    </form>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-5">
            <Card className="border-white/10 bg-white/[0.035] backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#8de8d2]">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Сургалт</CardTitle>
                  <div className="text-sm text-white/50">Танд нээгдсэн бүх сургалт</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.courses.length ? (
                  dashboard.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/dashboard/courses/${course.slug}`}
                      className="flex items-center justify-between rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]"
                    >
                      <div>
                        <div className="font-medium text-white">{course.titleMn}</div>
                        <div className="text-sm text-white/50">{getProgressPercent(course.viewerProgress)}%</div>
                      </div>
                      <ArrowRight className="size-4 text-white/40" />
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-white/10 px-4 py-4 text-sm text-white/55">
                    Одоогоор нээгдсэн сургалт алга.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#83c5ff]">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white">Стратеги ба хэрэгсэл</CardTitle>
                  <div className="text-sm text-white/50">Багцын түвшинд нээгдсэн нөөцүүд</div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <ResourceColumn
                  icon={Sparkles}
                  title="Стратеги"
                  items={dashboard.strategies.map((item) => ({ id: item.id, title: item.titleMn, href: item.linkUrl }))}
                />
                <ResourceColumn
                  icon={Wrench}
                  title="Хэрэгслүүд"
                  items={dashboard.tools.map((item) => ({ id: item.id, title: item.titleMn, href: item.linkUrl }))}
                />
                <ResourceColumn
                  icon={Headphones}
                  title="Индикатор"
                  items={dashboard.indicators.map((item) => ({ id: item.id, title: item.titleMn, href: item.linkUrl }))}
                />
              </CardContent>
            </Card>

            {dashboard.coaching ? (
              <Card className="border-white/10 bg-white/[0.035] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Коучинг</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-white/68">
                  <p>Энэ багцад {dashboard.coaching.hours} цагийн 1:1 коучинг багтсан.</p>
                  <div className="flex flex-wrap gap-3">
                    <a href={dashboard.coaching.url} target="_blank" rel="noreferrer" className={buttonVariants({ size: "sm" })}>
                      {dashboard.coaching.label}
                    </a>
                    <a
                      href={dashboard.coaching.supportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      {dashboard.coaching.supportLabel}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function ResourceColumn({
  icon: Icon,
  title,
  items,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  items: Array<{ id: string; title: string; href: string }>;
}) {
  return (
    <div className="space-y-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Icon className="size-4 text-[#8de8d2]" />
        {title}
      </div>
      {items.length ? (
        items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="block rounded-[1rem] border border-white/8 px-3 py-3 text-sm text-white/70 transition hover:bg-white/[0.05]"
          >
            {item.title}
          </a>
        ))
      ) : (
        <div className="rounded-[1rem] border border-dashed border-white/10 px-3 py-3 text-sm text-white/50">
          Нээгдсэн зүйл алга
        </div>
      )}
    </div>
  );
}
