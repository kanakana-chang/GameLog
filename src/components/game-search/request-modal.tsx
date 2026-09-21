"use client";

import { useState } from "react";

export function RequestModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [developer, setDeveloper] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(26,26,46,0.4)] p-5 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl border border-search-border bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.13)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
      >
        {submitted ? (
          <div className="px-0 py-4 text-center">
            <div className="mb-3 text-[40px]">🎮</div>
            <h2
              id="request-modal-title"
              className="mb-2 font-search text-2xl font-bold text-search-text"
            >
              リクエストを受け付けました！
            </h2>
            <p className="mb-6 text-sm text-search-muted">
              「{title}」を送信しました。確認後、データベースへの追加を検討いたします。
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-search-primary px-7 py-2.5 text-sm font-semibold text-white"
            >
              閉じる
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2
                id="request-modal-title"
                className="font-search text-[22px] font-bold text-search-text"
              >
                ゲーム追加リクエスト
              </h2>
              <p className="mt-1.5 text-[13px] text-search-muted">
                掲載されていないゲームをリクエストできます
              </p>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="request-title"
                  className="mb-1.5 block text-xs text-search-muted"
                >
                  ゲームタイトル *
                </label>
                <input
                  id="request-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="例：プロセカ、荒野行動 など"
                  className="w-full rounded-lg border border-search-border bg-[#F8F9FF] px-3 py-2.5 font-body text-sm text-search-text outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="request-developer"
                  className="mb-1.5 block text-xs text-search-muted"
                >
                  デベロッパー（任意）
                </label>
                <input
                  id="request-developer"
                  value={developer}
                  onChange={(event) => setDeveloper(event.target.value)}
                  placeholder="例：カプコン、任天堂"
                  className="w-full rounded-lg border border-search-border bg-[#F8F9FF] px-3 py-2.5 font-body text-sm text-search-text outline-none"
                />
              </div>
              <div className="mt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-search-border bg-search-bg py-2.5 text-sm text-search-muted"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-[2] rounded-lg bg-search-primary py-2.5 text-sm font-semibold text-white"
                >
                  リクエストする
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
