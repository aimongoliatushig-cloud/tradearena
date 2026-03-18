import { ChallengeStep, RoomPublicStatus, type ChallengeRoom } from "@prisma/client";

import { ScheduleTimesInput } from "@/components/admin/schedule-times-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { accountSizeLabels, roomPublicStatusLabels, roomStatusLabels, stepLabels } from "@/lib/labels";
import { ACCOUNT_SIZE, ACCOUNT_SIZE_OPTIONS, ROOM_LIFECYCLE_STATUS, ROOM_STATUS_OPTIONS } from "@/lib/prisma-enums";
import { getDefaultEntryFeeUsd } from "@/lib/pricing";
import { saveRoomFormAction } from "@/server/actions/admin-actions";
import { getDefaultScheduleConfig } from "@/server/services/settings-service";

export async function RoomForm({
  room,
  returnPath,
}: {
  room?: ChallengeRoom | null;
  returnPath: string;
}) {
  const defaultSchedule = await getDefaultScheduleConfig();
  const initialUpdateTimes = room?.updateTimes.length ? room.updateTimes : defaultSchedule.updateTimes;

  return (
    <Card className="border-white/10 bg-white/6 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl text-white">{room ? "Edit room" : "Create room"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={saveRoomFormAction} className="space-y-4">
          <input type="hidden" name="id" defaultValue={room?.id} />
          <input type="hidden" name="returnPath" value={returnPath} />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Room title</label>
              <input
                name="title"
                defaultValue={room?.title}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Max traders</label>
              <input
                name="maxTraderCapacity"
                type="number"
                min={1}
                max={50}
                defaultValue={room?.maxTraderCapacity ?? 10}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Entry fee (USD)</label>
              <input
                name="entryFeeUsd"
                type="number"
                min={0}
                step="0.01"
                defaultValue={room?.entryFeeUsd ?? getDefaultEntryFeeUsd(room?.accountSize ?? ACCOUNT_SIZE.SIZE_10K)}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Description</label>
            <textarea
              name="description"
              defaultValue={room?.description ?? ""}
              rows={4}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SelectField name="accountSize" label="Account size" defaultValue={room?.accountSize ?? ACCOUNT_SIZE.SIZE_10K}>
              {ACCOUNT_SIZE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {accountSizeLabels[value]}
                </option>
              ))}
            </SelectField>
            <SelectField name="step" label="Challenge step" defaultValue={room?.step ?? ChallengeStep.STEP_1}>
              {Object.values(ChallengeStep).map((value) => (
                <option key={value} value={value}>
                  {stepLabels[value]}
                </option>
              ))}
            </SelectField>
            <SelectField name="publicStatus" label="Public visibility" defaultValue={room?.publicStatus ?? RoomPublicStatus.PUBLIC}>
              {Object.values(RoomPublicStatus).map((value) => (
                <option key={value} value={value}>
                  {roomPublicStatusLabels[value]}
                </option>
              ))}
            </SelectField>
            <SelectField
              name="lifecycleStatus"
              label="Room status"
              defaultValue={room?.lifecycleStatus ?? ROOM_LIFECYCLE_STATUS.SIGNUP_OPEN}
            >
              {ROOM_STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {roomStatusLabels[value]}
                </option>
              ))}
            </SelectField>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Start date</label>
              <input
                name="startDate"
                type="date"
                defaultValue={room ? room.startDate.toISOString().slice(0, 10) : ""}
                className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">End date</label>
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
              <label className="text-sm text-white/70">Daily update times</label>
              <ScheduleTimesInput name="updateTimesInput" defaultTimes={initialUpdateTimes} />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              <input type="checkbox" name="allowExpiredUpdates" defaultChecked={room?.allowExpiredUpdates ?? false} />
              Allow scraping after expiry
            </label>
          </div>

          <SubmitButton>{room ? "Save room changes" : "Create room"}</SubmitButton>
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
