"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

const fieldClassName =
  "w-full rounded-[10px] border-[1.5px] border-login-border bg-login-field px-3.5 py-2.5 pr-12 font-body text-sm text-login-input outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-login-faint focus:border-login-violet focus:bg-white focus:shadow-login-focus";

export function ResetPasswordForm({ expired = false }: { expired?: boolean }) {
  const router = useRouter();
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("新しいパスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirm }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        setError(payload?.error || "パスワードの変更に失敗しました");
        return;
      }
      await login();
      setDone(true);
      window.setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch {
      setError("パスワードの変更に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-[calc(100dvh-4rem)] flex-1 items-center justify-center overflow-hidden p-4 font-display"
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #eef0ff 40%, #f3f0ff 100%)",
      }}
    >
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-[20px] border border-[rgba(124,58,237,0.12)] bg-white/92 px-10 pt-10 pb-9 shadow-login-card backdrop-blur-[20px]">
          <h1 className="mb-2 font-login text-[26px] font-bold tracking-[0.01em] text-login-heading">
            新しいパスワード
          </h1>

          {expired ? (
            <>
              <p className="mb-7 font-body text-sm leading-relaxed text-login-muted">
                リセットリンクが無効か期限切れです。もう一度リセットを申請してください。
              </p>
              <Link
                href="/login?reset=1"
                className="inline-flex w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#6366f1] py-3 font-login text-[15px] font-semibold tracking-[0.04em] text-white shadow-login-btn"
              >
                リセットを再申請
              </Link>
            </>
          ) : done ? (
            <p className="rounded-xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.06)] px-[18px] py-4 font-body text-sm leading-relaxed text-login-label">
              パスワードを変更しました。ホームへ移動します。
            </p>
          ) : (
            <>
              <p className="mb-7 font-body text-sm leading-relaxed text-login-muted">
                新しいパスワードを入力してください。
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-[13px] font-semibold text-login-label"
                  >
                    新しいパスワード
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="8文字以上"
                      required
                      minLength={8}
                      className={fieldClassName}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-login-faint"
                    >
                      {showPassword ? "隠す" : "表示"}
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-[13px] font-semibold text-login-label"
                  >
                    新しいパスワード（確認）
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      placeholder="もう一度入力"
                      required
                      minLength={8}
                      className={fieldClassName}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((current) => !current)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-login-faint"
                    >
                      {showConfirm ? "隠す" : "表示"}
                    </button>
                  </div>
                </div>
                {error ? (
                  <p className="rounded-[10px] border border-[rgba(220,38,38,0.18)] bg-[rgba(220,38,38,0.06)] px-3 py-2 font-body text-xs text-[#b91c1c]">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#6366f1] py-3 font-login text-[15px] font-semibold tracking-[0.04em] text-white shadow-login-btn transition-all duration-200 disabled:cursor-not-allowed disabled:bg-login-disabled disabled:bg-none disabled:shadow-none"
                >
                  {loading ? "変更中…" : "パスワードを変更"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
