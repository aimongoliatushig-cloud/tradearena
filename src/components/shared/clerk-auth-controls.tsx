import Link from "next/link";

import { ClerkSignOutButton } from "@/components/shared/clerk-sign-out-button";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

type HeaderViewer = {
  email?: string | null;
  imageUrl?: string | null;
  name?: string | null;
};

function buildAuthHref(path: string, returnBackUrl?: string) {
  if (!returnBackUrl) {
    return path;
  }

  const params = new URLSearchParams({ redirect_url: returnBackUrl });
  return `${path}?${params.toString()}`;
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "Хэрэглэгч";
  const parts = source
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function ClerkHeaderActions({
  dashboardHref = "/dashboard",
  viewer,
}: {
  dashboardHref?: string;
  viewer?: HeaderViewer | null;
}) {
  if (viewer) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={dashboardHref}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2dd0b1]/35 bg-[linear-gradient(135deg,#1cc6a4_0%,#149f88_100%)] px-4 text-sm font-semibold text-[#071210] transition hover:border-[#5ce0c6]/55"
        >
          Хяналтын самбар
        </Link>

        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-left text-white/85 transition hover:bg-white/[0.07]"
        >
          {viewer.imageUrl ? (
            <div
              aria-label={viewer.name ?? viewer.email ?? "Хэрэглэгч"}
              className="size-9 rounded-full bg-cover bg-center"
              style={{ backgroundImage: `url("${viewer.imageUrl}")` }}
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-[#18c7a2]/18 text-xs font-semibold text-[#bff7ea]">
              {getInitials(viewer.name, viewer.email)}
            </div>
          )}
          <div className="hidden min-w-0 sm:block">
            <div className="truncate text-sm font-semibold text-white">{viewer.name ?? "Хэрэглэгч"}</div>
            <div className="truncate text-xs text-white/45">{viewer.email ?? "Бүртгэлтэй хэрэглэгч"}</div>
          </div>
        </Link>

        <ClerkSignOutButton>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/12 px-4 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white"
          >
            Гарах
          </button>
        </ClerkSignOutButton>
      </div>
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
