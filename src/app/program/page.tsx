export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Trophy, Users } from "lucide-react";

import { PublicShell } from "@/components/layout/public-shell";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

const programCards = [
  {
    href: "/program/ftmo",
    title: "FTMO хөтөлбөр",
    description:
      "FTMO гэж юу вэ, үнэлгээ яаж явдаг вэ, ашиг хуваарилалт, өсөлтийн төлөвлөгөө, дансны бүтэц ямар байдаг вэ гэдгийг албан ёсны эх сурвалж дээр тулгуурлан товч, ойлгомжтой харуулна.",
    bullets: ["FTMO-ийн албан ёсны тойм", "Арилжааны зорилтууд", "Шагнал ба өсөлтийн төлөвлөгөө"],
    icon: ShieldCheck,
  },
  {
    href: "/program/10-challenge",
    title: "10тын чэллэнж",
    description:
      "Манай 10 хүний demo өрөөтэй бэлтгэлийн систем, үнэгүй сургалт, арилжааны хэрэгслүүд, ялагчид бодит challenge олгох бүтэц, бусад оролцогчдын авах үнэ цэнийг нэг дор харуулна.",
    bullets: ["10 хүнтэй demo өрөө", "Дүрэм, шалгаралт, дахин оролцох боломж", "Багц ба оролцооны давуу тал"],
    icon: Trophy,
  },
] as const;

const highlightStats = [
  { label: "2 чиглэл", value: "FTMO + дотоод хөтөлбөр" },
  { label: "10 оролцогч", value: "Нэг өрөөнд нэг цикл" },
  { label: "1 зорилго", value: "FTMO-д илүү бэлтгэлтэй очих" },
] as const;

export default function ProgramPage() {
  return (
    <PublicShell>
      <section className="space-y-10">
        <div className="glass-panel relative overflow-hidden p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[#18c7a2]/12 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-8 h-40 w-40 rounded-full bg-[#0781fe]/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div className="max-w-4xl">
              <div className="ftmo-kicker">ХӨТӨЛБӨРИЙН ТОЙМ</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                FTMO-г эхлээд ойлго.
                <br />
                Дараа нь манай 10тын чэллэнжийг сонго.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                Энэ цэсийг 2 тусдаа хэсэг болголоо. Нэг хэсэгт FTMO-ийн албан ёсны бүтэц, нөгөө хэсэгт TradeArena-ийн 10 хүний
                demo бэлтгэлийн систем, дүрэм, багцын давуу талыг төвлөрүүлэв. Ингэснээр хэрэглэгч 3-5 секундэд юуг хаанаас
                харахаа ойлгоно.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/program/ftmo" className={buttonVariants({ size: "lg" })}>
                  FTMO хөтөлбөр үзэх
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/program/10-challenge" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/10")}>
                  10тын чэллэнж үзэх
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {highlightStats.map((item) => (
                <div key={item.label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#95e8d5]">{item.label}</div>
                  <div className="mt-2 text-sm leading-6 text-white/72">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-5 xl:grid-cols-2">
          {programCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.href}
                className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(11,16,22,0.9))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#66e0c3]/18 bg-[#18c7a2]/10 text-[#d6fff4]">
                    <Icon className="size-5" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">{card.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-white/60">{card.description}</p>
                    </div>

                    <div className="grid gap-2">
                      {card.bullets.map((bullet) => (
                        <div key={bullet} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/72">
                          {bullet}
                        </div>
                      ))}
                    </div>

                    <Link href={card.href} className={cn(buttonVariants({ variant: "outline" }), "border-white/10 bg-white/[0.03] text-white")}>
                      Дэлгэрэнгүй үзэх
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3 text-white">
              <BookOpen className="size-5 text-[#72dec5]" />
              <div className="text-lg font-semibold">FTMO-ийн суурь ойлголт</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Албан ёсны эх сурвалж дээр тулгуурласан товч тайлбар нь хэрэглэгчийг буруу хүлээлтгүйгээр FTMO-ийн үнэлгээний бүтцийг ойлгоход тусална.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3 text-white">
              <Users className="size-5 text-[#72dec5]" />
              <div className="text-lg font-semibold">10 хүний бүтэцтэй өрсөлдөөн</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Манай challenge нь ганцаараа төлбөр төлж сорихын оронд хяналттай, сургалттай, хамт олонтой орчинд бэлтгэнэ.
            </p>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3 text-white">
              <Trophy className="size-5 text-[#72dec5]" />
              <div className="text-lg font-semibold">Ялагч ба бусдын үнэ цэнэ</div>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Ялагч бодит challenge авна. Бусад оролцогчид ч сургалт, хэрэгсэл, тайлагнал, дахин оролцох боломжийн үнэ цэнээ авч үлдэнэ.
            </p>
          </div>
        </section>
      </section>
    </PublicShell>
  );
}
