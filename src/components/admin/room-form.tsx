import { AccountSize, ChallengeStep, RoomLifecycleStatus, RoomPublicStatus, type ChallengeRoom } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { accountSizeLabels, roomPublicStatusLabels, roomStatusLabels, stepLabels } from "@/lib/labels";
import { saveRoomFormAction } from "@/server/actions/admin-actions";

export function RoomForm({
  room,
  returnPath,
}: {
  room?: ChallengeRoom | null;
  returnPath: string;
}) {
  return (
    <Card className="border-white/10 bg-white/6 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white">{room ? "Өрөө засах" : "Шинэ өрөө үүсгэх"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveRoomFormAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={room?.id} />
          <input type="hidden" name="returnPath" value={returnPath} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Өрөөний нэр</label>
              <input
                name="title"
                defaultValue={room?.title}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Трейдерийн дээд тоо</label>
              <input
                name="maxTraderCapacity"
                type="number"
                min={1}
                max={50}
                defaultValue={room?.maxTraderCapacity ?? 10}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Тайлбар</label>
            <textarea
              name="description"
              defaultValue={room?.description ?? ""}
              rows={4}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField name="accountSize" label="Дансны хэмжээ" defaultValue={room?.accountSize ?? AccountSize.SIZE_10K}>
              {Object.values(AccountSize).map((value) => (
                <option key={value} value={value}>
                  {accountSizeLabels[value]}
                </option>
              ))}
            </SelectField>
            <SelectField name="step" label="Алхам" defaultValue={room?.step ?? ChallengeStep.STEP_1}>
              {Object.values(ChallengeStep).map((value) => (
                <option key={value} value={value}>
                  {stepLabels[value]}
                </option>
              ))}
            </SelectField>
            <SelectField name="publicStatus" label="Нийтийн төлөв" defaultValue={room?.publicStatus ?? RoomPublicStatus.PUBLIC}>
              {Object.values(RoomPublicStatus).map((value) => (
                <option key={value} value={value}>
                  {roomPublicStatusLabels[value]}
                </option>
              ))}
            </SelectField>
            <SelectField
              name="lifecycleStatus"
              label="Өрөөний төлөв"
              defaultValue={room?.lifecycleStatus ?? RoomLifecycleStatus.ACTIVE}
            >
              {Object.values(RoomLifecycleStatus).map((value) => (
                <option key={value} value={value}>
                  {roomStatusLabels[value]}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Эхлэх огноо</label>
              <input
                name="startDate"
                type="date"
                defaultValue={room ? room.startDate.toISOString().slice(0, 10) : ""}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Дуусах огноо</label>
              <input
                name="endDate"
                type="date"
                defaultValue={room ? room.endDate.toISOString().slice(0, 10) : ""}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Timezone</label>
              <input
                name="updateTimezone"
                defaultValue={room?.updateTimezone ?? "Asia/Ulaanbaatar"}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Өдрийн шинэчлэлтийн цагууд</label>
              <input
                name="updateTimesInput"
                defaultValue={room?.updateTimes.join(", ") ?? "09:00, 21:00"}
                placeholder="09:00, 21:00"
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <input type="checkbox" name="allowExpiredUpdates" defaultChecked={room?.allowExpiredUpdates ?? false} />
              Хугацаа дууссаны дараа ч scrape хийх
            </label>
          </div>

          <SubmitButton>{room ? "Өөрчлөлт хадгалах" : "Өрөө үүсгэх"}</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/70">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
      >
        {children}
      </select>
    </div>
  );
}
