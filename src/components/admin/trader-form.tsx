import type { Trader } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { saveTraderFormAction } from "@/server/actions/admin-actions";

export function TraderForm({
  roomId,
  trader,
  returnPath,
}: {
  roomId: string;
  trader?: Trader | null;
  returnPath: string;
}) {
  return (
    <form action={saveTraderFormAction} className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-[1fr_1.4fr_auto_auto]">
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="traderId" value={trader?.id} />
      <input type="hidden" name="returnPath" value={returnPath} />

      <div className="space-y-2">
        <label className="text-xs text-white/55">Трейдерийн нэр</label>
        <input
          name="fullName"
          defaultValue={trader?.fullName}
          placeholder="Овог нэр"
          className="flex h-10 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-white/55">FTMO MetriX URL</label>
        <input
          name="metrixUrl"
          defaultValue={trader?.metrixUrl}
          placeholder="https://trader.ftmo.com/..."
          className="flex h-10 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
        />
      </div>
      <label className="flex items-end gap-2 pb-2 text-sm text-white/70">
        <input type="checkbox" name="active" defaultChecked={trader?.active ?? true} />
        Идэвхтэй
      </label>
      <div className="flex items-end">
        <SubmitButton className="w-full justify-center">{trader ? "Хадгалах" : "Нэмэх"}</SubmitButton>
      </div>
    </form>
  );
}
