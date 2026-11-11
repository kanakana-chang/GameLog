export type Platform =
  | "Switch"
  | "Switch2"
  | "iOS"
  | "Android"
  | "Steam"
  | "PS5"
  | "Xbox"
  | (string & {});
export type Genre =
  | "アクション"
  | "アドベンチャー"
  | "シューティング"
  | "ロールプレイング"
  | "シミュレーション"
  | "スポーツ"
  | "格闘"
  | "レース"
  | "音楽ゲーム"
  | "パズル"
  | "テーブルゲーム"
  | "パーティー"
  | "コミュニケーション"
  | "学習・教育"
  | "トレーニング"
  | "ツール"
  | (string & {});
export type ReportStatus = "open" | "hidden" | "dismissed";
export type ReportReason = "harassment" | "spam" | "spoiler" | "other";
export type AdminNav = "games" | "reports";

export type AdminGame = {
  id: string;
  title: string;
  platform: Platform[];
  genre: Genre;
  releaseYear: number;
  developer: string;
  freeToPlay: boolean;
  hasCurrency: boolean;
  avgPlaytime: number;
  storedAvgPlaytime: number;
  f2pScore: number;
  coverUrl: string;
  status: "active" | "archived";
  addedAt: string;
};

export type AdminReport = {
  id: string;
  targetType: "review" | "topic" | "post";
  targetId: string;
  targetContent: string;
  gameTitle: string;
  reporter: string;
  reason: ReportReason;
  reportedAt: string;
  status: ReportStatus;
  comment?: string;
};

export const ADMIN_PLATFORMS: Platform[] = [
  "Switch",
  "Switch2",
  "iOS",
  "Android",
  "Steam",
  "PS5",
  "Xbox",
];

export const ADMIN_GENRES: Genre[] = [
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
];

export const REASON_LABELS: Record<ReportReason, string> = {
  harassment: "誹謗中傷",
  spam: "スパム",
  spoiler: "ネタバレ",
  other: "その他",
};

export const TARGET_TYPE_LABELS: Record<AdminReport["targetType"], string> = {
  review: "レビュー",
  topic: "トピック",
  post: "レス",
};

export const STATUS_COLORS: Record<string, string> = {
  open: "border-red-200 bg-red-50 text-red-700",
  hidden: "border-slate-200 bg-slate-100 text-slate-500",
  dismissed: "border-slate-100 bg-slate-50 text-slate-400",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-slate-200 bg-slate-100 text-slate-500",
};

export const STATUS_LABELS: Record<string, string> = {
  open: "未対応",
  hidden: "非表示",
  dismissed: "却下",
  active: "公開中",
  archived: "非公開",
};

export const PLATFORM_COLORS: Record<string, string> = {
  Switch: "border-red-100 bg-red-50 text-red-600",
  Switch2: "border-red-100 bg-red-50 text-red-600",
  iOS: "border-sky-100 bg-sky-50 text-sky-600",
  Android: "border-green-100 bg-green-50 text-green-600",
  Steam: "border-indigo-100 bg-indigo-50 text-indigo-600",
  PC: "border-indigo-100 bg-indigo-50 text-indigo-600",
  PS5: "border-blue-100 bg-blue-50 text-blue-700",
  Xbox: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

export const REASON_COLORS: Record<ReportReason, string> = {
  harassment: "border-red-100 bg-red-50 text-red-600",
  spam: "border-orange-100 bg-orange-50 text-orange-600",
  spoiler: "border-yellow-100 bg-yellow-50 text-yellow-700",
  other: "border-slate-100 bg-slate-50 text-slate-500",
};
