import type { SearchGame } from "@/components/game-search/data";
import type { GeneratedGameDetails } from "@/lib/game-details";

export const STATUSES = [
  { key: "playing", label: "プレイ中", icon: "▶", color: "#10b981", bg: "#d1fae5" },
  { key: "completed", label: "クリア済み", icon: "✓", color: "#ff6b35", bg: "#fff3ee" },
  { key: "want", label: "気になる", icon: "★", color: "#f59e0b", bg: "#fef3c7" },
  { key: "dropped", label: "やめた", icon: "✕", color: "#ef4444", bg: "#fee2e2" },
] as const;

export const REPORT_REASONS = [
  { key: "harassment", label: "誹謗中傷・攻撃的な表現" },
  { key: "spoiler", label: "ネタバレ未設定のネタバレ投稿" },
  { key: "spam", label: "スパム・宣伝行為" },
  { key: "other", label: "その他（不適切な画像・公序良俗違反等）" },
];

export const POST_TAGS = [
  "無課金",
  "課金情報",
  "攻略",
  "ボス",
  "スポット",
  "マルチ",
  "アップデート",
  "考察",
  "バグ報告",
  "雑談",
];

export type Kink = "無課金" | "微課金" | "重課金";

export type Review = {
  id: string | number;
  user: string;
  username?: string;
  accountId?: string;
  avatarSrc?: string;
  av: string;
  avBg: string;
  avC: string;
  platform: string;
  score: number;
  playTime: number;
  date: string;
  f2p: boolean;
  kink: Kink;
  title: string;
  body: string;
  spoilerBody: string;
  helpful: number;
  likedByMe?: boolean;
  tags: string[];
};

export type Post = {
  id: string | number;
  user: string;
  username?: string;
  accountId?: string;
  avatarSrc?: string;
  av: string;
  avBg: string;
  avC: string;
  date: string;
  title: string;
  body: string;
  replies: number;
  views: number;
  tags: string[];
};

export type GameDetailData = {
  id: string | number;
  title: string;
  developer: string;
  genre: string[];
  platforms: string[];
  releaseDate: string;
  jacket: string;
  coverWide: string;
  avgPlayTime: number;
  totalReviews: number;
  avgScore: number;
  reviews: Review[];
  posts: Post[];
  summary?: string;
  detailsGenerated?: boolean;
  sources?: { title: string; url: string }[];
  myRecord: {
    playTime: number;
  };
  userStatus?: string | null;
};

export function toGameDetail(game: SearchGame): GameDetailData {
  return {
    id: game.id,
    title: game.title,
    developer: game.developer,
    genre: [game.genre],
    platforms: game.platforms,
    releaseDate:
      Number.isInteger(game.releaseYear) && game.releaseYear > 0
        ? `${game.releaseYear}年`
        : "—",
    jacket: game.img,
    coverWide: game.img,
    avgPlayTime: game.avgPlaytime,
    totalReviews: game.ratingCount,
    avgScore: game.rating,
    reviews: [],
    posts: [],
    myRecord: {
      playTime: 0,
    },
  };
}

export function applyGeneratedDetails(
  detail: GameDetailData,
  generated: GeneratedGameDetails,
): GameDetailData {
  return {
    ...detail,
    summary: generated.summary,
    detailsGenerated: true,
    sources: generated.sources,
  };
}
