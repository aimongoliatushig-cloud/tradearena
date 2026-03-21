"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

const headlineLines = [
  "Үнэгүй сургалт,",
  "10 хүний demo өрөө,",
  "ялагчид бодит",
  "FTMO challenge.",
] as const;

const benefitChips = [
  "Үнэгүй сургалт",
  "10 хүний demo өрөө",
  "Арилжааны хэрэгсэл",
  "FTMO challenge боломж",
] as const;

const statPills = ["10 оролцогч", "1 ялагч", "Бодит challenge боломж"] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function HomeHeroPrimary() {
  const reduceMotion = useReducedMotion();
  const motionState = reduceMotion ? {} : { initial: "hidden" as const, animate: "visible" as const };

  return (
    <motion.div {...motionState} variants={containerVariants} className="relative space-y-8 sm:space-y-9">
      <div className="pointer-events-none absolute left-4 top-24 h-36 w-36 rounded-full bg-[#37dcb8]/10 blur-[90px]" />

      <motion.div variants={fadeUpVariants} className="relative flex">
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -3, 0],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 5.6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
          }
          className="inline-flex items-center rounded-full border border-[#5cd9bd]/18 bg-[#18c7a2]/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#d6fff4] shadow-[0_0_0_1px_rgba(92,217,189,0.08),0_12px_36px_rgba(24,199,162,0.14)] backdrop-blur-xl"
        >
          TRADEARENA.PRO FTMO БЭЛТГЭЛ ПЛАТФОРМ
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} className="relative space-y-5">
        <div className="max-w-4xl">
          {headlineLines.map((line) => (
            <motion.span
              key={line}
              variants={fadeUpVariants}
              className="block text-[clamp(3.2rem,7.8vw,6rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-white"
            >
              {line}
            </motion.span>
          ))}
        </div>

        <motion.p variants={fadeUpVariants} className="max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          FTMO-д бэлдэхэд хэрэгтэй сургалт, demo сорилт, арилжааны хэрэгсэл, хамтын дэмжлэгийг нэг дороос авна. 10
          оролцогчоос шилдэг нь бодит FTMO challenge авах боломжтой, бусад оролцогчид ч мэдлэг, хэрэгслээ авч үлдэн
          дараагийн шатанд дахин оролцоно.
        </motion.p>
      </motion.div>

      <motion.div variants={containerVariants} className="relative flex flex-wrap gap-3">
        {benefitChips.map((chip) => (
          <motion.div
            key={chip}
            variants={fadeUpVariants}
            className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-medium text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl"
          >
            {chip}
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={containerVariants} className="relative flex flex-wrap gap-3">
        <motion.div variants={fadeUpVariants}>
          <Link
            href="/rooms"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-[linear-gradient(135deg,#39d3b3_0%,#18c7a2_58%,#10927c_100%)] text-[#071210] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_20px_38px_rgba(24,199,162,0.22)] hover:bg-[linear-gradient(135deg,#4fdbc0_0%,#20cfab_58%,#129b84_100%)]",
            )}
          >
            Өрөөгөө сонгох
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>

        <motion.div variants={fadeUpVariants}>
          <Link
            href="/program"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/12 bg-white/[0.03] text-white/92 hover:bg-white/[0.07]",
            )}
          >
            Хэрхэн ажилладгийг үзэх
            <PlayCircle className="size-4" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} className="relative flex flex-wrap gap-3 pt-1">
        {statPills.map((pill) => (
          <motion.div
            key={pill}
            variants={fadeUpVariants}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -2, 0],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 6.2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }
            }
            className="rounded-full border border-[#5cd9bd]/12 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#c8fff0] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            {pill}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
