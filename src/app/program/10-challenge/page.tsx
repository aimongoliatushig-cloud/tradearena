export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Repeat, ShieldCheck, Trophy, Users, Wrench } from "lucide-react";

import { PublicShell } from "@/components/layout/public-shell";
import { PricingComparisonSection } from "@/components/shared/PricingComparisonSection";
import { buttonVariants } from "@/lib/button-variants";
import { accountSizeLabels, courseAccessLevelLabels } from "@/lib/labels";
import { formatUsd } from "@/lib/pricing";
import { ourChallengeRuleGroups } from "@/lib/program-content";
import { cn } from "@/lib/utils";
import { listActivePackageTiers } from "@/server/services/package-service";

const valueCards = [
  {
    title: "Үнэгүй сургалт + хэрэгслүүд",
    description: "Оролцогч бүр сургалт, стратеги, хэрэгсэл, тайлагналын орчинтойгоор FTMO-д бэлтгэнэ.",
    icon: BookOpen,
  },
  {
    title: "10 хүний demo өрөө",
    description: "Нэг өрөөнд 10 оролцогч орж, бодит дарамттай төстэй сахилга, харьцуулалт, өрсөлдөөний орчин үүсгэнэ.",
    icon: Users,
  },
  {
    title: "Ялагч бодит challenge авна",
    description: "Шилдэг оролцогчид бодит FTMO challenge руу ахих боломж нээгдэнэ.",
    icon: Trophy,
  },
  {
    title: "Бусад нь хоосон үлдэхгүй",
    description: "Ялаагүй оролцогчид ч мэдлэг, хэрэгсэл, хамт олон, дахин оролцох боломжийн үнэ цэнээ хадгална.",
    icon: Repeat,
  },
] as const;

const quickStats = [
  { label: "Оролцогч", value: "10 хүн" },
  { label: "Эхний зорилго", value: "14 хоногт +5%" },
  { label: "Нийт хугацаа", value: "30 хоног" },
  { label: "Шагнал", value: "Бодит challenge" },
] as const;

export default async function TenChallengeProgramPage() {
  const packages = await listActivePackageTiers();

  return (
    <PublicShell>
      <section className="space-y-10">
        <div className="glass-panel relative overflow-hidden p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-16 top-0 h-52 w-52 rounded-full bg-[#18c7a2]/12 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-12 h-40 w-40 rounded-full bg-[#0781fe]/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div className="max-w-4xl">
              <div className="ftmo-kicker">ХӨТӨЛБӨР / 10ТЫН ЧЭЛЛЭНЖ</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Үнэгүй сургалттай,
                <br />
                10 хүний demo өрөөнөөс
                <br />
                бодит challenge руу шалгарна.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                TradeArena-ийн 10тын чэллэнж нь FTMO-д бэлдэх бүтэцтэй систем юм. 10 оролцогч нэг өрөөнд орж demo challenge хийж,
                шилдэг нь бодит challenge авах боломжтой. Бусад оролцогчид ч сургалт, хэрэгслүүд, хамтын дэмжлэг, дахин оролцох
                үнэ цэнээ авч үлдэнэ.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/rooms" className={buttonVariants({ size: "lg" })}>
                  Өрөөгөө сонгох
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/packages" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/10")}>
                  Багцууд үзэх
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {quickStats.map((item) => (
                <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#95e8d5]">{item.label}</div>
                  <div className="mt-2 text-sm text-white/72">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="space-y-5">
          <div>
            <div className="ftmo-kicker">Яагаад энэ формат үнэ цэнтэй вэ?</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Challenge төлөхөөс өмнө илүү системтэй бэлтгэл хийнэ</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/58">
              Энэ бол зүгээр нэг өрсөлдөөн биш. Сургалт, эрсдэлийн сахилга, тайлагнал, хамтын орчин, багцын эрх бүгдийг нэг системд
              нэгтгэсэн FTMO-д бэлтгэх урсгал юм.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {valueCards.map((card) => {
              const Icon = card.icon;

              return (
                <div key={card.title} className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#66e0c3]/18 bg-[#18c7a2]/10 text-[#d6fff4]">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">{card.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/60">{card.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="ftmo-kicker">Оролцооны багцууд</div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Багцаар өрөө, эрх, дэмжлэгийн түвшин өснө</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/58">
                Дансны хэмжээ, сургалтын түвшин, хэрэгслийн нээлт, коучингийн боломж нь багцын шатлалаар нэмэгдэнэ. Гэхдээ бүх багцын
                гол зорилго нь FTMO-д илүү бэлтгэлтэй очих.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/48">
              <Clock3 className="size-4 text-[#95e8d5]" />
              Бүх багц 10 хүний өрөөтэй
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {packages.map((item) => (
              <div
                key={item.id}
                className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(11,16,22,0.9))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#95e8d5]">{accountSizeLabels[item.accountSize]}</div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">{item.nameMn}</h3>
                    <p className="mt-2 text-sm text-white/56">{courseAccessLevelLabels[item.courseAccessLevel]}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-semibold tracking-[-0.03em] text-white">{formatUsd(item.priceUsd)}</div>
                    <div className="mt-1 text-xs text-white/46">{item.maxUsers} хүний өрөө</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/58">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{item.strategyCount} стратеги</span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                    {item.includesIndicators ? "Хэрэгслүүд нээгдэнэ" : "Хэрэгслүүд хязгаартай"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                    {item.includesCoaching ? `${item.coachingHours} цаг коучинг` : "Коучинггүй"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">FTMO бэлтгэл</span>
                </div>

                <div className="mt-5 grid gap-2">
                  {item.featuresMn.slice(0, 4).map((feature) => (
                    <div key={`${item.id}-${feature}`} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <Link href={`/checkout/${item.slug}`} className={cn(buttonVariants({ variant: "outline" }), "border-white/10 bg-white/[0.03] text-white")}>
                    Энэ багцаар оролцох
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <PricingComparisonSection />

        <section className="space-y-5">
          <div>
            <div className="ftmo-kicker">TradeArena Чэллэнжийн Дүрэм</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Манай 10тын чэллэнжийн дүрэм</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/58">
              Доорх дүрэм нь FTMO-ийн албан ёсны дүрэм биш. Энэ нь манай 10 хүний demo өрөөтэй дотоод challenge-ийн бүтэц, шалгаралт,
              funded үе шат, тайлагналын дүрэм юм.
            </p>
          </div>

          <div className="grid gap-5">
            {ourChallengeRuleGroups.map((group) => (
              <div key={group.title} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.94),rgba(11,16,22,0.88))] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-[#3daafe]/18 bg-[#0781fe]/10 text-[#83c5ff]">
                    {group.title === "Үндсэн бүтэц" ? <Users className="size-5" /> : null}
                    {group.title === "Fail ба шалгаралт" ? <ShieldCheck className="size-5" /> : null}
                    {group.title === "Consistency Rule" ? <Wrench className="size-5" /> : null}
                    {group.title === "Шагнал, гэрээ, funded үе шат" ? <Trophy className="size-5" /> : null}
                    {group.title === "Тайлагнал ба ил тод байдал" ? <BookOpen className="size-5" /> : null}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{group.title}</h3>
                    <div className="text-sm text-white/48">{group.rules.length} дүрэм</div>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {group.rules.map((rule) => (
                    <div key={`${group.title}-${rule.number}-${rule.title}`} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-5 py-4">
                      <div className="text-sm font-semibold text-[#95e8d5]">
                        {rule.number} {rule.title}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-white/68">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </PublicShell>
  );
}
