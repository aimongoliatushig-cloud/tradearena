import type { Metadata } from "next";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";

import { bootScheduler } from "@/server/services/scheduler-bootstrap";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "tradearena.pro | FTMO Challenge Rooms",
  description: "FTMO challenge room-уудын public leaderboard болон admin удирдлагын платформ.",
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
        <ClerkProvider>
          <div className="flex min-h-screen flex-col">
            <header className="border-b border-white/10 bg-[#071019]/90 backdrop-blur">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <div className="text-xs uppercase tracking-[0.24em] text-white/40">{userId ? "Хэрэглэгч нэвтэрсэн" : "Нэвтрэх боломжтой"}</div>
                <div className="flex items-center gap-2">
                  <Show when="signed-out">
                    <SignInButton>
                      <button className="rounded-xl border border-white/12 px-4 py-2 text-sm text-white/75 transition hover:bg-white/5">
                        Нэвтрэх
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="rounded-xl border border-[#2dd0b1]/45 bg-[linear-gradient(135deg,#1cc6a4_0%,#149f88_100%)] px-4 py-2 text-sm font-semibold text-[#071210] transition hover:border-[#5ce0c6]/55">
                        Бүртгүүлэх
                      </button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </header>
            {children}
          </div>
          <Toaster theme="dark" richColors position="top-right" />
        </ClerkProvider>
      </body>
    </html>
  );
}
