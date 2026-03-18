"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useActionState } from "react";
import type { AccountSize, ChallengeStep } from "@prisma/client";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/lib/button-variants";
import { accountSizeLabels } from "@/lib/labels";
import { formatUsd } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { defaultActionState } from "@/server/actions/action-state";
import { submitApplicantAction } from "@/server/actions/public-actions";

type SignupRoomOption = {
  accountSize: AccountSize;
  activeApplicantCount: number;
  entryFeeUsd: number;
  id: string;
  maxTraderCapacity: number;
  step: ChallengeStep;
  title: string;
};

type Viewer = {
  email: string;
  fullName: string;
} | null;

export function ApplyForm({ rooms, viewer }: { rooms: SignupRoomOption[]; viewer: Viewer }) {
  const [state, action] = useActionState(submitApplicantAction, defaultActionState);
  const hasRooms = rooms.length > 0;

  if (!viewer) {
    return (
      <Card className="rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-2xl tracking-[-0.03em] text-white">Sign in to join a room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-7 text-white/62">
            Traders need a Clerk account first. After you sign in, you can choose one of the open rooms, see the entry price,
            and submit your phone, email, and Telegram username.
          </p>
          <div className="flex flex-wrap gap-3">
            <SignInButton mode="modal">
              <button className={buttonVariants()}>Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className={cn(buttonVariants({ variant: "outline" }), "border-[#2dd0b1]/45 text-white")}>Create account</button>
            </SignUpButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeViewer = viewer;

  return (
    <Card className="rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl tracking-[-0.03em] text-white">Join a trader room</CardTitle>
        <p className="text-sm text-white/58">{activeViewer.email}</p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Choose room</label>
            <select
              name="roomId"
              className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-[#3daafe] focus:ring-3 focus:ring-[#0781fe]/25"
              defaultValue={hasRooms ? rooms[0].id : ""}
              disabled={!hasRooms}
            >
              {hasRooms ? (
                rooms.map((room) => (
                  <option key={room.id} value={room.id} className="bg-[#101114]">
                    {accountSizeLabels[room.accountSize]} | {room.title} | {formatUsd(room.entryFeeUsd)} | {room.activeApplicantCount}/
                    {room.maxTraderCapacity}
                  </option>
                ))
              ) : (
                <option value="" className="bg-[#101114]">
                  No open signup rooms right now
                </option>
              )}
            </select>
            {state.fieldErrors?.roomId ? <p className="text-xs text-rose-300">{state.fieldErrors.roomId[0]}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Full name</label>
              <Input name="fullName" defaultValue={activeViewer.fullName} placeholder="Your full name" />
              {state.fieldErrors?.fullName ? <p className="text-xs text-rose-300">{state.fieldErrors.fullName[0]}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Email</label>
              <Input name="email" type="email" defaultValue={activeViewer.email} placeholder="name@example.com" />
              {state.fieldErrors?.email ? <p className="text-xs text-rose-300">{state.fieldErrors.email[0]}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Phone</label>
              <Input name="phoneNumber" placeholder="+976..." />
              {state.fieldErrors?.phoneNumber ? <p className="text-xs text-rose-300">{state.fieldErrors.phoneNumber[0]}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Telegram username</label>
              <Input name="telegramUsername" placeholder="@username" />
              {state.fieldErrors?.telegramUsername ? <p className="text-xs text-rose-300">{state.fieldErrors.telegramUsername[0]}</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/60">
            After your signup is confirmed, you will wait in the room queue. When the room reaches 10 traders, we will email you to
            pay the entry fee and get ready to start.
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Extra note</label>
            <Textarea name="note" placeholder="Questions or anything the admin should know..." />
          </div>

          {state.message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                state.status === "success"
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                  : "border-rose-400/30 bg-rose-500/10 text-rose-100"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <SubmitButton className="w-full justify-center" disabled={!hasRooms}>
            Join room
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
