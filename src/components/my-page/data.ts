export type GameStatus = "全て" | "プレイ中" | "クリア済み" | "積みゲー" | "やめた";

export const TABS: GameStatus[] = [
  "全て",
  "プレイ中",
  "クリア済み",
  "積みゲー",
  "やめた",
];

export type Game = {
  id: string;
  title: string;
  cover: string;
  status: Exclude<GameStatus, "全て">;
  hours: number;
  platform: string;
  rating: number | null;
  href: string;
};

export type Review = {
  id: string;
  gameId: string;
  gameTitle: string;
  cover: string;
  rating: number;
  date: string;
  text: string;
  likes: number;
  comments: number;
  tags: string[];
  href: string;
};

export const STATUS_COLORS: Record<string, string> = {
  プレイ中: "bg-emerald-100 text-emerald-700",
  クリア済み: "bg-violet-100 text-violet-700",
  積みゲー: "bg-amber-100 text-amber-700",
  やめた: "bg-gray-100 text-gray-500",
};

export const PLATFORM_COLORS: Record<string, string> = {
  Switch: "bg-red-50 text-red-600",
  Switch2: "bg-red-50 text-red-600",
  スマホ: "bg-sky-50 text-sky-600",
  iOS: "bg-sky-50 text-sky-600",
  Android: "bg-sky-50 text-sky-600",
  Steam: "bg-indigo-50 text-indigo-600",
  PS5: "bg-blue-50 text-blue-600",
  Xbox: "bg-green-50 text-green-700",
};
