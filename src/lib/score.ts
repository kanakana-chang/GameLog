// 内部の10点満点を画面の5点満点に換算する。
export function toFivePointScore(score: number) {
  if (!Number.isFinite(score) || score <= 0) return 0;
  return Math.min(5, Math.max(0, Math.round((score / 2) * 10) / 10));
}
