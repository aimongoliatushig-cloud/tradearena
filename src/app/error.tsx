"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

function isDatabaseCredentialError(error: Error) {
  const message = error.message.toLowerCase();

  return (
    message.includes("p1000") ||
    message.includes("authentication failed against the database server") ||
    message.includes("database credentials") ||
    message.includes("provided database credentials")
  );
}

function isDatabaseConnectionError(error: Error) {
  const message = error.message.toLowerCase();

  return (
    isDatabaseCredentialError(error) ||
    message.includes("p1001") ||
    message.includes("can't reach database server") ||
    message.includes("cannot reach database server")
  );
}

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbError = isDatabaseConnectionError(error);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_28%),linear-gradient(135deg,#020617,#0a2340,#081226)]" />

      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/75 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-3 text-amber-200">
            <AlertTriangle className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-white">
              {isDbError ? "Өгөгдлийн сантай холбогдож чадсангүй" : "Системийн алдаа гарлаа"}
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/65">
              {isDbError
                ? "PostgreSQL тохиргоо буруу эсвэл database server рүү нэвтрэх мэдээлэл алдаатай байна."
                : "Хуудас ачаалах үед алдаа гарлаа. Доорх мэдээллийг шалгаад дахин оролдоно уу."}
            </p>
          </div>
        </div>

        {isDbError ? (
          <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-medium text-white">Засах алхмууд</div>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-white/70">
              <li>
                [`.env`](/D:/ftmostats/.env) доторх `DATABASE_URL`-ийг бодит PostgreSQL user/password-аар солино.
              </li>
              <li>Таны машин дээр PostgreSQL 17 нь `5432` port дээр ажиллаж байна. Бусад instance-ууд: `5434`, `5435`, `5436`.</li>
              <li>Хэрэв database үүсгээгүй бол `ftmo_challenge_rooms` database үүсгэнэ.</li>
              <li>`npm run db:migrate` ажиллуулна.</li>
              <li>`npm run db:seed` ажиллуулна.</li>
              <li>`npm run dev`-ээ restart хийнэ.</li>
            </ol>
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-xs text-sky-100/80">
              DATABASE_URL=&quot;postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/ftmo_challenge_rooms?schema=public&quot;
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
            <div className="font-medium text-white">Алдааны мессеж</div>
            <div className="mt-3 break-words font-mono text-xs text-sky-100/80">{error.message}</div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={reset}>
            <RefreshCcw className="size-4" />
            Дахин оролдох
          </Button>
          <Button variant="secondary" render={<Link href="/" />}>
            Нүүр хуудас руу
          </Button>
          <Button variant="outline" render={<Link href="/admin/login" />}>
            Админ хэсэг
          </Button>
        </div>
      </div>
    </div>
  );
}
