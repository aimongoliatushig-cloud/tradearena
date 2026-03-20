export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Sparkles, Trophy, TrendingUp, Users, Wrench } from "lucide-react";

import { PublicShell } from "@/components/layout/public-shell";
import { LatestBlogCarousel } from "@/components/shared/latest-blog-carousel";
import { PricingComparisonSection } from "@/components/shared/PricingComparisonSection";
import { RoomCard } from "@/components/shared/room-card";
import { buttonVariants } from "@/lib/button-variants";
import { DEFAULT_TARGET_PERCENT } from "@/lib/constants";
import { buildProgressValue, formatPercent } from "@/lib/format";
import { accountSizeLabels, courseAccessLevelLabels } from "@/lib/labels";
import { sortTradersForLeaderboard } from "@/lib/leaderboard";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { listLatestPublishedBlogPosts } from "@/server/services/blog-service";
import { listActivePackageTiers } from "@/server/services/package-service";
import { getPublicHomepageData } from "@/server/services/room-service";

const heroSupportPoints = [
  "10K-200K шаталсан багцуудтай, алхам бүр дээр илүү их үнэ цэн нэмэгдэнэ.",
  "Төлбөр баталгаажмагц сургалт, стратеги, индикатор, хэрэгсэл автоматаар нээгдэнэ.",
  "Өрөө бүр 10 гишүүнтэй, дүүрвэл дараагийн өрөө автоматаар үүснэ.",
  "FTMO лидер самбар, өрөөний түүх, гүйцэтгэлийн хяналт хэвээр үлдэнэ.",
] as const;

const memberValueCards = [
  {
    title: "Сургалт + стратеги",
    text: "Багцын түвшнээр сургалтын эрх, стратегийн гарын авлага, PDF болон текст контент шатлан нээгдэнэ.",
    icon: BookOpen,
  },
  {
    title: "Индикатор ба хэрэгсэл",
    text: "TradingView индикатор, lot calculator болон гадаад холбоостой хэрэгслүүдийг багцаар удирдана.",
    icon: Wrench,
  },
  {
    title: "Коучингийн шатлал",
    text: "100K ба 200K түвшинд 1:1 коучинг, давуу дэмжлэг зэрэг нэмэлт үнэ цэн автоматаар холбогдоно.",
    icon: Headphones,
  },
] as const;

