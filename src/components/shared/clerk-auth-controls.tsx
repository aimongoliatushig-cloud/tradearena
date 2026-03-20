"use client";

import Link from "next/link";

import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

function buildAuthHref(path: string, returnBackUrl?: string) {
  if (!returnBackUrl) {
    return path;
  }

  const params = new URLSearchParams({ redirect_url: returnBackUrl });
  return `${path}?${params.toString()}`;
}

export function ClerkHeaderActions({
  dashboardHref = "/dashboard",
  isSignedIn,
}: {
  dashboardHref?: string;
  isSignedIn: boolean;
}) {
  if (isSignedIn) {
    return (
      <Link
        href={dashboardHref}
        className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2dd0b1]/35 bg-[linear-gradient(135deg,#1cc6a4_0%,#149f88_100%)] px-4 text-sm font-semibold text-[#071210] transition hover:border-[#5ce0c6]/55"
      >
        Хяналтын самбар
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={buildAuthHref("/sign-in", "/dashboard")}
        className="rounded-xl border border-white/12 px-4 py-2 text-sm text-white/75 transition hover:bg-white/5"
      >
        Нэвтрэх
      </Link>
      <Link
        href={buildAuthHref("/sign-up", "/dashboard")}
        className="rounded-xl border border-[#2dd0b1]/45 bg-[linear-gradient(135deg,#1cc6a4_0%,#149f88_100%)] px-4 py-2 text-sm font-semibold text-[#071210] transition hover:border-[#5ce0c6]/55"
      >
        Бүртгүүлэх
      </Link>
    </div>
  );
}

export function ClerkPromptActions({
  containerClassName,
  returnBackUrl,
  signInClassName,
  signInLabel = "Нэвтрэх",
  signUpClassName,
  signUpLabel = "Бүртгүүлэх",
}: {
  containerClassName?: string;
  returnBackUrl?: string;
  signInClassName?: string;
  signInLabel?: string;
  signUpClassName?: string;
  signUpLabel?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", containerClassName)}>
      <Link href={buildAuthHref("/sign-in", returnBackUrl)} className={signInClassName ?? buttonVariants()}>
        {signInLabel}
      </Link>
      <Link
        href={buildAuthHref("/sign-up", returnBackUrl)}
        className={signUpClassName ?? buttonVariants({ variant: "outline" })}
      >
        {signUpLabel}
      </Link>
    </div>
  );
}
