import { formatAccountSize } from "@/lib/format";

export function AccountSizeBadge({ size }: { size: Parameters<typeof formatAccountSize>[0] }) {
  return (
    <div className="flex min-w-20 items-center justify-center rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] px-4 py-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur">
      {formatAccountSize(size)}
    </div>
  );
}
