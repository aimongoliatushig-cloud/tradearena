"use client";

import type { ReactNode } from "react";
import { SignOutButton } from "@clerk/nextjs";

export function ClerkSignOutButton({
  children,
  redirectUrl = "/packages",
}: {
  children: ReactNode;
  redirectUrl?: string;
}) {
  return <SignOutButton redirectUrl={redirectUrl}>{children}</SignOutButton>;
}
