export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%),linear-gradient(135deg,#020617,#0a2340,#081226)]" />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-xs uppercase tracking-[0.35em] text-sky-100/55">FTMO админ</div>
          <h1 className="mt-3 text-3xl font-semibold text-white">TradeArena удирдлага</h1>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
