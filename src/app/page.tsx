export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Clock3, Trophy, TrendingUp, Users } from "lucide-react";

import { DEFAULT_TARGET_PERCENT } from "@/lib/constants";
import { buildProgressValue, formatPercent } from "@/lib/format";
import { accountSizeLabels } from "@/lib/labels";
import { PublicShell } from "@/components/layout/public-shell";
import { PricingComparisonSection } from "@/components/shared/PricingComparisonSection";
import { RoomCard } from "@/components/shared/room-card";
import { Button } from "@/components/ui/button";
import { getApplicantBuckets } from "@/server/services/applicant-service";
import { getPublicHomepageData } from "@/server/services/room-service";

const heroSupportPoints = [
  "Бага эрсдэлтэй орчинд бодит дарамтыг мэдрүүлнэ",
  "FTMO challenge-ийг 8 дахин хямд өртгөөр бэлтгэнэ",
  "Олон трэйдертэй хамт суралцах community бий болгоно",
  "Шилдэг трэйдерүүдийг дэмжиж, ашиг хүртэх боломж олгоно",
] as const;

const heroValueCards = [
  {
    title: "Эрсдэл багатай орчин",
    text: "1–2% эрсдэлийн сахилга баттайгаар\naccount-аа хамгаалж сурна.",
  },
  {
    title: "Бодит сэтгэлзүй",
    text: "Demo биш — дарамттай орчинд\nжинхэнэ шийдвэр гаргаж сурна.",
  },
  {
    title: "8X хямд бэлтгэл",
    text: "FTMO challenge-ийг\n8 дахин бага зардлаар туршина.",
  },
  {
    title: "Community + Орлого",
    text: "Шилдэг трэйдерүүдийг дагаж,\nдэмжиж, ашиг хүртэх боломж.",
  },
] as const;

