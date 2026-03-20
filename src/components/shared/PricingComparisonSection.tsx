import Link from "next/link";
import { ArrowRight, ShieldCheck, WalletCards } from "lucide-react";

import { buttonVariants } from "@/lib/button-variants";
import { formatUsd, PRICING_COMPARISON_DATA } from "@/lib/pricing";

const savingsRatios = PRICING_COMPARISON_DATA.map((item) => item.ftmo / item.tradeArena);
const roundedAverageMultiple = Math.round(savingsRatios.reduce((sum, ratio) => sum + ratio, 0) / savingsRatios.length);
const savingsRangeLabel = `${Math.round(Math.min(...savingsRatios))}-${Math.round(Math.max(...savingsRatios))}x хүртэл хямд`;

function SectionHeading() {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="ftmo-kicker">Үнийн харьцуулалт</div>
      <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
        Ганцаараа challenge авах уу, эсвэл бага зардлаар бодит дарамттай бэлтгэл хийх үү?
      </h2>
      <p className="max-w-3xl text-sm leading-7 text-white/62 sm:text-[15px]">
        FTMO challenge-г ганцаараа авахад өндөр төлбөртэй. TradeArena дээр 10 хүн нийлж оролцсоноор илүү бага зардлаар, илүү
        сахилга баттай орчинд өөрийгөө сорих боломжтой.
      </p>
      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/68">
        {savingsRangeLabel}
      </div>
    </div>
  );
}

function SavingsBadge({ multiple }: { multiple: number }) {
  return (
    <div className="absolute right-5 top-5 inline-flex items-center rounded-full border border-[#83c5ff]/28 bg-[#0781fe]/18 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9eeff] shadow-[0_12px_30px_rgba(7,129,254,0.16)]">
      Ойролцоогоор {multiple}X хямд
    </div>
  );
}

function PricingRow({
  size,
  value,
  emphasized = false,
}: {
  size: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.35rem] border px-4 py-3.5 ${
        emphasized
          ? "border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/8 bg-black/10"
      }`}
    >
      <span className="inline-flex min-w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-white/70">
        {size}
      </span>
      <div className="h-px bg-white/10" />
      <div className={`text-right text-xl font-semibold tabular-nums tracking-[-0.03em] ${emphasized ? "text-white" : "text-white/84"}`}>
        {formatUsd(value)}
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  subtitle,
  rows,
  valueKey,
  highlighted = false,
}: {
  title: string;
  subtitle: string;
  rows: typeof PRICING_COMPARISON_DATA;
  valueKey: "ftmo" | "tradeArena";
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl ${
        highlighted
          ? "border-[#3daafe]/18 bg-[linear-gradient(180deg,rgba(7,129,254,0.16),rgba(255,255,255,0.05)_24%,rgba(255,255,255,0.035)_100%)]"
          : "border-white/10 bg-white/[0.028]"
      }`}
    >
      {highlighted ? (
        <>
          <SavingsBadge multiple={roundedAverageMultiple} />
          <div className="pointer-events-none absolute -right-14 top-10 h-36 w-36 rounded-full bg-[#0781fe]/18 blur-3xl" />
        </>
      ) : null}
      <div className="relative">
        <div className="flex items-start gap-4">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${
              highlighted ? "border-[#83c5ff]/18 bg-[#0781fe]/14 text-[#d9eeff]" : "border-white/10 bg-white/[0.04] text-white/72"
            }`}
          >
            {highlighted ? <ShieldCheck className="size-5" /> : <WalletCards className="size-5" />}
          </div>
          <div className="space-y-2 pr-24">
            <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
            <p className="text-sm leading-6 text-white/56">{subtitle}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {rows.map((row) => (
            <PricingRow key={`${title}-${row.size}`} size={row.size} value={row[valueKey]} emphasized={highlighted} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PricingComparisonSection() {
  return (
    <section className="mt-12 space-y-6">
      <SectionHeading />

      <div className="grid gap-5 lg:grid-cols-2">
        <ComparisonCard
          title="FTMO шууд авах"
          subtitle="Эхлэх төлбөр өндөр, дарамт болон сахилгын хяналтыг ганцаараа үүрнэ."
          rows={PRICING_COMPARISON_DATA}
          valueKey="ftmo"
        />
        <ComparisonCard
          title="TradeArena-аар оролцох"
          subtitle={`${savingsRangeLabel} · 10 хүнтэй сахилга, хариуцлагын орчинд оролцоно.`}
          rows={PRICING_COMPARISON_DATA}
          valueKey="tradeArena"
          highlighted
        />
      </div>

      <div className="ftmo-panel flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="text-2xl font-semibold tracking-[-0.04em] text-white">Бага мөнгөөр. Бодит мэт дарамт. Илүү сахилга.</div>
          <p className="text-sm leading-7 text-white/58">
            TradeArena нь зөвхөн үнийн давуу тал биш. Дүрэм барих, сэтгэлзүйгээ шалгах, хяналттай орчинд бэлтгэх систем юм.
          </p>
        </div>
        <Link href="/packages" className={buttonVariants({ size: "lg" })}>
          Оролцох хүсэлт илгээх
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
