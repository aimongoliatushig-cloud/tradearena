export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, Sparkles, Users } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

import { PublicShell } from "@/components/layout/public-shell";
import { FlashMessage } from "@/components/shared/flash-message";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/lib/button-variants";
import { courseAccessLevelLabels } from "@/lib/labels";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { listActivePackageTiers } from "@/server/services/package-service";

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const flash = await searchParams;
  const { userId } = await auth();
  const packages = await listActivePackageTiers();

  return (
    <PublicShell>
      <section className="space-y-8">
        <div className="glass-panel relative overflow-hidden p-8 sm:p-10">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#18c7a2]/14 blur-3xl" />
          <div className="pointer-events-none absolute left-0 bottom-0 h-40 w-40 rounded-full bg-[#0781fe]/14 blur-3xl" />

          <div className="relative space-y-5">
            <div className="ftmo-kicker">Багц сонгох</div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Шат ахих тусам үнэ цэн нэмэгдэх багцууд
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
              Багц сонгож төлбөрийн мэдээллээ илгээсний дараа өрөө, сургалт, стратеги, хэрэгсэл, коучингийн эрх автоматаар
              нээгдэнэ. Өрөө бүр дээд тал нь 10 гишүүнтэй.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                5 шаталсан багц
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
                Видео локал хадгалахгүй, зөвхөн стрийм
              </div>
              {userId ? (
                <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}>
                  Хяналтын самбар
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <FlashMessage
          success={typeof flash.success === "string" ? flash.success : undefined}
          error={typeof flash.error === "string" ? flash.error : undefined}
        />

        <div className="grid gap-5 xl:grid-cols-5">
          {packages.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(11,16,22,0.92))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3daafe]/55 to-transparent" />
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">{item.nameMn}</h2>
                    <div className="mt-2 text-sm text-white/50">{courseAccessLevelLabels[item.courseAccessLevel]} сургалтын эрх</div>
                  </div>
                  <StatusBadge label={`${item.maxUsers} хүн`} tone="info" />
                </div>

                <div className="flex items-end justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/45">Үнэ</div>
                    <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{formatUsd(item.priceUsd)}</div>
                  </div>
                  <div className="text-right text-xs text-white/45">
                    <div>Стратеги</div>
                    <div className="mt-1 text-lg font-semibold text-white">{item.strategyCount}</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-white/72">
                  <div className="flex items-center gap-2">
                    <Layers3 className="size-4 text-[#83c5ff]" />
                    {item.strategyCount} стратегийн эрх
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-[#83c5ff]" />
                    Өрөө бүр {item.maxUsers} гишүүн
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-[#83c5ff]" />
                    {item.includesCoaching ? `${item.coachingHours} цагийн коучинг` : "Коучинггүй"}
                  </div>
                </div>

                <ul className="space-y-2">
                  {item.featuresMn.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#8de8d2]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/checkout/${item.slug}`} className={cn(buttonVariants(), "w-full justify-between rounded-[1.2rem]")}>
                  Сонгох
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
