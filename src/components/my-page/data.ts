export type GameStatus = "全て" | "プレイ中" | "クリア済み" | "積みゲー" | "やめた";

export const TABS: GameStatus[] = [
  "全て",
  "プレイ中",
  "クリア済み",
  "積みゲー",
  "やめた",
];

export const GAMES = [
  {
    id: 1,
    title: "ゼルダの伝説 ティアーズ オブ ザ キングダム",
    cover: "/mypage/covers/zelda.jpg",
    status: "クリア済み",
    hours: 120,
    platform: "Switch",
    rating: 5,
  },
  {
    id: 2,
    title: "スプラトゥーン3",
    cover: "/mypage/covers/splatoon.jpg",
    status: "プレイ中",
    hours: 87,
    platform: "Switch",
    rating: 4,
  },
  {
    id: 3,
    title: "モンスターハンターNow",
    cover: "/mypage/covers/mhn.jpg",
    status: "プレイ中",
    hours: 54,
    platform: "スマホ",
    rating: 4,
  },
  {
    id: 4,
    title: "ポケモン スカーレット",
    cover: "/mypage/covers/pokemon.jpg",
    status: "クリア済み",
    hours: 68,
    platform: "Switch",
    rating: 4,
  },
  {
    id: 5,
    title: "原神",
    cover: "/mypage/covers/genshin.jpg",
    status: "プレイ中",
    hours: 210,
    platform: "スマホ",
    rating: 3,
  },
  {
    id: 6,
    title: "マリオカート8 デラックス",
    cover: "/mypage/covers/mariokart.jpg",
    status: "クリア済み",
    hours: 45,
    platform: "Switch",
    rating: 5,
  },
  {
    id: 7,
    title: "あつまれ どうぶつの森",
    cover: "/mypage/covers/animal-crossing.jpg",
    status: "積みゲー",
    hours: 12,
    platform: "Switch",
    rating: null,
  },
  {
    id: 8,
    title: "Fate/Grand Order",
    cover: "/mypage/covers/fgo.jpg",
    status: "やめた",
    hours: 23,
    platform: "スマホ",
    rating: 2,
  },
  {
    id: 9,
    title: "スーパーマリオオデッセイ",
    cover: "/mypage/covers/odyssey.jpg",
    status: "クリア済み",
    hours: 35,
    platform: "Switch",
    rating: 5,
  },
  {
    id: 10,
    title: "大乱闘スマッシュブラザーズ SPECIAL",
    cover: "/mypage/covers/smash.jpg",
    status: "プレイ中",
    hours: 156,
    platform: "Switch",
    rating: 5,
  },
  {
    id: 11,
    title: "オクトパストラベラー II",
    cover: "/mypage/covers/octopath.jpg",
    status: "積みゲー",
    hours: 0,
    platform: "Switch",
    rating: null,
  },
  {
    id: 12,
    title: "Identity V",
    cover: "/mypage/covers/identity-v.jpg",
    status: "やめた",
    hours: 41,
    platform: "スマホ",
    rating: 3,
  },
] as const;

export type Game = (typeof GAMES)[number];

export const REVIEWS = [
  {
    id: 1,
    gameTitle: "ゼルダの伝説 ティアーズ オブ ザ キングダム",
    cover: "/mypage/covers/zelda.jpg",
    rating: 5,
    date: "2024年5月12日",
    text: "前作を超えてきた大傑作。空島・地底まで加わり探索の自由度が爆上がり。無課金どころかDLCなしでこのボリュームは異次元。クリアまで120時間以上かかったのに全然飽きなかった。",
    likes: 48,
    comments: 12,
    tags: ["無課金OK", "ボリューム満点", "Switch"],
  },
  {
    id: 2,
    gameTitle: "スプラトゥーン3",
    cover: "/mypage/covers/splatoon.jpg",
    rating: 4,
    date: "2024年3月8日",
    text: "対戦バランスが改善されて初心者でも入りやすくなった。フェス期間が楽しい。課金要素はコスメのみなので気にならない。ただしオンライン必須なのでNSO加入必要。",
    likes: 31,
    comments: 7,
    tags: ["課金不要", "対戦向け", "Switch"],
  },
  {
    id: 3,
    gameTitle: "原神",
    cover: "/mypage/covers/genshin.jpg",
    rating: 3,
    date: "2024年1月20日",
    text: "グラフィックと世界観は最高クラス。ストーリーも面白い。ただガチャの沼が深く無課金だとキャラが揃いにくい。メインストーリーだけなら無課金で十分遊べるので割り切りが大事。",
    likes: 62,
    comments: 24,
    tags: ["ガチャあり", "無課金厳しめ", "スマホ"],
  },
] as const;

export type Review = (typeof REVIEWS)[number];

export const STATUS_COLORS: Record<string, string> = {
  プレイ中: "bg-emerald-100 text-emerald-700",
  クリア済み: "bg-violet-100 text-violet-700",
  積みゲー: "bg-amber-100 text-amber-700",
  やめた: "bg-gray-100 text-gray-500",
};

export const PLATFORM_COLORS: Record<string, string> = {
  Switch: "bg-red-50 text-red-600",
  スマホ: "bg-sky-50 text-sky-600",
};
