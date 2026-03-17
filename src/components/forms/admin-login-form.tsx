"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultActionState } from "@/server/actions/action-state";
import { loginAdminAction } from "@/server/actions/admin-actions";

export function AdminLoginForm() {
  const [state, action] = useActionState(loginAdminAction, defaultActionState);

  return (
    <Card className="mx-auto w-full max-w-md border-white/10 bg-white/6 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Админ нэвтрэх</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Имэйл</label>
            <Input name="email" type="email" placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70">Нууц үг</label>
            <Input name="password" type="password" placeholder="••••••••" />
          </div>
          {state.message ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {state.message}
            </div>
          ) : null}
          <SubmitButton className="w-full justify-center">Нэвтрэх</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
