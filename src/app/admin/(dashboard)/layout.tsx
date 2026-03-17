export const dynamic = "force-dynamic";

import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  return <AdminShell user={user}>{children}</AdminShell>;
}
