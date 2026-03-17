"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACCOUNT_SIZE_OPTIONS } from "@/lib/constants";
import { accountSizeLabels } from "@/lib/labels";
import { defaultActionState } from "@/server/actions/action-state";
import { submitApplicantAction } from "@/server/actions/public-actions";

export function ApplyForm() {
  const [state, action] = useActionState(submitApplicantAction, defaultActionState);

  return (
    <Card className="rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl tracking-[-0.03em] text-white">Өргөдөл илгээх</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Овог нэр</label>
              <Input name="fullName" placeholder="Жишээ: Б. Тэмүүлэн" />
              {state.fieldErrors?.fullName ? <p className="text-xs text-rose-300">{state.fieldErrors.fullName[0]}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Имэйл</label>
              <Input name="email" type="email" placeholder="name@example.com" />
              {state.fieldErrors?.email ? <p className="text-xs text-rose-300">{state.fieldErrors.email[0]}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Утас</label>
              <Input name="phoneNumber" placeholder="+976..." />
              {state.fieldErrors?.phoneNumber ? <p className="text-xs text-rose-300">{state.fieldErrors.phoneNumber[0]}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Telegram username</label>
              <Input name="telegramUsername" placeholder="@username" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Хүсэж буй account size</label>
            <select
              name="desiredAccountSize"
              className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-[#3daafe] focus:ring-3 focus:ring-[#0781fe]/25"
              defaultValue={ACCOUNT_SIZE_OPTIONS[0]}
            >
              {ACCOUNT_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size} className="bg-[#101114]">
                  {accountSizeLabels[size]}
                </option>
              ))}
            </select>
            {state.fieldErrors?.desiredAccountSize ? (
              <p className="text-xs text-rose-300">{state.fieldErrors.desiredAccountSize[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/52">Нэмэлт тайлбар</label>
            <Textarea name="note" placeholder="Өмнөх туршлага, асуулт, эсвэл нэмэлт мэдээлэл..." />
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

          <SubmitButton className="w-full justify-center">Өргөдөл илгээх</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
