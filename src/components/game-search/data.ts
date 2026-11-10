export const PLATFORMS = [
  "Switch",
  "Switch2",
  "iOS",
  "Android",
  "Steam",
  "PS5",
  "Xbox",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const GENRES = [
  "アクション",
  "アドベンチャー",
  "シューティング",
  "ロールプレイング",
  "シミュレーション",
  "スポーツ",
  "格闘",
  "レース",
  "音楽ゲーム",
  "パズル",
  "テーブルゲーム",
  "パーティー",
  "コミュニケーション",
  "学習・教育",
  "トレーニング",
  "ツール",
] as const;

export type Genre = (typeof GENRES)[number];
export type SortKey = "popular" | "newest" | "rating" | "playtime_asc" | "f2p";
export type ViewMode = "grid" | "list";
export type GachaFilter = "all" | "gacha" | "nogacha";

export type SearchGame = {
  id: string | number;
  title: string;
  developer: string;
  genre: Genre;
  platforms: Array<Platform | string>;
  rating: number;
  ratingCount: number;
  avgPlaytime: number;
  releaseYear: number;
  price: number;
  isFree: boolean;
  hasGacha: boolean;
  f2pScore: number;
  volumeScore: number;
  img: string;
  tags: string[];
  popular: boolean;
};

export type SearchFilters = {
  platforms: Platform[];
  genres: Genre[];
  minRating: number;
  minF2P: number;
  freeOnly: boolean;
  hasGachaFilter: GachaFilter;
  maxPlaytime: number;
};

export const DEFAULT_FILTERS: SearchFilters = {
  platforms: [],
  genres: [],
  minRating: 0,
  minF2P: 0,
  freeOnly: false,
  hasGachaFilter: "all",
  maxPlaytime: 1000,
};

export const HW_SEARCH_HREF: Record<string, string> = {
  switch: "/games?platform=Switch",
  switch2: "/games?platform=Switch2",
  ios: "/games?platform=iOS",
  android: "/games?platform=Android",
  steam: "/games?platform=Steam",
  ps5: "/games?platform=PS5",
  xbox: "/games?platform=Xbox",
  gacha: "/games?gacha=gacha",
};

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "人気順" },
  { value: "newest", label: "新着順" },
  { value: "rating", label: "評価順" },
  { value: "f2p", label: "無課金遊びやすさ順" },
  { value: "playtime_asc", label: "プレイ時間（短い順）" },
];

export const PLATFORM_BADGE: Record<
  Platform,
  { color: string; bg: string; border: string; label: string }
> = {
  Switch: {
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    label: "Switch",
  },
  Switch2: {
    color: "#B91C1C",
    bg: "#FFF1F1",
    border: "#FCA5A5",
    label: "Switch 2",
  },
  iOS: { color: "#374151", bg: "#F3F4F6", border: "#D1D5DB", label: "iOS" },
  Android: {
    color: "#15803D",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    label: "Android",
  },
  Steam: { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", label: "Steam" },
  PS5: { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE", label: "PS5" },
  Xbox: { color: "#047857", bg: "#ECFDF5", border: "#A7F3D0", label: "Xbox" },
};

export function parsePlatforms(value?: string): Platform[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => (item.trim() === "PC" ? "Steam" : item.trim()))
    .filter((item): item is Platform =>
      (PLATFORMS as readonly string[]).includes(item),
    );
}

export function parseGacha(value?: string): GachaFilter {
  if (value === "gacha" || value === "nogacha") return value;
  return "all";
}
