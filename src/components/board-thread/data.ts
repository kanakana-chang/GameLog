export type ThreadReply = {
  id: string | number;
  userId: string;
  userName: string;
  username?: string;
  accountId?: string;
  avatar: string;
  avatarSrc?: string;
  color: string;
  content: string;
  isSpoiler: boolean;
  likes: number;
  likedByMe: boolean;
  timestamp: string;
  image?: string;
  title?: string;
};

export const THREAD_REPORT_REASONS = [
  { id: "harassment", label: "誹謗中傷・攻撃的な表現", icon: "⚠️" },
  { id: "spoiler", label: "ネタバレ未設定のネタバレ投稿", icon: "🔓" },
  { id: "spam", label: "スパム・宣伝行為", icon: "📢" },
  { id: "other", label: "その他（不適切な画像・公序良俗違反等）", icon: "🚫" },
];
