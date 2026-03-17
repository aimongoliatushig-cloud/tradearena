import Image from "next/image";
import Link from "next/link";
import { BarChart3, History, LayoutGrid, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "НҮҮР", icon: LayoutGrid },
  { href: "/rooms", label: "ӨРӨӨНҮҮД", icon: BarChart3 },
  { href: "/history", label: "ТҮҮХ", icon: History },
  { href: "/apply", label: "БҮРТГҮҮЛЭХ", icon: Send },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(7,129,254,0.22),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[-12rem] w-[28rem] bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_62%)] blur-3xl" />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090b]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0">
            <Image
              src="/tradearena-logo.png"
              alt="tradearena.pro"
              width={928}
              height={269}
              priority
              className="h-auto w-[260px] max-w-full sm:w-[320px] lg:w-[360px]"
            />
          </Link>
          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] p-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                render={<Link href={item.href} />}
                className="h-10 rounded-full px-4 text-white/72 hover:bg-white/[0.06] hover:text-white"
              >
                <item.icon className="size-4" />
                {item.label}
              </Button>
            ))}
            <Button variant="outline" render={<Link href="/admin/login" />} className="rounded-full px-4">
              Админ
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto min-h-[calc(100vh-164px)] max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">{children}</main>
      <footer className="px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">tradearena.pro</div>
            <div className="max-w-2xl text-sm text-white/50">
              FTMO public MetriX snapshot-уудыг хадгалж, challenge room түүхийг нээлттэй үзүүлнэ.
            </div>
          </div>
          <div className="text-xs uppercase tracking-[0.28em] text-white/35">Live rankings. Historical results.</div>
        </div>
      </footer>
    </div>
  );
}
