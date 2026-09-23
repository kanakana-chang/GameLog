export type Platform = "Switch" | "iOS" | "Android" | "Steam" | "PS5" | "Xbox";
export type Genre =
  | "Action"
  | "RPG"
  | "Puzzle"
  | "Strategy"
  | "Simulation"
  | "Sports"
  | "Gacha"
  | "Survival";
export type ReportStatus = "open" | "hidden" | "dismissed";
export type ReportReason =
  | "inappropriate"
  | "spam"
  | "spoiler"
  | "false_info"
  | "other";
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
  coverUrl: string;
  status: "active" | "archived";
  addedAt: string;
};

export type AdminReport = {
  id: string;
  targetType: "review" | "comment";
  targetContent: string;
  gameTitle: string;
  reporter: string;
  reason: ReportReason;
  reportedAt: string;
  status: ReportStatus;
};

export const ADMIN_PLATFORMS: Platform[] = [
  "Switch",
  "iOS",
  "Android",
  "Steam",
  "PS5",
  "Xbox",
];

export const ADMIN_GENRES: Genre[] = [
  "Action",
  "RPG",
  "Puzzle",
  "Strategy",
  "Simulation",
  "Sports",
  "Gacha",
  "Survival",
];

export const INITIAL_GAMES: AdminGame[] = [
  {
    id: "g001",
    title: "スプラトゥーン3",
    platform: ["Switch"],
    genre: "Action",
    releaseYear: 2022,
    developer: "Nintendo",
    freeToPlay: false,
    hasCurrency: true,
    avgPlaytime: 120,
    coverUrl: "/games/splatoon3.jpg",
    status: "active",
    addedAt: "2024-01-15",
  },
  {
    id: "g002",
    title: "原神",
    platform: ["iOS", "Android", "Switch"],
    genre: "Gacha",
    releaseYear: 2020,
    developer: "miHoYo",
    freeToPlay: true,
    hasCurrency: true,
    avgPlaytime: 200,
    coverUrl: "/games/genshin.jpg",
    status: "active",
    addedAt: "2024-01-16",
  },
  {
    id: "g003",
    title: "ゼルダの伝説 ティアーズ オブ ザ キングダム",
    platform: ["Switch"],
    genre: "Action",
    releaseYear: 2023,
    developer: "Nintendo",
    freeToPlay: false,
    hasCurrency: false,
    avgPlaytime: 80,
    coverUrl: "/games/zelda-echoes.jpg",
    status: "active",
    addedAt: "2024-01-17",
  },
  {
    id: "g004",
    title: "モンスターストライク",
    platform: ["iOS", "Android"],
    genre: "Gacha",
    releaseYear: 2013,
    developer: "mixi",
    freeToPlay: true,
    hasCurrency: true,
    avgPlaytime: 300,
    coverUrl: "/games/monst.jpg",
    status: "active",
    addedAt: "2024-01-18",
  },
  {
    id: "g005",
    title: "Minecraft",
    platform: ["Switch", "iOS", "Android"],
    genre: "Simulation",
    releaseYear: 2011,
    developer: "Mojang",
    freeToPlay: false,
    hasCurrency: false,
    avgPlaytime: 500,
    coverUrl: "/games/minecraft.jpg",
    status: "active",
    addedAt: "2024-01-19",
  },
  {
    id: "g006",
    title: "Among Us",
    platform: ["iOS", "Android", "Switch"],
    genre: "Strategy",
    releaseYear: 2018,
    developer: "Innersloth",
    freeToPlay: true,
    hasCurrency: false,
    avgPlaytime: 40,
    coverUrl: "/admin/among-us.jpg",
    status: "active",
    addedAt: "2024-01-20",
  },
  {
    id: "g007",
    title: "ポケモンGO",
    platform: ["iOS", "Android"],
    genre: "Action",
    releaseYear: 2016,
    developer: "Niantic",
    freeToPlay: true,
    hasCurrency: true,
    avgPlaytime: 250,
    coverUrl: "/games/pokemon-go.jpg",
    status: "active",
    addedAt: "2024-01-21",
  },
  {
    id: "g008",
    title: "あつまれ どうぶつの森",
    platform: ["Switch"],
    genre: "Simulation",
    releaseYear: 2020,
    developer: "Nintendo",
    freeToPlay: false,
    hasCurrency: false,
    avgPlaytime: 150,
    coverUrl: "/games/animal-crossing.jpg",
    status: "active",
    addedAt: "2024-01-22",
  },
  {
    id: "g009",
    title: "崩壊：スターレイル",
    platform: ["iOS", "Android"],
    genre: "Gacha",
    releaseYear: 2023,
    developer: "miHoYo",
    freeToPlay: true,
    hasCurrency: true,
    avgPlaytime: 180,
    coverUrl: "/admin/star-rail.jpg",
    status: "active",
    addedAt: "2024-02-01",
  },
  {
    id: "g010",
    title: "パルワールド",
    platform: ["Switch", "Steam", "Xbox"],
    genre: "Survival",
    releaseYear: 2024,
    developer: "Pocket Pair",
    freeToPlay: false,
    hasCurrency: false,
    avgPlaytime: 60,
    coverUrl: "/admin/palworld.jpg",
    status: "active",
    addedAt: "2024-02-05",
  },
];

