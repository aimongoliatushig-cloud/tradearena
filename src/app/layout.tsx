import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";

import { ClerkHeaderActions } from "@/components/shared/clerk-auth-controls";
import { bootScheduler } from "@/server/services/scheduler-bootstrap";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "tradearena.pro | Багц, сургалт, FTMO өрөөнүүд",
  description: "TradeArena багц, сургалт, нөөц, самбар болон FTMO өрөөний удирдлагын платформ.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  bootScheduler();

  return (
    <html lang="mn" className={`${manrope.variable} dark`}>
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-[#071019]/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="text-xs uppercase tracking-[0.24em] text-white/40">
                {userId ? "Гишүүн нэвтэрсэн" : "Нэвтрэх боломжтой"}
              </div>
              <ClerkHeaderActions isSignedIn={Boolean(userId)} />
            </div>
          </header>
          {children}
        </div>
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
