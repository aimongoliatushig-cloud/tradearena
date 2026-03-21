"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BrainCircuit, ChartNoAxesColumnIncreasing, ShieldCheck, Target } from "lucide-react";

import { cn } from "@/lib/utils";

const CONTACT_URL = "https://t.me/tradearenamgl";

const heroHighlights = [
  {
    title: "2021 оноос эхэлсэн",
    text: "FTMO Mongolia нь трейдерүүдийн хамт олон хэлбэрээр эхэлсэн.",
  },
  {
    title: "600+ трейдер",
    text: "Манай уулзалт, оффис, хөтөлбөрөөр 600 гаруй трейдер дамжсан.",
  },
  {
    title: "Сургалт + Бэлтгэл",
    text: "Бид зөвхөн заадаггүй, бодитоор бэлтгэдэг.",
  },
] as const;

const storyItems = [
  {
    year: "2019",
    text: "Үүсгэн байгуулагч Баттүшиг Тогтох олон улсын зах зээлээс долларын орлого олох боломжийг эрж, трейдингтэй илүү гүн танилцаж эхэлсэн.",
  },
  {
    year: "2021",
    text: "FTMO Mongolia трейдерүүдийн хамт олон хэлбэрээр эхэлж, funded trading ойлголтыг Монголд зөвөөр түгээх зорилготой ажиллаж эхэлсэн.",
  },
  {
    year: "Өнөөдөр",
    text: "TraderArena нь зөвхөн мэдээлэл өгөх биш, харин трейдерийг бодитоор бэлтгэх сургалт, дадлага, сахилга бат, эрсдэлийн зөв хандлагад төвлөрсөн шинэ шатны платформ болж хөгжсөн.",
  },
] as const;

const whyWeExistCards = [
  {
    title: "Хэт их төөрөгдөл",
    text: "Зах зээл дээр амархан мөнгө амлах маркетинг олон, харин бодит бэлтгэл маш ховор.",
  },
  {
    title: "Ихэнх хүн бэлтгэлгүй ордог",
    text: "Шинэ трейдерүүд төлөвлөгөөгүй, сахилга батгүйгээр эхэлдэг учраас эрсдэлээ хянаж чадалгүй алддаг.",
  },
  {
    title: "Трейдинг бол ур чадвар",
    text: "Мэргэжлийн спорт шиг зөв систем, тогтмол бэлтгэл, давталт, сахилга бат шаарддаг.",
  },
] as const;

const whatWeDoCards = [
  {
    title: "Трейдинг төлөвлөгөө",
    text: "Тохиолдлын арилжаа биш, дүрэмтэй ажиллах систем бий болгоход тусалдаг.",
  },
  {
    title: "Бэктест ба дадлага",
    text: "Зах зээл дээр шууд эрсдэл хийхээс өмнө арга барилаа баталгаажуулах бэлтгэлд төвлөрдөг.",
  },
  {
    title: "Сахилга бат ба сэтгэлзүй",
    text: "Сайн системээс гадна түүнийг мөрдөх чадвар хамгийн чухал гэж үздэг.",
  },
  {
    title: "Эрсдэл багатай funded зам",
    text: "Трейдерүүдийг илүү ухаалаг, илүү хяналттай байдлаар funded боломж руу ойртуулдаг.",
  },
] as const;

const teamCards = [
  {
    name: "Баттүшиг Тогтох",
    role: "Үүсгэн байгуулагч",
    text: "FTMO Mongolia болон TraderArena-ийн үүсгэн байгуулагч. Монгол трейдерүүдэд бодит бэлтгэлтэй өсөх орчин бүрдүүлэх зорилготой.",
    visual: "founder" as const,
  },
  {
    name: "Мэргэжлийн трейдерүүд",
    role: "Трейдинг менторууд",
    text: "Манай багт бодитоор арилжаа хийж буй 2 мэргэжлийн трейдер ажиллаж байна.",
    visual: "mentors" as const,
  },
  {
    name: "AI технологийн түнш",
    role: "Технологийн хамтрагч",
    text: "Монголын томоохон AI компанитай хамтран сургалт, бэлтгэлийн технологийн шийдэл хөгжүүлж байна.",
    visual: "ai" as const,
  },
] as const;

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

type SectionHeadingProps = {
  title: string;
  description?: string;
  centered?: boolean;
  invert?: boolean;
};

