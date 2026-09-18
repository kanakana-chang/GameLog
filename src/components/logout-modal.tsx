type LogoutModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-logout-overlay px-4 backdrop-blur-[4px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ animation: "modal-in 0.2s ease-out" }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#6C5CE7] to-[#a78bfa]" />

        <div className="flex flex-col items-center gap-6 px-8 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ede9fe] to-[#ddd6fe]">
            <LogoutIcon />
          </div>

          <div className="text-center">
            <h2
              id="logout-modal-title"
              className="mb-2 text-xl font-bold text-gray-900"
            >
              ログアウトしますか？
            </h2>
            <p className="text-sm leading-relaxed text-gray-500">
              ログアウトすると、再度ログインが
              <br />
              必要になります。よろしいですか？
            </p>
          </div>

          <div className="flex w-full items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#a78bfa] text-sm font-bold text-white">
              GL
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                GameLogユーザー
              </p>
              <p className="text-xs text-gray-400">user@gamelog.jp</p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#8b5cf6] py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              ログアウトする
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:scale-[0.98]"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6C5CE7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
