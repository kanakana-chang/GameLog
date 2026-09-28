import { SEARCH_GAMES, type SearchGame } from "@/components/game-search/data";
import type { GeneratedGameDetails } from "@/lib/game-details";

export const STATUSES = [
  { key: "playing", label: "プレイ中", icon: "▶", color: "#10b981", bg: "#d1fae5" },
  { key: "completed", label: "クリア済み", icon: "✓", color: "#ff6b35", bg: "#fff3ee" },
  { key: "want", label: "気になる", icon: "★", color: "#f59e0b", bg: "#fef3c7" },
  { key: "dropped", label: "やめた", icon: "✕", color: "#ef4444", bg: "#fee2e2" },
] as const;

export const SCORE_DIST = [
  { label: "10", count: 432 },
  { label: "8-9", count: 1240 },
  { label: "6-7", count: 890 },
  { label: "4-5", count: 502 },
  { label: "1-3", count: 177 },
];

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

export type GameAxis = {
  key: string;
  label: string;
  value: number;
};

export type Review = {
  id: number;
  user: string;
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
  tags: string[];
};

export type Post = {
  id: number;
  user: string;
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

export type Achievement = {
  label: string;
  date: string;
  icon: string;
};

export type GameDetailData = {
  id: string | number;
  title: string;
  developer: string;
  genre: string[];
  platforms: string[];
  releaseDate: string;
  priceLabel: string;
  ageRating: string;
  monetization: { type: string; monthly: string; ceiling: string };
  jacket: string;
  coverWide: string;
  avgPlayTime: number;
  totalReviews: number;
  avgScore: number;
  f2pScore: number;
  axes: GameAxis[];
  screenshots: string[];
  reviews: Review[];
  posts: Post[];
  summary?: string;
  detailsGenerated?: boolean;
  myRecord: {
    playTime: number;
    sessions: number;
    screenshotCount: number;
    achievements: Achievement[];
  };
  scoreDist: { label: string; count: number }[];
};

const C = {
  accent: "#ff6b35",
  accentBg: "#fff3ee",
  green: "#10b981",
  greenBg: "#d1fae5",
  yellow: "#f59e0b",
  yellowBg: "#fef3c7",
  blue: "#3b82f6",
  blueBg: "#dbeafe",
  purple: "#8b5cf6",
  purpleBg: "#ede9fe",
};

const MH_NOW_REVIEWS: Review[] = [
  {
    id: 1,
    user: "sora_hunter22",
    av: "S",
    avBg: C.accentBg,
    avC: C.accent,
    platform: "iOS",
    score: 9.0,
    playTime: 420,
    date: "2024-11-10",
    f2p: true,
    kink: "無課金",
    title: "無課金でも十分楽しめる！外出のモチベになる",
    body: "散歩しながらモンスターを狩る体験が新鮮で、毎日の外出が楽しくなりました。ガチャがない分、無課金でもストレスなく遊べます。マルチプレイで近くのハンターと協力できるのも良い。課金要素は主にスタミナ回復系で、ゆっくり遊ぶなら無課金で十分です。",
    spoilerBody:
      "HR50を超えるとリオレウスやディアブロスが出てきて一気にやりごたえが増す。特にリオレウスは位置情報ゲームの中でも最高クラスの体験だった。",
    helpful: 312,
    tags: ["無課金OK", "外出モチベ", "マルチ"],
  },
  {
    id: 2,
    user: "gacha_free_life",
    av: "G",
    avBg: C.greenBg,
    avC: C.green,
    platform: "Android",
    score: 7.5,
    playTime: 200,
    date: "2024-10-22",
    f2p: true,
    kink: "無課金",
    title: "課金圧は低め。ただスタミナ上限が気になる",
    body: "基本無料で長く遊べる設計は好評価。ただしスタミナ上限が低く、1日にできる狩猟数に限りがある点はフラストレーション。月額パスを入れると快適さが大きく変わるのでそこだけ惜しい。",
    spoilerBody: "",
    helpful: 187,
    tags: ["スタミナ制", "課金圧低"],
  },
  {
    id: 3,
    user: "switch_gamer_mn",
    av: "M",
    avBg: C.purpleBg,
    avC: C.purple,
    platform: "iOS",
    score: 8.5,
    playTime: 550,
    date: "2024-09-30",
    f2p: false,
    kink: "微課金",
    title: "月額パスだけ課金で快適な体験に",
    body: "月額1,080円のパスを契約したらスタミナ問題がほぼ解消されました。ハンターランクを上げていくたびに新しい武器種や装備が手に入り、コレクション欲を刺激される。",
    spoilerBody:
      "HR50以降のコンテンツが特に充実している。装備の見た目もシリーズファンには嬉しいデザインが多い。",
    helpful: 245,
    tags: ["月額パス", "コレクション", "長期プレイ"],
  },
  {
    id: 4,
    user: "casual_play_sub",
    av: "C",
    avBg: C.blueBg,
    avC: C.blue,
    platform: "Android",
    score: 6.5,
    playTime: 80,
    date: "2024-09-05",
    f2p: true,
    kink: "無課金",
    title: "お手軽だけど天気・場所に左右されすぎる",
    body: "雨の日や地方在住だとモンスターの出現数が激減してつらい。都市部での体験と差がありすぎる点は改善してほしい。ゲーム自体は面白いので勿体ない。",
    spoilerBody: "",
    helpful: 134,
    tags: ["位置情報", "地域格差", "改善希望"],
  },
];

const MH_NOW_POSTS: Post[] = [
  {
    id: 1,
    user: "hunter_zero",
    av: "H",
    avBg: C.accentBg,
    avC: C.accent,
    date: "2024-11-14",
    title: "無課金でHR50到達した人集合！装備構成教えて",
    body: "月額パスなし・完全無課金でHR50に到達しました！みなさんの無課金構成も聞かせてください。",
    replies: 34,
    views: 891,
    tags: ["無課金", "HR50"],
  },
  {
    id: 2,
    user: "map_explorer",
    av: "M",
    avBg: C.greenBg,
    avC: C.green,
    date: "2024-11-10",
    title: "スポット密度が高い地域・場所情報シェアスレ",
    body: "駅周辺や公園でよくモンスターが出るスポットを共有しましょう！東京・大阪・名古屋あたりの情報特に求む。",
    replies: 67,
    views: 2341,
    tags: ["スポット", "地域情報"],
  },
  {
    id: 3,
    user: "update_watcher",
    av: "U",
    avBg: C.blueBg,
    avC: C.blue,
    date: "2024-11-08",
    title: "次回アップデートの新モンスター予想スレ",
    body: "公式ティザー画像からジンオウガ追加がほぼ確定っぽい。みなさんの予想は？",
    replies: 45,
    views: 1203,
    tags: ["アップデート", "予想"],
  },
  {
    id: 4,
    user: "multi_seeker",
    av: "T",
    avBg: C.yellowBg,
    avC: C.yellow,
    date: "2024-11-05",
    title: "マルチ募集・一緒に狩りに行きませんか？",
    body: "大阪市内で週末に一緒にプレイできるハンター募集中！初心者歓迎です。",
    replies: 18,
    views: 445,
    tags: ["マルチ", "オフ会"],
  },
];

const SCREENSHOTS = [
  "/games/detail-shot-1.jpg",
  "/games/monst.jpg",
  "/games/koware.jpg",
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function scaleDist(total: number) {
  const weights = SCORE_DIST.map((d) => d.count);
  const sum = weights.reduce((a, b) => a + b, 0);
  return SCORE_DIST.map((d, i) => ({
    label: d.label,
    count: Math.max(1, Math.round((total * weights[i]) / sum)),
  }));
}

function genericReviews(game: SearchGame): Review[] {
  const platform = game.platforms[0] ?? "PC";
  const alt = game.platforms[1] ?? platform;
  return [
    {
      id: 1,
      user: "sora_player22",
      av: "S",
      avBg: C.accentBg,
      avC: C.accent,
      platform,
      score: clamp(game.rating * 2 + 0.2, 5, 10),
      playTime: Math.round(game.avgPlaytime * 0.9),
      date: "2024-11-10",
      f2p: true,
      kink: "無課金",
      title: `無課金でも十分楽しめる！${game.title}の魅力`,
      body: `${game.title}は無課金でもストレスなく遊べる設計が好印象でした。${game.tags.join("・")}の要素がしっかりしていて、毎日少しずつ進めるのに向いています。長く遊ぶなら無課金でも十分楽しめます。`,
      spoilerBody: "終盤に近づくとコンテンツの厚みが増して、やり込みがいが一気に出てきます。",
      helpful: 312,
      tags: ["無課金OK", ...game.tags.slice(0, 2)],
    },
    {
      id: 2,
      user: "gacha_free_life",
      av: "G",
      avBg: C.greenBg,
      avC: C.green,
      platform: alt,
      score: clamp(game.rating * 2 - 0.5, 5, 9.5),
      playTime: Math.round(game.avgPlaytime * 0.45),
      date: "2024-10-22",
      f2p: true,
      kink: "無課金",
      title: game.hasGacha
        ? "課金圧は低め。ただガチャ運は気になる"
        : "課金圧は低め。じっくり遊べる",
      body: game.hasGacha
        ? "基本無料で長く遊べる設計は好評価。ただしガチャの排出に左右される場面があり、そこだけ惜しいです。"
        : "基本無料で長く遊べる設計は好評価。ゆっくり進めるなら無課金でも快適でした。",
      spoilerBody: "",
      helpful: 187,
      tags: game.hasGacha ? ["ガチャ", "課金圧低"] : ["課金圧低", "長期プレイ"],
    },
    {
      id: 3,
      user: "switch_gamer_mn",
      av: "M",
      avBg: C.purpleBg,
      avC: C.purple,
      platform,
      score: clamp(game.rating * 2 + 0.1, 6, 10),
      playTime: Math.round(game.avgPlaytime * 1.2),
      date: "2024-09-30",
      f2p: false,
      kink: "微課金",
      title: "少しだけ課金して快適に続けています",
      body: `${game.developer}らしい作り込みで、コレクション欲を刺激されます。微課金で快適さが上がるので、気に入った人にはおすすめです。`,
      spoilerBody: "中盤以降のコンテンツが特に充実していて、見た目の報酬も嬉しいです。",
      helpful: 245,
      tags: ["微課金", "コレクション", "長期プレイ"],
    },
    {
      id: 4,
      user: "casual_play_sub",
      av: "C",
      avBg: C.blueBg,
      avC: C.blue,
      platform: alt,
      score: clamp(game.rating * 2 - 1.5, 5, 8),
      playTime: Math.round(game.avgPlaytime * 0.2),
      date: "2024-09-05",
      f2p: true,
      kink: "無課金",
      title: "お手軽だけど、もう少しテンポが欲しい",
      body: "カジュアルに触る分には面白いですが、空き時間だけだと進みが遅く感じることもあります。ゲーム自体は面白いので、続け方次第だと思います。",
      spoilerBody: "",
      helpful: 134,
      tags: ["カジュアル", "改善希望"],
    },
  ];
}

function genericPosts(game: SearchGame): Post[] {
  return [
    {
      id: 1,
      user: "hunter_zero",
      av: "H",
      avBg: C.accentBg,
      avC: C.accent,
      date: "2024-11-14",
      title: `無課金で${game.title}を楽しんでる人集合！`,
      body: "課金なしでどこまで進めましたか？装備や編成のコツを共有しましょう。",
      replies: 34,
      views: 891,
      tags: ["無課金", "攻略"],
    },
    {
      id: 2,
      user: "map_explorer",
      av: "M",
      avBg: C.greenBg,
      avC: C.green,
      date: "2024-11-10",
      title: "序盤で詰まったポイントを教えて",
      body: "始めたばかりで効率の良い進め方が分からず…おすすめの立ち回り求む。",
      replies: 67,
      views: 2341,
      tags: ["攻略", "雑談"],
    },
    {
      id: 3,
      user: "update_watcher",
      av: "U",
      avBg: C.blueBg,
      avC: C.blue,
      date: "2024-11-08",
      title: "次回アップデート予想スレ",
      body: "次に来るコンテンツ、みなさんの予想は？",
      replies: 45,
      views: 1203,
      tags: ["アップデート", "考察"],
    },
    {
      id: 4,
      user: "multi_seeker",
      av: "T",
      avBg: C.yellowBg,
      avC: C.yellow,
      date: "2024-11-05",
      title: "一緒に遊ぶ人募集！",
      body: "週末に一緒にプレイできる人募集中。初心者歓迎です。",
      replies: 18,
      views: 445,
      tags: ["マルチ", "雑談"],
    },
  ];
}

function seedFromId(id: string | number) {
  if (typeof id === "number") return id;
  let hash = 0;
  for (const char of id) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

function buildFromSearch(game: SearchGame): GameDetailData {
  const f2pScore = clamp(game.f2pScore * 20, 20, 100);
  const volume = clamp(game.volumeScore * 20, 20, 100);
  const seed = seedFromId(game.id);
  const graphic = 68 + ((seed * 13) % 25);
  const control = 62 + ((seed * 17) % 30);
  const story = 48 + ((seed * 11) % 40);
  const kinka = game.hasGacha
    ? clamp(40 + game.f2pScore * 8, 30, 90)
    : clamp(62 + game.f2pScore * 7, 50, 98);
  const avgScore = Math.round(game.rating * 20) / 10;
  const playTime = Math.round(game.avgPlaytime * 0.7);

  return {
    id: game.id,
    title: game.title,
    developer: game.developer,
    genre: [game.genre, ...game.tags.filter((tag) => tag !== game.genre)].slice(0, 3),
    platforms: game.platforms,
    releaseDate: `${game.releaseYear}年`,
    priceLabel: game.isFree ? "基本無料" : `¥${game.price.toLocaleString()}`,
    ageRating: "CERO A（全年齢対象）",
    monetization: {
      type: game.isFree ? "基本無料 + アイテム課金" : "買い切り",
      monthly: game.isFree ? "月額パス ¥1,080〜" : "なし",
      ceiling: game.hasGacha ? "ガチャあり（天井はタイトルによる）" : "天井なし（ガチャ非搭載）",
    },
    jacket: game.img,
    coverWide: "/games/gaming-alt.jpg",
    avgPlayTime: game.avgPlaytime,
    totalReviews: game.ratingCount,
    avgScore,
    f2pScore,
    axes: [
      { key: "graphic", label: "グラフィック", value: graphic },
      { key: "f2p", label: "無課金遊びやすさ", value: f2pScore },
      { key: "volume", label: "ボリューム", value: volume },
      { key: "control", label: "操作性・快適さ", value: control },
      { key: "story", label: "ストーリー", value: story },
      { key: "kinka", label: "課金圧の低さ", value: kinka },
    ],
    screenshots: SCREENSHOTS,
    reviews: genericReviews(game),
    posts: genericPosts(game),
    myRecord: {
      playTime,
      sessions: Math.max(8, Math.round(playTime / 4)),
      screenshotCount: 23,
      achievements: [
        { label: "初めてのプレイ", date: `${game.releaseYear}-09-01`, icon: "🎮" },
        { label: "10時間達成", date: `${game.releaseYear}-10-15`, icon: "⏱" },
        { label: "お気に入り登録", date: `${game.releaseYear}-11-02`, icon: "⭐" },
      ],
    },
    scoreDist: scaleDist(game.ratingCount),
  };
}

export function getGameDetailFromSearch(
  game: SearchGame,
  options: { syntheticSocial?: boolean } = {},
): GameDetailData {
  const base = buildFromSearch(game);
  if (options.syntheticSocial === false) {
    return {
      ...base,
      reviews: [],
      posts: [],
      totalReviews: 0,
      scoreDist: [],
    };
  }
  return base;
}

export function applyGeneratedDetails(
  detail: GameDetailData,
  generated: GeneratedGameDetails,
): GameDetailData {
  const platforms = detail.platforms.length ? detail.platforms : generated.platforms;
  const tags = generated.tags.filter((tag) => !detail.genre.includes(tag));

  return {
    ...detail,
    summary: generated.summary,
    detailsGenerated: true,
    platforms,
    genre: [...detail.genre, ...tags].slice(0, 4),
    releaseDate: generated.releaseDate,
    priceLabel: generated.priceLabel,
    ageRating: generated.ageRating,
    monetization: {
      type: generated.monetizationType,
      monthly: generated.monthly,
      ceiling: generated.ceiling,
    },
    avgPlayTime: generated.avgPlayTime,
    avgScore: Math.round(generated.avgScore * 10) / 10,
    f2pScore: generated.f2pScore,
    axes: [
      { key: "graphic", label: "グラフィック", value: generated.graphicScore },
      { key: "f2p", label: "無課金遊びやすさ", value: generated.f2pScore },
      { key: "volume", label: "ボリューム", value: generated.volumeScore },
      { key: "control", label: "操作性・快適さ", value: generated.controlScore },
      { key: "story", label: "ストーリー", value: generated.storyScore },
      { key: "kinka", label: "課金圧の低さ", value: generated.kinkaScore },
    ],
  };
}

export function getGameDetail(id: string): GameDetailData | null {
  const game = SEARCH_GAMES.find((item) => String(item.id) === id);
  if (!game) return null;

  const base = buildFromSearch(game);

  if (game.id !== 7) return base;

  return {
    ...base,
    developer: "Niantic / CAPCOM",
    genre: ["位置情報ゲーム", "アクション", "ガチャあり"],
    releaseDate: "2023年9月14日",
    priceLabel: "基本無料",
    ageRating: "CERO A（全年齢対象）",
    monetization: {
      type: "基本無料 + アイテム課金",
      monthly: "月額パス ¥1,080〜",
      ceiling: "天井なし（ガチャ非搭載）",
    },
    avgPlayTime: 148,
    totalReviews: 3241,
    avgScore: 8.3,
    f2pScore: 82,
    axes: [
      { key: "graphic", label: "グラフィック", value: 88 },
      { key: "f2p", label: "無課金遊びやすさ", value: 82 },
      { key: "volume", label: "ボリューム", value: 74 },
      { key: "control", label: "操作性・快適さ", value: 79 },
      { key: "story", label: "ストーリー", value: 55 },
      { key: "kinka", label: "課金圧の低さ", value: 77 },
    ],
    reviews: MH_NOW_REVIEWS,
    posts: MH_NOW_POSTS,
    myRecord: {
      playTime: 312,
      sessions: 84,
      screenshotCount: 23,
      achievements: [
        { label: "イャンクック討伐", date: "2024-09-01", icon: "🗡️" },
        { label: "HR50達成", date: "2024-10-15", icon: "🏆" },
        { label: "リオレウス撃退", date: "2024-11-02", icon: "🐉" },
      ],
    },
    scoreDist: SCORE_DIST,
  };
}

export function getSearchGame(id: string): SearchGame | undefined {
  return SEARCH_GAMES.find((item) => String(item.id) === id);
}

export function getThread(gameId: string, threadId: string) {
  const detail = getGameDetail(gameId);
  if (!detail) return null;
  const post = detail.posts.find((item) => String(item.id) === threadId);
  if (!post) return null;
  return {
    gameId: detail.id,
    gameTitle: detail.title,
    post,
  };
}
