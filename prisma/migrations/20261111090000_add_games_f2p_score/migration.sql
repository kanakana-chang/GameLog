-- AlterTable
ALTER TABLE "public"."games" ADD COLUMN "f2p_score" SMALLINT NOT NULL DEFAULT 0;

-- 買い切りで追加コンテンツがないものは 5、追加の重さ・スマホのガチャ内容で差をつける
UPDATE "public"."games" SET "f2p_score" = 5 WHERE "title" IN (
  'Star Fox',
  'ゼルダの伝説 時のオカリナ',
  '星のカービィ Wii デラックス',
  'カービィのエアライダー',
  'ほの暮しの庭',
  'スプラトゥーン レイダース',
  'メトロイド ラヴェナス',
  '星のカービィ ワールドビヨンド',
  'ドンキーコング バナンザ',
  'ファイアーエムブレム 万紫千紅',
  'Nintendo Switch Sports Resort'
);

UPDATE "public"."games" SET "f2p_score" = 4 WHERE "title" IN (
  'パワフルプロ野球2026-2027',
  '牧場物語 Let’s！風のグランドバザール',
  '龍の国 ルーンファクトリー',
  'モンスターハンターワイルズ'
);

UPDATE "public"."games" SET "f2p_score" = 3 WHERE "title" IN (
  '星のカービィ ディスカバリー',
  'ゼルダの伝説 ティアーズ オブ ザ キングダム',
  'あつまれ どうぶつの森',
  'バンドリ！ ガールズバンドパーティ！',
  '白猫プロジェクト',
  'プロジェクトセカイ カラフルステージ! feat. 初音ミク',
  'モンスターストライク'
);

UPDATE "public"."games" SET "f2p_score" = 2 WHERE "title" IN (
  'あんさんぶるスターズ!! Music'
);
