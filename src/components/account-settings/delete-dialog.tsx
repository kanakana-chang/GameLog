type DeleteDialogProps = {
  confirmText: string;
  onConfirmTextChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteDialog({
  confirmText,
  onConfirmTextChange,
  onCancel,
  onConfirm,
}: DeleteDialogProps) {
  const canDelete = confirmText === "退会する";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-soft">
            <span className="text-xl leading-none">⚠️</span>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-danger">
              本当に退会しますか？
            </h3>
            <p className="text-xs text-muted">この操作は元に戻せません</p>
          </div>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-label">
          アカウントを削除すると、すべての実績・レビュー・コレクションが完全に消去されます。
        </p>

        <div className="mb-4 rounded-lg border border-border bg-bg p-3 text-xs">
          <p className="mb-2 font-medium text-label">
            確認のため「
            <span className="font-bold text-danger">退会する</span>
            」と入力してください
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(event) => onConfirmTextChange(event.target.value)}
            placeholder="退会する"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-body text-sm text-heading outline-none transition-all duration-150 placeholder:text-muted/70 focus:border-danger focus:shadow-focus-danger"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-label transition-colors duration-150 hover:bg-bg"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete}
            className="flex-1 rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 enabled:hover:bg-danger-hover disabled:cursor-not-allowed disabled:bg-danger-disabled"
          >
            退会する
          </button>
        </div>
      </div>
    </div>
  );
}
