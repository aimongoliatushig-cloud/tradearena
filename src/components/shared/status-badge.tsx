import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "muted";

const toneMap: Record<Tone, string> = {
  success: "border-emerald-500/24 bg-emerald-500/12 text-emerald-200",
  warning: "border-orange-500/24 bg-orange-500/12 text-orange-200",
  danger: "border-red-500/24 bg-red-500/12 text-red-200",
  info: "border-[#0781fe]/24 bg-[#0781fe]/14 text-[#83c5ff]",
  muted: "border-white/12 bg-white/[0.05] text-white/68",
};

export function StatusBadge({ label, tone = "muted" }: { label: string; tone?: Tone }) {
  return (
    <Badge className={cn("rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]", toneMap[tone])}>
      {label}
    </Badge>
  );
}
