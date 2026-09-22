export type ThreadReply = {
  id: number;
  userId: string;
  userName: string;
  avatar: string;
  color: string;
  content: string;
  isSpoiler: boolean;
  likes: number;
  likedByMe: boolean;
  timestamp: string;
  image?: string;
};

export const CURRENT_USER = {
  id: "user_0042",
  name: "ポケモン廃人",
  avatar: "PK",
  color: "#8b5cf6",
};

export const THREAD_REPLIES: ThreadReply[] = [
  {
    id: 1,
    userId: "user_0001",
    userName: "スイッチ勢",
    avatar: "SW",
    color: "#5b4cf5",
    content:
      "ラスボス撃破したけど、クリア後のやり込みが本番だったわ。エンドコンテンツ充実しすぎ",
    isSpoiler: false,
    likes: 47,
    likedByMe: false,
    timestamp: "2026-09-07 09:12",
  },
  {
    id: 2,
    userId: "user_0017",
    userName: "ガチャ勢みう",
    avatar: "GM",
    color: "#ff6b6b",
    content:
      "無課金でも十分遊べた。スタミナ回復が課金圧なのはまあ許容範囲。石の配布率がけっこう良い",
    isSpoiler: false,
    likes: 88,
    likedByMe: true,
    timestamp: "2026-09-07 10:03",
  },
  {
    id: 3,
    userId: "user_0099",
    userName: "さばげーおじさん",
    avatar: "SB",
    color: "#0ea5e9",
    content: "ラスボス第2形態の攻略法ここに書いていい？ネタバレになるかも",
    isSpoiler: true,
    likes: 23,
    likedByMe: false,
    timestamp: "2026-09-07 11:44",
    image: "/board/reply-shot.jpg",
  },
  {
    id: 4,
    userId: "user_0055",
    userName: "ライトゲーマーK",
    avatar: "LK",
    color: "#10b981",
    content:
      "プレイ時間200時間超えた。これが無料（基本無料）は正直やばい。友達に布教しまくってる",
    isSpoiler: false,
    likes: 112,
    likedByMe: false,
    timestamp: "2026-09-07 13:20",
  },
  {
    id: 5,
    userId: "user_0008",
    userName: "なつめ",
    avatar: "NT",
    color: "#f59e0b",
    content:
      "最終章の演出が神すぎて思わずスクショ撮りまくった。フォトモード欲しい",
    isSpoiler: true,
    likes: 64,
    likedByMe: false,
    timestamp: "2026-09-07 14:55",
    image: "/games/gaming-alt.jpg",
  },
];

export const THREAD_REPORT_REASONS = [
  { id: "harassment", label: "誹謗中傷・攻撃的な表現", icon: "⚠️" },
  { id: "spoiler", label: "ネタバレ未設定のネタバレ投稿", icon: "🔓" },
  { id: "spam", label: "スパム・宣伝行為", icon: "📢" },
  { id: "other", label: "その他（不適切な画像・公序良俗違反等）", icon: "🚫" },
];