export default async function HomePage() {
  const [{ activeRooms, historicalRooms, totals }, applicantBuckets] = await Promise.all([
    getPublicHomepageData(),
    getApplicantBuckets(),
  ]);

  const leaderSummaries = activeRooms.map((room) => {
    const leader = room.traders.find((trader) => trader.active) ?? room.traders[0] ?? null;
    const activeTraderCount = room.traders.filter((trader) => trader.active).length;
    const currentProfit = leader?.currentProfitPercent ?? 0;

    return {
      id: room.id,
      title: room.title,
      slug: room.slug,
      accountSizeLabel: accountSizeLabels[room.accountSize],
      leaderName: leader?.fullName ?? "Лидер тодроогүй",
      currentProfit,
      targetPercent: DEFAULT_TARGET_PERCENT,
      progressValue: buildProgressValue(currentProfit, DEFAULT_TARGET_PERCENT),
      activeTraderCount,
      maxTraderCapacity: room.maxTraderCapacity,
    };
  });

  const registrationSummaries = applicantBuckets.map((bucket) => ({
    accountSizeLabel: accountSizeLabels[bucket.accountSize],
    interestedCount: bucket.active,
    remainingCount: Math.max(0, 10 - bucket.active),
    ready: bucket.ready,
  }));

  const totalInterestedCount = registrationSummaries.reduce((sum, bucket) => sum + bucket.interestedCount, 0);

  return (
    <PublicShell>
      <section className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="glass-panel relative h-full overflow-hidden border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.38)] sm:p-10">
          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#0781fe]/24 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-16 h-44 w-44 rounded-full bg-[#83c5ff]/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-8">
              <div className="ftmo-kicker border-[#3daafe]/20 bg-[#0781fe]/14 text-[#dff1ff] shadow-[0_10px_30px_rgba(7,129,254,0.16)]">
                FTMO-д бэлтгэх бодит орчин
              </div>

              <h1 className="text-glow max-w-3xl text-5xl font-semibold leading-[0.96] tracking-[-0.07em] text-white sm:text-[4.25rem]">
                <span className="inline-block rounded-[1.1rem] bg-white/[0.045] px-3 py-1 text-white shadow-[0_0_28px_rgba(131,197,255,0.16)]">
                  Эрсдэл багатайгаар
                </span>{" "}
                бодит трэйдийн сэтгэлзүйд сурч,
                <br />
                <span className="bg-gradient-to-r from-[#9ad7ff] via-white to-[#9ad7ff] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(131,197,255,0.28)]">
                  8X хямд
                </span>{" "}
                үнээр challenge-д бэлтгэ.
              </h1>

              <div className="max-w-2xl space-y-4">
                <div className="space-y-1 text-base leading-7 text-white/88 sm:text-lg">
                  <p>Ганцаараа demo хийвэл сэтгэлзүй хөгждөггүй.</p>
                  <p>Шууд том мөнгө рүү орвол эрсдэл өндөр.</p>
                </div>

                <div className="rounded-[1.6rem] border border-white/10 bg-black/16 p-5">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#9ad7ff]">Манай system</div>
                  <ul className="grid gap-3">
                    {heroSupportPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-6 text-white/68 sm:text-[15px]">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#83c5ff] shadow-[0_0_12px_rgba(131,197,255,0.7)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-[linear-gradient(135deg,#44b2ff_0%,#0781fe_58%,#0257d8_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.34),0_20px_38px_rgba(7,129,254,0.34)] hover:bg-[linear-gradient(135deg,#56bcff_0%,#1f8cff_58%,#0459da_100%)]"
                  render={<Link href="/rooms" />}
                >
                  Өрөөнүүдийг харах
                  <ArrowRight className="size-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/14 bg-white/[0.02] hover:bg-white/[0.07]" render={<Link href="/apply" />}>
                  Challenge-д нэгдэх
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {heroValueCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ad7ff]">Давуу тал</div>
                  <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">{card.title}</div>
                  <div className="mt-2 whitespace-pre-line text-sm leading-6 text-white/66">{card.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel h-full border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.028))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.36)] sm:p-8">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="ftmo-kicker border-white/12 bg-white/[0.04] text-white/72">Live Dashboard</div>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold leading-tight tracking-[-0.05em] text-white">Идэвхтэй өрөөнүүдийн лидер ба бүртгэлийн эрэлт</h2>
                <p className="max-w-xl text-sm leading-7 text-white/58">
                  Одоо хэн тэргүүлж байгааг, 5%-ийн target-д хэр ойр байгааг, дараагийн room-ууд хэдэн хүнээр бүрдэхийг нэг дороос хар.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72">{activeRooms.length} идэвхтэй өрөө</div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72">{totals.traderCount} трэйдер</div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72">{totalInterestedCount} сонирхол</div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.7rem] border border-white/12 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl border border-[#83c5ff]/18 bg-[#0781fe]/12 text-[#cfe9ff]">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Идэвхтэй room-уудын лидерүүд</div>
                    <div className="text-xs text-white/48">Одоогийн ашиг ба target progress</div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {leaderSummaries.length ? (
                    leaderSummaries.map((room) => (
                      <Link
                        key={room.id}
                        href={`/rooms/${room.slug}`}
                        className="rounded-[1.4rem] border border-white/10 bg-black/14 p-4 transition hover:border-[#3daafe]/22 hover:bg-white/[0.05]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9ad7ff]">
                              {room.accountSizeLabel}
                            </div>
                            <div className="mt-3 truncate text-base font-semibold tracking-[-0.02em] text-white">{room.title}</div>
                            <div className="mt-1 text-sm text-white/56">{room.leaderName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-semibold tracking-[-0.03em] text-white">{formatPercent(room.currentProfit)}</div>
                            <div className="mt-1 text-xs text-white/46">Target {room.targetPercent}%</div>
                          </div>
                        </div>

                        <div className="mt-4 h-2 rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#7bd0ff_0%,#0781fe_100%)] shadow-[0_0_16px_rgba(7,129,254,0.3)]"
                            style={{ width: `${room.progressValue}%` }}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-white/48">
                          <span>{room.activeTraderCount}/{room.maxTraderCapacity} трэйдер</span>
                          <span>{Math.round(room.progressValue)}% target</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-black/12 px-4 py-5 text-sm text-white/52">
                      Одоогоор идэвхтэй leader-тэй room алга.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-white/12 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl border border-[#83c5ff]/18 bg-[#0781fe]/12 text-[#cfe9ff]">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Нээлттэй бүртгэлтэй room-ууд</div>
                    <div className="text-xs text-white/48">10K, 25K, 50K, 100K ангилал бүрийн сонирхол</div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {registrationSummaries.map((bucket) => (
                    <div key={bucket.accountSizeLabel} className="rounded-[1.35rem] border border-white/10 bg-black/14 px-4 py-3.5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">{bucket.accountSizeLabel} room нээлттэй</div>
                          <div className="mt-1 text-xs text-white/46">
                            {bucket.ready ? "10 хүн бүрдсэн, дараагийн шатанд бэлэн" : `${bucket.remainingCount} хүн дутуу байна`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold tracking-[-0.03em] text-white">{bucket.interestedCount}</div>
                          <div className="text-xs text-white/46">сонирхож байна</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingComparisonSection />

      <section className="mt-10 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="ftmo-kicker">Идэвхтэй өрөөнүүд</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Идэвхтэй challenge room-ууд</h2>
            <p className="mt-2 text-sm text-white/52">Шинэ идэвхтэй өрөөнүүд эхэндээ харагдана.</p>
          </div>
          <Button variant="outline" render={<Link href="/rooms" />}>
            Бүгдийг харах
          </Button>
        </div>
        <div className="section-grid">
          {activeRooms.slice(0, 6).map((room) => (
            <RoomCard key={room.id} room={room} href={`/rooms/${room.slug}`} />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-white">
            <Trophy className="size-5 text-[#83c5ff]" />
            <h3 className="text-xl font-semibold tracking-[-0.03em]">Түүх ба ялагчид</h3>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
            Room дууссаны дараах ranking, winner badge, violation status, final snapshot-ууд түүхэнд үлдэнэ.
          </p>
          <div className="mt-5 grid gap-3">
            {historicalRooms.slice(0, 3).map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.slug}`}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{room.title}</div>
                    <div className="mt-1 text-sm text-white/46">{room.winnerTrader?.fullName ?? "Ялагч тогтоогоогүй"}</div>
                  </div>
                  <ArrowRight className="size-4 text-white/40" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="grid gap-4 text-sm text-white/58">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-5 text-[#83c5ff]" />
                <div>
                  <div className="font-medium text-white">Өдөрт олон удаа шинэчлэлт</div>
                  <div className="mt-1 leading-6">09:00, 21:00 болон custom schedule-ийг admin тохируулна.</div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-5 text-[#83c5ff]" />
                <div>
                  <div className="font-medium text-white">Өргөдлийн урсгал</div>
                  <div className="mt-1 leading-6">Public хэрэглэгчид account size-аа сонгож хүсэлт өгнө, admin баталгаажуулж урилга илгээнэ.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
