import Image from "next/image";
import Link from "next/link";
import { BadgeInfo, BarChart3, BookOpen, ChevronDown, History, LayoutGrid, Newspaper, Package, UserRound } from "lucide-react";

const programSubmenuItems = [
  {
    href: "/program/ftmo",
    label: "FTMO хөтөлбөр",
    description: "FTMO-ийн албан ёсны тойм, шалгуур, өсөлтийн төлөвлөгөө",
  },
  {
    href: "/program/10-challenge",
    label: "10тын чэллэнж",
    description: "Манай дүрэм, багц, давуу тал, оролцох бүтэц",
  },
] as const;

const navItems = [
  { href: "/", label: "Нүүр", icon: LayoutGrid },
  { href: "/about", label: "Бидний тухай", icon: BadgeInfo },
  { href: "/packages", label: "Багцууд", icon: Package },
  { href: "/dashboard", label: "Самбар", icon: UserRound },
  { href: "/program", label: "Хөтөлбөр", icon: BookOpen, children: programSubmenuItems },
  { href: "/blog", label: "Блог", icon: Newspaper },
  { href: "/rooms", label: "Өрөөнүүд", icon: BarChart3 },
  { href: "/history", label: "Түүх", icon: History },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(24,199,162,0.12),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-[-12rem] w-[28rem] bg-[radial-gradient(circle,rgba(96,115,139,0.12),transparent_62%)] blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0b1015]/84 backdrop-blur-2xl">
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

          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-[rgba(18,24,32,0.9)] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            {navItems.map((item) => (
              item.children ? (
                <details key={item.href} className="group relative">
                  <summary className="inline-flex h-10 cursor-pointer list-none items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold tracking-[-0.01em] text-white/62 transition hover:bg-white/[0.05] hover:text-white [&::-webkit-details-marker]:hidden">
                    <item.icon className="size-4" />
                    {item.label}
                    <ChevronDown className="size-4 text-white/38 transition group-hover:text-white/70" />
                  </summary>

                  <div className="mt-2 w-full min-w-[260px] rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,24,32,0.98),rgba(11,16,22,0.94))] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.34)] lg:absolute lg:left-0 lg:top-full lg:mt-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-[1rem] px-4 py-3 transition hover:bg-white/[0.05]"
                      >
                        <div className="text-sm font-semibold text-white">{child.label}</div>
                        <div className="mt-1 text-xs leading-5 text-white/48">{child.description}</div>
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold tracking-[-0.01em] text-white/62 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            ))}

            <Link
              href="/admin/login"
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/8 bg-[#10161d] px-4 text-sm font-semibold tracking-[-0.01em] text-white transition hover:bg-white/[0.05]"
            >
              Админ
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-164px)] max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">{children}</main>

      <footer className="px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,32,0.94),rgba(12,16,22,0.9))] px-6 py-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">tradearena.pro</div>
            <div className="max-w-2xl text-sm text-white/50">FTMO room tracking, багцын эрх, сургалт, стратеги, хэрэгслийг нэг платформд нэгтгэнэ.</div>
          </div>
          <div className="text-xs uppercase tracking-[0.28em] text-white/32">Packages. Rooms. Progress.</div>
        </div>
      </footer>
    </div>
  );
}
