"use client";

import { useState } from "react";
import { FeaturedGames } from "./featured-games";
import { HeroSection } from "./hero-section";
import { HwQuickAccess } from "./hw-quick-access";
import { ReviewFeed } from "./review-feed";
import { TrendSidebar } from "./trend-sidebar";

export function GameTop() {
  const [, setSearchQuery] = useState("");

  return (
    <div className="min-h-full bg-[#f5f6f8]">
      <HeroSection onSearch={setSearchQuery} />
      <HwQuickAccess />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
          <main className="min-w-0">
            <FeaturedGames />
            <ReviewFeed />
          </main>
          <div className="hidden lg:block">
            <TrendSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
