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
            <div className="ftmo-kicker">Member Dashboard</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">Sign in to open your member workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Your package status, courses, tools, indicators, and coaching access appear here after you sign in.
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
            <div className="ftmo-kicker">Member Dashboard</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">No active package yet</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Choose a package and submit your payment details. Once it is approved, your courses and resources will unlock automatically.
            </p>
            <Link href="/packages" className={cn(buttonVariants(), "mt-6 inline-flex")}>
              Choose Package
            </Link>
          </div>
        </section>
      </PublicShell>
    );
  }

  const enrollment = dashboard.enrollment;
  const roomOccupancy = enrollment.room?.packageEnrollments.length ?? 0;
  const completionCount = dashboard.contentUnlocked
    ? dashboard.courses.filter((course) => getProgressPercent(course.viewerProgress) >= 100).length
    : 0;

  return (
    <PublicShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div>
            <div className="ftmo-kicker">Member Dashboard</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">Your package access</h1>
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
                <StatusBadge label="My package" tone="info" />
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
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">Room</div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {enrollment.room ? `${roomOccupancy}/${enrollment.room.maxTraderCapacity}` : "Waiting for assignment"}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">Courses</div>
                  <div className="mt-2 text-2xl font-semibold text-white">{dashboard.contentUnlocked ? `${completionCount}/${dashboard.courses.length}` : "-"}</div>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">Updated</div>
                  <div className="mt-2 text-sm text-white">{formatDateTime(enrollment.updatedAt)}</div>
                </div>
              </div>

              {(enrollment.status === "PENDING_PAYMENT" || enrollment.status === "PENDING_CONFIRMATION") ? (
                <div className="rounded-[1.4rem] border border-[#3daafe]/18 bg-[#0781fe]/10 px-4 py-4">
                  <div className="font-semibold text-white">Payment approval is still pending</div>
                  <p className="mt-2 leading-7 text-white/72">
                    Submit your payment details and wait for admin approval. Courses, resources, and coaching unlock only after payment is confirmed.
                  </p>
                  <Link href={`/checkout/${enrollment.packageTier.slug}`} className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}>
                    Open Checkout Page
                  </Link>
                </div>
              ) : null}

              {enrollment.status === "AWAITING_DECISION" ? (
                <div className="rounded-[1.4rem] border border-amber-400/25 bg-amber-500/10 px-4 py-4">
                  <div className="font-semibold text-white">This room did not fill in time</div>
                  <p className="mt-2 leading-7 text-white/72">
                    You can merge into another room of the same package or stay in the current room and keep waiting.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={recordEnrollmentDecisionAction}>
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <input type="hidden" name="decision" value="MERGE" />
                      <button type="submit" className={buttonVariants({ size: "sm" })}>
                        Merge
                      </button>
                    </form>
                    <form action={recordEnrollmentDecisionAction}>
                      <input type="hidden" name="enrollmentId" value={enrollment.id} />
                      <input type="hidden" name="decision" value="WAIT" />
                      <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Wait
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
                  <CardTitle className="text-xl text-white">Training</CardTitle>
                  <div className="text-sm text-white/50">Courses available for this enrollment</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.contentUnlocked ? (
                  dashboard.courses.length ? (
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
                      No courses are available yet.
                    </div>
                  )
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-[#3daafe]/20 bg-[#0781fe]/10 px-4 py-4 text-sm leading-7 text-white/70">
                    Courses unlock automatically after payment is approved.
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
                  <CardTitle className="text-xl text-white">Resources</CardTitle>
                  <div className="text-sm text-white/50">Strategies, tools, and indicators for this package</div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {dashboard.contentUnlocked ? (
                  <>
                    <ResourceColumn
                      icon={Sparkles}
                      title="Strategies"
                      items={dashboard.strategies.map((item) => ({ id: item.id, title: item.titleMn, href: item.linkUrl }))}
                    />
                    <ResourceColumn
                      icon={Wrench}
                      title="Tools"
                      items={dashboard.tools.map((item) => ({ id: item.id, title: item.titleMn, href: item.linkUrl }))}
                    />
                    <ResourceColumn
                      icon={Headphones}
                      title="Indicators"
                      items={dashboard.indicators.map((item) => ({ id: item.id, title: item.titleMn, href: item.linkUrl }))}
                    />
                  </>
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-[#3daafe]/20 bg-[#0781fe]/10 p-4 text-sm leading-7 text-white/70 md:col-span-3">
                    Resources unlock automatically after payment is approved.
                  </div>
                )}
              </CardContent>
            </Card>

            {dashboard.coaching ? (
              <Card className="border-white/10 bg-white/[0.035] backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Coaching</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-white/68">
                  <p>This package includes {dashboard.coaching.hours} hours of 1:1 coaching.</p>
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
          No items available.
        </div>
      )}
    </div>
  );
}
