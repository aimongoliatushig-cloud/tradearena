import { redirect } from "next/navigation";

import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  await requireAdminUser({
    requestPath: "/admin",
  });

  redirect("/admin");
}
