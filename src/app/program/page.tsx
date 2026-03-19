export const dynamic = "force-dynamic";

import { ArrowUpRight, BookOpen, Clock3, Scale, ShieldCheck, Target } from "lucide-react";

import { PublicShell } from "@/components/layout/public-shell";
import { buttonVariants } from "@/lib/button-variants";
import { ftmoCheckedAt, ftmoOfficialCards, ftmoSourceLinks, ourChallengeRuleGroups } from "@/lib/program-content";
import { cn } from "@/lib/utils";

const ftmoIcons = [BookOpen, Target, ShieldCheck, Scale] as const;

export default function ProgramPage() {
  return (
    <PublicShell>
      <section className="space-y-10">
        <div className="glass-panel relative overflow-hidden p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-16 top-0 h-52 w-52 rounded-full bg-[#18c7a2]/12 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-10 h-40 w-40 rounded-full bg-[#0781fe]/12 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="ftmo-kicker">ХӨТӨЛБӨР</div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
                FTMO-ийн funding plan
                <br />
                болон манай challenge-ийн дүрэм
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                Энэ хуудсын FTMO хэсгийг <span className="text-white">{ftmoCheckedAt}</span>-нд <span className="text-white">ftmo.com</span>-ийн
                албан ёсны мэдээллээс хураангуйлж оруулав. Доод хэсэгт манай challenge-ийн дүрмийг бүхэлд нь Монгол хэлээр нэгтгэж
                байршууллаа.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px] lg:grid-cols-1">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#95e8d5]">FTMO</div>
                <div className="mt-2 text-sm text-white/72">Албан ёсны эх сурвалж дээр тулгуурласан хураангуй</div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#95e8d5]">TradeArena</div>
                <div className="mt-2 text-sm text-white/72">Манай challenge-ийн 27 дүрэм нэг хуудсанд</div>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-5 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#95e8d5]">Тайлбар</div>
                <div className="mt-2 text-sm text-white/72">Бүгдийг Монгол хэлээр энгийнээр тайлбарласан</div>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="ftmo-kicker">FTMO Official</div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">FTMO-ийн funding plan-ийн хураангуй</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-white/58">
                Доорх мэдээлэл нь FTMO-ийн албан ёсны сайт дээрх evaluation process, FTMO Account, reward, scaling-ийн тайлбаруудыг
                Монгол хэлээр товчилсон хувилбар юм.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/48">
              <Clock3 className="size-4 text-[#95e8d5]" />
              Шалгасан огноо: {ftmoCheckedAt}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {ftmoOfficialCards.map((card, index) => {
              const Icon = ftmoIcons[index % ftmoIcons.length];

              return (
                <div
                  key={card.title}
                  className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.96),rgba(11,16,22,0.9))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#66e0c3]/18 bg-[#18c7a2]/10 text-[#d6fff4]">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{card.title}</h3>
                      <p className="text-sm leading-7 text-white/62">{card.description}</p>
                      <div className="grid gap-2">
                        {card.bullets.map((bullet) => (
                          <div key={bullet} className="rounded-[1.2rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white/70">
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">FTMO албан ёсны эх сурвалжууд</h3>
                <p className="mt-1 text-sm text-white/56">Эдгээр холбоосууд нь энэ хуудсын FTMO хэсгийг бэлтгэхэд ашигласан албан ёсны эх сурвалжууд.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {ftmoSourceLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full border-white/10 bg-white/[0.03] text-white/82")}
                >
                  {link.label}
                  <ArrowUpRight className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <div className="ftmo-kicker">TradeArena Challenge</div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white">Манай challenge-ийн дүрэм</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/58">
              Доорх дүрэм нь танай өгсөн агуулгыг бүтнээр нь Монгол хэлээр ангилж байршуулсан хувилбар. Энэ хэсэг нь FTMO-ийн official
              rules биш, манай internal challenge-ийн дүрэм болно.
            </p>
          </div>

          <div className="grid gap-5">
            {ourChallengeRuleGroups.map((group) => (
              <div key={group.title} className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.94),rgba(11,16,22,0.88))] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-[#3daafe]/18 bg-[#0781fe]/10 text-[#83c5ff]">
                    <BookOpen className="size-5" />
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
