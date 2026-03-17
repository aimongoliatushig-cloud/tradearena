import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  bootScheduler();

  return (
    <html lang="mn" className={`${manrope.variable} dark`}>
      <body className="antialiased">
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
