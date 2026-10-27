"use client";

import { useState } from "react";
import type { SearchGame } from "@/components/game-search/data";
import { FeaturedGames } from "./featured-games";
import { HeroSection } from "./hero-section";
import { HwQuickAccess } from "./hw-quick-access";
//import { ReviewFeed } from "./review-feed";
//import { TrendSidebar } from "./trend-sidebar";

export function GameTop({ latestGames }: { latestGames: SearchGame[] }) {
  const [, setSearchQuery] = useState("");

  return (
    <div className="min-h-full overflow-x-hidden bg-[#f5f6f8]">
      <HeroSection onSearch={setSearchQuery} />
      <HwQuickAccess />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <main className="min-w-0">
          <FeaturedGames games={latestGames} />
          {/* <ReviewFeed /> */}
        </main>
      </div>
    </div>
  );
}
