import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
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
  return (
    <html lang="mn" className="dark">
      <body
        className={`${nunito.variable} antialiased`}
      >
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </body>
    </html>
  );
}
