# DB設計（実装スキーマ）

Prisma の `prisma/schema.prisma` に合わせた公開スキーマです。Auth 系テーブルは Supabase 管理のため省略します。

## テーブル

| テーブル             | 役割                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `games`              | ゲームマスタ。`release_year` は年のみ（BigInt）。`avg_play_hours` は管理画面の目安時間。`f2p_score` はカタログの無課金度（1-5、0は自動）。`is_published` が false なら非公開 |
| `platforms`          | 対応ハード                                                                                                                 |
| `game_platform`      | ゲームとハードの中間テーブル（設計書の `game_platforms` に相当）                                                           |
| `game_details`       | Wikipedia / Gemini で組み立てた概要 JSON                                                                                   |
| `profiles`           | 表示名、ユーザー名、ロール（`user` / `admin`）                                                                             |
| `reviews`            | レビュー。タイトル・プレイ時間・ステータスは `comment` 先頭の `<!--gl:{...}-->` に格納                                     |
| `review_likes`       | レビューへのいいね                                                                                                         |
| `topics`             | 掲示板スレッド                                                                                                             |
| `posts`              | スレ本文（1件目）とレス                                                                                                    |
| `post_likes`         | レスへのいいね                                                                                                             |
| `reports`            | 通報                                                                                                                       |
| `user_game_statuses` | ゲーム棚のステータスと個人のプレイ時間                                                                                     |

## `reviews.param_1`〜`param_5`

いずれも 1〜10 の整数。

| 列        | 意味         |
| --------- | ------------ |
| `param_1` | ストーリー   |
| `param_2` | グラフィック |
| `param_3` | ゲームプレイ |
| `param_4` | サウンド     |
| `param_5` | 無課金度     |

コスパはメタデータ `v` に保存します。総合点 `rating_overall` は内部 10 点満点、画面表示は 5 点満点です。