export default async function HomePage() {
  const [{ activeRooms, historicalRooms, totals }, latestPosts, packages] = await Promise.all([
    getPublicHomepageData(),
    listLatestPublishedBlogPosts(),
    listActivePackageTiers(),
  ]);

  const leaderSummaries = activeRooms.map((room) => {
    const sortedTraders = sortTradersForLeaderboard(room.traders);
    const leader = sortedTraders.find((trader) => trader.active) ?? sortedTraders[0] ?? null;
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

  return (
    <PublicShell>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel relative overflow-hidden border-white/8 bg-[linear-gradient(180deg,rgba(20,26,34,0.98),rgba(12,17,24,0.94))] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:p-10">
          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#18c7a2]/16 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-16 h-44 w-44 rounded-full bg-[#84ead0]/8 blur-3xl" />

          <div className="relative space-y-8">
            <div className="ftmo-kicker border-[#5cd9bd]/16 bg-[#18c7a2]/10 text-[#d6fff4] shadow-[0_10px_30px_rgba(24,199,162,0.12)]">
              TradeArena.pro багц платформ
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.07em] text-white sm:text-[4.25rem]">
                Багц, сургалт, өрөө, хяналтын самбарыг нэг урсгалд нэгтгэсэн арилжааны платформ.
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-white/66 sm:text-base">
                Хэрэглэгч багцаа сонгоно, төлбөрийн мэдээллээ илгээнэ, баталгаажмагц өрөөний хуваарилалт, сургалтын эрх,
                стратегийн нээлт, хэрэгсэл, коучинг бүгд автоматаар нээгдэнэ.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {heroSupportPoints.map((point) => (
                <div key={point} className="rounded-[1.4rem] border border-white/8 bg-white/[0.04] px-4 py-4 text-sm leading-6 text-white/72">
                  {point}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/packages"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[linear-gradient(135deg,#39d3b3_0%,#18c7a2_58%,#10927c_100%)] text-[#071210] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_20px_38px_rgba(24,199,162,0.22)] hover:bg-[linear-gradient(135deg,#4fdbc0_0%,#20cfab_58%,#129b84_100%)]",
                )}
              >
                Багц сонгох
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Хяналтын самбар
              </Link>
              <Link href="/rooms" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Өрөөнүүд
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/16 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Идэвхтэй өрөө</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{activeRooms.length}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/16 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Трэйдер</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{totals.traderCount}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/16 px-4 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Багцын шатлал</div>
                <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{packages.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel h-full border-white/8 bg-[linear-gradient(180deg,rgba(18,24,32,0.98),rgba(13,18,24,0.94))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.4)] sm:p-8">
          <div className="space-y-5">
            <div className="ftmo-kicker border-white/8 bg-white/[0.03] text-white/62">Багцын шатлал</div>
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.05em] text-white">10K-с 200K хүртэл шаталсан үнэ цэнэ</h2>
              <p className="mt-2 text-sm leading-7 text-white/58">
                Өрөөний багтаамж, сургалт, стратеги, индикатор, коучингийн эрх нь багцын түвшнээр өснө.
              </p>
            </div>

            <div className="grid gap-3">
              {packages.map((item) => (
                <Link
                  key={item.id}
                  href={`/checkout/${item.slug}`}
                  className="rounded-[1.4rem] border border-white/8 bg-black/12 p-4 transition hover:border-[#66e0c3]/18 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold tracking-[-0.03em] text-white">{item.nameMn}</div>
                      <div className="mt-1 text-sm text-white/50">{courseAccessLevelLabels[item.courseAccessLevel]}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold tracking-[-0.03em] text-white">{formatUsd(item.priceUsd)}</div>
                      <div className="mt-1 text-xs text-white/46">{item.maxUsers} хүний өрөө</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/58">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">{item.strategyCount} стратеги</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                      {item.includesIndicators ? "Индикатор нээгдэнэ" : "Индикатор байхгүй"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                      {item.includesCoaching ? `${item.coachingHours} цаг коучинг` : "Коучинг байхгүй"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="ftmo-kicker">Онцлох багцууд</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Хэрэглэгчийн үнэ цэнэ алхам бүр дээр нэмэгдэнэ</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/56">
              Багц солигдох бүрд илүү олон стратеги, гүнзгийрсэн сургалт, индикаторын эрх, коучинг болон дэмжлэг нэмэгдэнэ.
            </p>
          </div>
          <Link href="/packages" className={buttonVariants({ variant: "outline" })}>
            Бүх багц
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {memberValueCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(11,16,22,0.92))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#8de8d2]">
                  <Icon className="size-5" />
                </div>
                <div className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">{card.title}</div>
                <p className="mt-3 text-sm leading-7 text-white/60">{card.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <LatestBlogCarousel
        posts={latestPosts.map((post) => ({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          coverImageUrl: post.coverImageUrl,
          categoryName: post.category.name,
        }))}
      />

      <PricingComparisonSection />

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-white">
            <TrendingUp className="size-5 text-[#72dec5]" />
            <h3 className="text-xl font-semibold tracking-[-0.03em]">Идэвхтэй FTMO өрөөнүүд</h3>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
            Багцын платформ нэмэгдсэн ч FTMO лидер самбар, өрөөний гүйцэтгэлийн хяналт болон түүхэн үр дүн хэвээр ажиллана.
          </p>
          <div className="mt-5 grid gap-3">
            {leaderSummaries.length ? (
              leaderSummaries.slice(0, 4).map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.slug}`}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{room.title}</div>
                      <div className="mt-1 text-sm text-white/46">
                        {room.accountSizeLabel} · {room.leaderName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">{formatPercent(room.currentProfit)}</div>
                      <div className="text-xs text-white/46">{Math.round(room.progressValue)}% ахиц</div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/56">
                Одоогоор идэвхтэй өрөө алга.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-white">
            <Sparkles className="size-5 text-[#72dec5]" />
            <h3 className="text-xl font-semibold tracking-[-0.03em]">Ухаалаг элсэлтийн логик</h3>
          </div>
          <div className="mt-5 grid gap-4 text-sm text-white/58">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-5 text-[#72dec5]" />
                <div>
                  <div className="font-medium text-white">Өрөө дүүрэх логик</div>
                  <div className="mt-1 leading-6">Нэг өрөө дээд тал нь 10 хэрэглэгчтэй. Дүүрвэл ижил багцын дараагийн өрөө автоматаар үүснэ.</div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Headphones className="mt-0.5 size-5 text-[#72dec5]" />
                <div>
                  <div className="font-medium text-white">48 цагийн шийдвэр</div>
                  <div className="mt-1 leading-6">
                    Өрөө 48 цагт дүүрэхгүй бол нэгтгэх эсвэл хүлээх сонголт нээгдэж, админ гар аргаар шилжүүлэх боломжтой.
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-0.5 size-5 text-[#72dec5]" />
                <div>
                  <div className="font-medium text-white">Контентын эрхийн хяналт</div>
                  <div className="mt-1 leading-6">
                    Сургалт, стратеги, индикатор, хэрэгслийн эрх нь багцын холболтын хүснэгтээр удирдагдаж, хяналтын самбар дээр шүүгдэж харагдана.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="ftmo-kicker">Өрөөний жагсаалт</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Идэвхтэй challenge өрөөнүүд</h2>
            <p className="mt-2 text-sm text-white/52">Нийтэд харагдах лидер самбартай өрөөнүүд эхэндээ гарна.</p>
          </div>
          <Link href="/rooms" className={buttonVariants({ variant: "outline" })}>
            Бүгдийг харах
          </Link>
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
            <Trophy className="size-5 text-[#72dec5]" />
            <h3 className="text-xl font-semibold tracking-[-0.03em]">Түүх ба ялагчид</h3>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
            Дууссан өрөөнүүдийн ялагч, эрэмбэ, дүрэм зөрчсөн төлөв болон snapshot-ууд түүхэнд хадгалагдана.
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
                    <div className="mt-1 text-sm text-white/46">{room.winnerTrader?.fullName ?? "Ялагч тодроогүй"}</div>
                  </div>
                  <ArrowRight className="size-4 text-white/40" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 text-white">
            <Sparkles className="size-5 text-[#72dec5]" />
            <h3 className="text-xl font-semibold tracking-[-0.03em]">Платформын үр дүн</h3>
          </div>
          <div className="mt-5 grid gap-4 text-sm text-white/58">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="font-medium text-white">Шаталсан үнэ цэн</div>
              <div className="mt-1 leading-6">Багц ахих тусам сургалтын түвшин, стратегийн тоо, коучинг болон дэмжлэг шатлан нэмэгдэнэ.</div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="font-medium text-white">Өргөтгөхөд бэлэн удирдлага</div>
              <div className="mt-1 leading-6">Админ багц, сургалт, нөөц, элсэлт, өрөөний дүүргэлтийг тус тусад нь удирдана.</div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <div className="font-medium text-white">Зөвхөн стрийм дамжуулалт</div>
              <div className="mt-1 leading-6">Видео файлууд локал хадгалахгүй, зөвхөн гаднын аюулгүй холбоосоор embed эсвэл стрийм хийнэ.</div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
