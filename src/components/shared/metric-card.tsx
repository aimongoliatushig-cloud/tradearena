import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.035] shadow-[0_20px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3daafe]/55 to-transparent" />
      <CardHeader className="pb-0">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/52">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold tracking-[-0.03em] text-white">{value}</div>
        {hint ? <div className="text-xs leading-6 text-white/50">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
