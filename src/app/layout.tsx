import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_JP, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "GameLog",
  description: "ゲームのプレイ記録とレビューを残すマイページ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${outfit.variable} ${inter.variable} ${notoSansJp.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-page font-mypage text-ink">{children}</body>
    </html>
  );
}
