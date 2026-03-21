import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";
import { AboutPageContent } from "@/components/shared/about-page-content";

export const metadata: Metadata = {
  title: "tradearena.pro | Бидний тухай",
  description: "TraderArena-ийн түүх, итгэл үнэмшил, баг болон Монгол трейдерүүдэд зориулсан сургалт, бэлтгэлийн орчны тухай.",
};

export default function AboutPage() {
  return (
    <PublicShell>
      <AboutPageContent />
    </PublicShell>
  );
}
