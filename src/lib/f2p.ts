// カタログの無課金度。買い切りは追加コンテンツの有無、スマホゲームはガチャの重さで決める。

export const F2P_LEVELS = [
  {
    value: 0,
    label: "自動（買い切りは完全無課金、ガチャは内容で判定）",
  },
  { value: 5, label: "5｜完全無課金（追加コンテンツなし）" },
  { value: 4, label: "4｜追加は軽微・安価 / 無課金寄り" },
  { value: 3, label: "3｜本編級の追加 / 中程度のガチャ" },
  { value: 2, label: "2｜高額追加 / 課金が有利" },
  { value: 1, label: "1｜課金前提のガチャ" },
] as const;

export type F2pScore = 1 | 2 | 3 | 4 | 5;

const TITLE_F2P: Record<string, F2pScore> = {
  "Star Fox": 5,
  "ゼルダの伝説 時のオカリナ": 5,
  "星のカービィ Wii デラックス": 5,
  カービィのエアライダー: 5,
  ほの暮しの庭: 5,
  "スプラトゥーン レイダース": 5,
  "メトロイド ラヴェナス": 5,
  "星のカービィ ワールドビヨンド": 5,
  "ドンキーコング バナンザ": 5,
  "ファイアーエムブレム 万紫千紅": 5,
  "Nintendo Switch Sports Resort": 5,
  "パワフルプロ野球2026-2027": 4,
  "牧場物語 Let’s！風のグランドバザール": 4,
  "龍の国 ルーンファクトリー": 4,
  モンスターハンターワイルズ: 4,
  "星のカービィ ディスカバリー": 3,
  "ゼルダの伝説 ティアーズ オブ ザ キングダム": 3,
  "あつまれ どうぶつの森": 3,
  "バンドリ！ ガールズバンドパーティ！": 3,
  白猫プロジェクト: 3,
  "プロジェクトセカイ カラフルステージ! feat. 初音ミク": 3,
  モンスターストライク: 3,
  "あんさんぶるスターズ!! Music": 2,
};

export function clampF2pScore(value: unknown): number {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  const rounded = Math.round(score);
  if (rounded <= 0) return 0;
  return Math.min(5, rounded);
}

function titleF2p(title: string): F2pScore | null {
  return TITLE_F2P[title] ?? TITLE_F2P[title.replace(/\s+/g, " ")] ?? null;
}

export function contentF2pScore(input: {
  title: string;
  stored?: number | null;
  isFree: boolean;
  hasGacha: boolean;
}): F2pScore {
  const stored = clampF2pScore(input.stored);
  if (stored >= 1) return stored as F2pScore;
  const byTitle = titleF2p(input.title);
  if (byTitle) return byTitle;
  if (input.hasGacha) return 3;
  if (input.isFree) return 4;
  return 5;
}
