import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Inter,
  JetBrains_Mono,
  Noto_Sans_JP,
  Outfit,
  Rajdhani,
} from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GameLog",
  description: "無課金での遊びやすさ・プレイボリューム・実際の口コミで、あなたにぴったりのゲームが見つかる",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${outfit.variable} ${inter.variable} ${notoSansJp.variable} ${jetbrainsMono.variable} ${rajdhani.variable} ${barlowCondensed.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full min-h-full bg-page font-mypage text-ink" suppressHydrationWarning>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
