import Link from "next/link";
import { BarChart3, DatabaseZap, LayoutDashboard, ListChecks, LogOut, Settings, Users } from "lucide-react";
import type { AdminUser } from "@prisma/client";

import { logoutAdminAction } from "@/server/actions/admin-actions";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Хянах самбар", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Өрөөнүүд", icon: BarChart3 },
  { href: "/admin/applicants", label: "Өргөдөл", icon: Users },
  { href: "/admin/traders", label: "Трейдерүүд", icon: DatabaseZap },
  { href: "/admin/logs", label: "Логууд", icon: ListChecks },
  { href: "/admin/settings", label: "Тохиргоо", icon: Settings },
];

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-r border-white/10 bg-slate-950/80 p-6 backdrop-blur-xl">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-sky-200/55">Админ төв</div>
          <div className="mt-2 text-xl font-semibold text-white">FTMO Rooms Ops</div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/65">
            <div className="font-medium text-white">{user.name}</div>
            <div>{user.email}</div>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {links.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              render={<Link href={item.href} />}
              className="w-full justify-start text-white/80 hover:text-white"
            >
              <item.icon className="size-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        <form action={logoutAdminAction} className="mt-8">
          <Button type="submit" variant="outline" className="w-full justify-start">
            <LogOut className="size-4" />
            Гарах
          </Button>
        </form>
      </aside>
      <div className="min-w-0">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