export const INITIAL_REPORTS: AdminReport[] = [
  {
    id: "rep001",
    targetType: "review",
    targetContent: "このゲームは最悪。開発者は犯罪者。絶対やるな！！！",
    gameTitle: "原神",
    reporter: "user_watcher01",
    reason: "inappropriate",
    reportedAt: "2024-06-10T14:23:00",
    status: "open",
  },
  {
    id: "rep002",
    targetType: "comment",
    targetContent: "第3章のボスはXXXXで、最後にYYYYが死ぬ。感動した。",
    gameTitle: "ゼルダの伝説 ティアーズ オブ ザ キングダム",
    reporter: "user_zelda_fan",
    reason: "spoiler",
    reportedAt: "2024-06-10T16:05:00",
    status: "open",
  },
  {
    id: "rep003",
    targetType: "review",
    targetContent:
      "課金しないと絶対に勝てない。ガチャ確率も嘘。サービス終了間近。",
    gameTitle: "モンスターストライク",
    reporter: "user_gacha_hate",
    reason: "false_info",
    reportedAt: "2024-06-11T09:12:00",
    status: "open",
  },
  {
    id: "rep004",
    targetType: "comment",
    targetContent:
      "フォロワー1000人突破記念！プレゼント企画やります→[リンク]",
    gameTitle: "スプラトゥーン3",
    reporter: "user_clean01",
    reason: "spam",
    reportedAt: "2024-06-11T11:44:00",
    status: "hidden",
  },
  {
    id: "rep005",
    targetType: "review",
    targetContent: "操作が難しすぎる。小学生には向かない。",
    gameTitle: "Minecraft",
    reporter: "user_parent99",
    reason: "other",
    reportedAt: "2024-06-12T08:30:00",
    status: "dismissed",
  },
];

export const REASON_LABELS: Record<ReportReason, string> = {
  inappropriate: "不適切な内容",
  spam: "スパム",
  spoiler: "ネタバレ",
  false_info: "虚偽情報",
  other: "その他",
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
  iOS: "border-sky-100 bg-sky-50 text-sky-600",
  Android: "border-green-100 bg-green-50 text-green-600",
  Steam: "border-indigo-100 bg-indigo-50 text-indigo-600",
  PS5: "border-blue-100 bg-blue-50 text-blue-700",
  Xbox: "border-emerald-100 bg-emerald-50 text-emerald-700",
};

export const REASON_COLORS: Record<ReportReason, string> = {
  inappropriate: "border-red-100 bg-red-50 text-red-600",
  spam: "border-orange-100 bg-orange-50 text-orange-600",
  spoiler: "border-yellow-100 bg-yellow-50 text-yellow-700",
  false_info: "border-purple-100 bg-purple-50 text-purple-600",
  other: "border-slate-100 bg-slate-50 text-slate-500",
};