type AboutSectionProps = SectionHeadingProps & {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

type ActionLinkProps = {
  children: React.ReactNode;
  className?: string;
  external?: boolean;
  href: string;
  variant?: "primary" | "secondary";
};

type PremiumCardProps = {
  children?: React.ReactNode;
  className?: string;
  index?: number;
  text?: string;
  title?: string;
};

type TeamVisualProps = {
  kind: (typeof teamCards)[number]["visual"];
};

const easeOut = [0.22, 1, 0.36, 1] as const;

export function AboutPageContent() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,#0b1016_0%,#111821_100%)] p-3 shadow-[0_36px_120px_rgba(0,0,0,0.42)] sm:p-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_left,rgba(32,178,170,0.18),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[30rem] bg-[radial-gradient(circle_at_center,rgba(64,92,145,0.14),transparent_54%)]" />

      <div className="relative space-y-3 sm:space-y-4">
        <Reveal reduceMotion={reduceMotion}>
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.98),rgba(10,14,20,0.96))] px-6 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.34)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] xl:gap-8">
              <div className="flex flex-col justify-between gap-8 lg:gap-12">
                <div className="space-y-6">
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/64">
                    Бидний тухай
                  </div>

                  <div className="space-y-5">
                    <h1 className="max-w-3xl text-[clamp(2.75rem,6vw,5.2rem)] font-semibold leading-[0.94] tracking-[-0.07em] text-white">
                      Бид трейдингийг амархан мөнгө гэж хардаггүй
                    </h1>
                    <p className="max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
                      TraderArena бол Монгол трейдерүүдэд олон улсын зах зээлээс орлого олохын тулд зөв дадал, сахилга бат, бодит бэлтгэлийг хөгжүүлэхэд зориулсан сургалт ба бэлтгэлийн орчин юм.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <ActionLink href="#story">Манай түүх</ActionLink>
                  <ActionLink href="/program" variant="secondary">
                    Манай хөтөлбөр
                  </ActionLink>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <PremiumCard
                  reduceMotion={reduceMotion}
                  className="relative min-h-[25rem] overflow-hidden border-white/12 bg-[linear-gradient(180deg,rgba(18,33,40,0.96),rgba(10,15,21,0.94))] p-0"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(32,178,170,0.18),transparent_48%)]" />
                  <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                    <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/74 shadow-[0_10px_25px_rgba(0,0,0,0.22)]">
                      Үүсгэн байгуулагч
                    </div>

                    <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
                      <Image
                        src="/uploads/founder.png"
                        alt="Үүсгэн байгуулагч Баттүшиг Тогтох"
                        fill
                        priority
                        className="object-contain"
                      />
                    </div>

                    <div className="rounded-[1.3rem] border border-white/10 bg-[#0f151c]/88 p-4 shadow-[0_18px_34px_rgba(0,0,0,0.26)] backdrop-blur">
                      <div className="text-lg font-semibold tracking-[-0.03em] text-white">Баттүшиг Тогтох</div>
                      <div className="mt-1 text-sm text-white/56">Үүсгэн байгуулагч</div>
                    </div>
                  </div>
                </PremiumCard>

                <div className="grid gap-4">
                  {heroHighlights.map((card, index) => (
                    <PremiumCard key={card.title} reduceMotion={reduceMotion} title={card.title} text={card.text} index={index} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <AboutSection reduceMotion={reduceMotion} id="story" title="Манай түүх">
          <div className="relative mt-8 space-y-6 pl-6 before:absolute before:bottom-2 before:left-[0.45rem] before:top-2 before:w-px before:bg-white/12 sm:pl-8">
            {storyItems.map((item, index) => (
              <Reveal key={item.year} reduceMotion={reduceMotion} delay={index * 0.06}>
                <div className="relative grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-8">
                  <div className="absolute left-[-1.45rem] top-2 size-3 rounded-full border-4 border-[#10161d] bg-[#38d1b4] shadow-[0_0_0_8px_rgba(56,209,180,0.08)] sm:left-[-1.95rem]" />
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/46">{item.year}</div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(19,26,34,0.92),rgba(12,17,24,0.88))] p-5 text-base leading-8 text-white/68 shadow-[0_18px_38px_rgba(0,0,0,0.22)] sm:p-6">
                    {item.text}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </AboutSection>

        <AboutSection reduceMotion={reduceMotion} title="Бид яагаад оршдог вэ">
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {whyWeExistCards.map((card, index) => (
              <PremiumCard key={card.title} reduceMotion={reduceMotion} title={card.title} text={card.text} index={index}>
                <div className="inline-flex size-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/56">
                  {`0${index + 1}`}
                </div>
              </PremiumCard>
            ))}
          </div>
        </AboutSection>

        <AboutSection
          reduceMotion={reduceMotion}
          title="Бидний итгэл үнэмшил"
          invert
          className="overflow-hidden bg-[linear-gradient(135deg,#0b1320_0%,#122033_52%,#0d1a28_100%)]"
        >
          <div className="pointer-events-none absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_center,rgba(32,178,170,0.22),transparent_58%)]" />
          <Reveal reduceMotion={reduceMotion} className="relative mt-8">
            <div className="max-w-4xl space-y-5">
              <p className="text-[clamp(2rem,4.2vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-white">
                Трейдингт илүү их зүйл сурах нь биш, нэг зөв зүйлийг улам гүн эзэмших нь чухал.
              </p>
              <p className="max-w-3xl text-base leading-8 text-white/72 sm:text-lg">
                Амжилт нь олон стратегиас биш, харин төлөвлөгөөгөө баримтлах сахилга бат, бэктест, форвард тест, давталттай бэлтгэлээс бий болдог.
              </p>
            </div>
          </Reveal>
        </AboutSection>

        <AboutSection reduceMotion={reduceMotion} title="Бид юу хийдэг вэ">
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {whatWeDoCards.map((card, index) => (
              <PremiumCard key={card.title} reduceMotion={reduceMotion} title={card.title} text={card.text} index={index}>
                <div className="inline-flex size-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-white">
                  {index === 0 ? (
                    <Target className="size-5" />
                  ) : index === 1 ? (
                    <ChartNoAxesColumnIncreasing className="size-5" />
                  ) : index === 2 ? (
                    <ShieldCheck className="size-5" />
                  ) : (
                    <ArrowRight className="size-5" />
                  )}
                </div>
              </PremiumCard>
            ))}
          </div>
        </AboutSection>

        <AboutSection reduceMotion={reduceMotion} title="Манай баг">
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {teamCards.map((member, index) => (
              <PremiumCard key={member.name} reduceMotion={reduceMotion} className="overflow-hidden p-0" index={index}>
                <div className="p-4 pb-0 sm:p-5 sm:pb-0">
                  <TeamVisual kind={member.visual} />
                </div>
                <div className="space-y-3 p-5 sm:p-6">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-white/54">{member.role}</p>
                  </div>
                  <p className="text-sm leading-7 text-white/64">{member.text}</p>
                </div>
              </PremiumCard>
            ))}
          </div>
        </AboutSection>

        <AboutSection
          reduceMotion={reduceMotion}
          title="Манай алсын хараа"
          invert
          className="bg-[linear-gradient(135deg,#09111d_0%,#101a2c_48%,#0b1624_100%)]"
        >
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <Reveal reduceMotion={reduceMotion}>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
                Бидний зорилго бол илүү олон сахилга баттай, системтэй, бэлтгэлтэй трейдерүүдийг төрүүлэх.
              </div>
            </Reveal>

            <Reveal reduceMotion={reduceMotion} delay={0.08}>
              <div className="space-y-4">
                <p className="text-[clamp(2rem,4.4vw,3.8rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
                  Монгол хүмүүс олон улсын зах зээлд мөнгөө алдах биш, харин ур чадвараараа долларын орлого олдог болоход туслах.
                </p>
                <p className="text-sm uppercase tracking-[0.24em] text-white/42">Сахилга бат. Систем. Бэлтгэл.</p>
              </div>
            </Reveal>
          </div>
        </AboutSection>

        <AboutSection
          reduceMotion={reduceMotion}
          title="Зөв бэлтгэлтэй трейдинг эхэлнэ"
          description="Хэрэв та трейдингт илүү бодит, илүү системтэй, илүү сахилга баттай хандахыг хүсэж байвал TraderArena таны бэлтгэлийн орчин байх болно."
          centered
          className="bg-[linear-gradient(180deg,rgba(17,23,31,0.98),rgba(9,13,19,0.96))]"
        >
          <Reveal reduceMotion={reduceMotion} className="mt-8 flex flex-wrap justify-center gap-3">
            <ActionLink href="/program">Хөтөлбөртэй танилцах</ActionLink>
            <ActionLink href={CONTACT_URL} external variant="secondary">
              Холбоо барих
            </ActionLink>
          </Reveal>
        </AboutSection>
      </div>
    </div>
  );
}

function Reveal({ children, className, delay = 0, reduceMotion }: RevealProps & { reduceMotion: boolean }) {
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.18 }}
      transition={reduceMotion ? undefined : { delay, duration: 0.6, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ title, description, centered = false, invert = false }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", centered && "mx-auto text-center")}>
      <h2
        className={cn(
          "text-[clamp(2rem,4vw,3.35rem)] font-semibold leading-[1.04] tracking-[-0.05em]",
          invert ? "text-white" : "text-white",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-3 text-sm leading-7 sm:text-base", invert ? "text-white/72" : "text-white/62")}>{description}</p>
      ) : null}
    </div>
  );
}

function AboutSection({
  children,
  className,
  description,
  id,
  invert = false,
  reduceMotion,
  title,
  centered = false,
}: AboutSectionProps & { centered?: boolean; reduceMotion: boolean }) {
  return (
    <Reveal reduceMotion={reduceMotion}>
      <section
        id={id}
        className={cn(
          "relative scroll-mt-28 overflow-hidden rounded-[2rem] border px-6 py-8 shadow-[0_22px_60px_rgba(0,0,0,0.24)] sm:px-8 sm:py-10 lg:px-10",
          invert
            ? "border-white/8 bg-[linear-gradient(180deg,rgba(11,17,25,0.98),rgba(8,12,18,0.94))]"
            : "border-white/10 bg-[linear-gradient(180deg,rgba(17,23,31,0.94),rgba(10,14,20,0.9))]",
          className,
        )}
      >
        <SectionHeading title={title} description={description} centered={centered} invert={invert} />
        {children}
      </section>
    </Reveal>
  );
}

function PremiumCard({ children, className, index = 0, reduceMotion, text, title }: PremiumCardProps & { reduceMotion: boolean }) {
  return (
    <motion.div
      className={cn(
        "rounded-[1.65rem] border border-white/10 bg-[linear-gradient(180deg,rgba(19,26,34,0.94),rgba(11,16,22,0.88))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)]",
        className,
      )}
      initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.22 }}
      transition={reduceMotion ? undefined : { delay: index * 0.06, duration: 0.55, ease: easeOut }}
    >
      <div className="flex h-full flex-col gap-4">
        {children}
        {title ? <h3 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-white">{title}</h3> : null}
        {text ? <p className="text-sm leading-7 text-white/62">{text}</p> : null}
      </div>
    </motion.div>
  );
}

function ActionLink({ children, className, external = false, href, variant = "primary" }: ActionLinkProps) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-[1.1rem] px-5 text-sm font-semibold tracking-[-0.02em] transition duration-200",
        variant === "primary"
          ? "bg-white text-[#091019] shadow-[0_18px_36px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:bg-[#f2f5f8]"
          : "border border-white/12 bg-white/[0.03] text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 hover:bg-white/[0.06]",
        className,
      )}
    >
      {children}
      {variant === "primary" ? <ArrowRight className="size-4" /> : null}
    </Link>
  );
}

function TeamVisual({ kind }: TeamVisualProps) {
  if (kind === "founder") {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,31,37,0.96),rgba(11,16,22,0.92))] p-5">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(32,178,170,0.18),transparent_68%)]" />
        <div className="relative mx-auto aspect-square w-full max-w-[12.5rem]">
          <Image src="/uploads/founder.png" alt="Баттүшиг Тогтох" fill className="object-contain" />
        </div>
      </div>
    );
  }

  if (kind === "mentors") {
    return (
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(18,24,32,0.96),rgba(11,16,22,0.92))] p-5">
        <div className="pointer-events-none absolute right-[-1.5rem] top-[-1.5rem] size-28 rounded-full bg-white/6 blur-2xl" />
        <div className="relative flex min-h-[12rem] flex-col justify-between">
          <div className="inline-flex size-12 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
            <ChartNoAxesColumnIncreasing className="size-5" />
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-semibold tracking-[-0.05em] text-white">2 трейдер</div>
            <div className="text-sm leading-7 text-white/62">Бодит зах зээл дээр ажиллаж буй менторууд</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(16,24,33,0.96),rgba(10,15,21,0.92))] p-5">
      <div className="pointer-events-none absolute bottom-[-1.5rem] right-[-1.5rem] size-28 rounded-full bg-[#20b2aa]/12 blur-2xl" />
      <div className="relative flex min-h-[12rem] flex-col justify-between">
        <div className="inline-flex size-12 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
          <BrainCircuit className="size-5" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/72">
              AI шийдэл
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/72">
              Сургалтын технологи
            </span>
          </div>
          <div className="text-sm leading-7 text-white/62">Хөтөлбөрийн дэд бүтцийг илүү ухаалаг, илүү үр дүнтэй болгох хамтын хөгжил</div>
        </div>
      </div>
    </div>
  );
}
