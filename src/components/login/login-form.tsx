"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

type View = "login" | "reset";

const fieldClassName =
  "w-full rounded-[10px] border-[1.5px] border-login-border bg-login-field px-3.5 py-2.5 font-body text-sm text-login-input outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-login-faint focus:border-login-violet focus:bg-white focus:shadow-login-focus";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      login();
      router.push("/");
    }, 1200);
  };

  const handleReset = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 1000);
  };

  return (
    <div
      className="relative flex min-h-[calc(100dvh-4rem)] flex-1 items-center justify-center overflow-hidden p-4 font-display"
      style={{
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #eef0ff 40%, #f3f0ff 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-[-10%] right-[-5%] h-[480px] w-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-5%] left-[-8%] h-[380px] w-[380px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
          }}
        />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="login-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="rounded-[20px] border border-[rgba(124,58,237,0.12)] bg-white/92 px-10 pt-10 pb-9 shadow-login-card backdrop-blur-[20px]">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#6366f1] text-white shadow-login-logo">
              <ControllerIcon />
            </div>
            <div>
              <div className="font-login text-[22px] leading-none font-bold tracking-[0.02em] text-login-heading">
                GameLog
              </div>
              <div className="text-[11px] font-medium tracking-[0.08em] text-login-tag uppercase">
                プレイ記録を管理
              </div>
            </div>
          </div>

          {view === "login" ? (
            <>
              <h1 className="mb-1 font-login text-[28px] font-bold tracking-[0.01em] text-login-heading">
                ログイン
              </h1>
              <p className="mb-7 font-body text-sm text-login-muted">
                アカウントにサインインしてください
              </p>

              <div className="mb-6 flex flex-col gap-3">
                <SnsButton icon={<GoogleIcon />} label="Googleでログイン" />
                <SnsButton icon={<XIcon />} label="X（Twitter）でログイン" />
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-login-border" />
                <span className="text-xs font-medium text-login-faint">
                  または
                </span>
                <div className="h-px flex-1 bg-login-border" />
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-1.5 block text-[13px] font-semibold tracking-[0.02em] text-login-label"
                  >
                    メールアドレス
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="text-[13px] font-semibold tracking-[0.02em] text-login-label"
                    >
                      パスワード
                    </label>
                    <button
                      type="button"
                      onClick={() => setView("reset")}
                      className="text-xs font-medium text-login-violet"
                    >
                      パスワードを忘れた？
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      required
                      className={`${fieldClassName} pr-[42px]`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center text-login-faint"
                      aria-label={
                        showPassword ? "パスワードを隠す" : "パスワードを表示"
                      }
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#6366f1] py-3 font-login text-[15px] font-semibold tracking-[0.04em] text-white shadow-login-btn transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:bg-login-disabled disabled:bg-none disabled:shadow-none"
                >
                  {loading ? "ログイン中…" : "ログイン"}
                </button>
              </form>

              <p className="mt-6 text-center font-body text-sm text-login-muted">
                アカウントをお持ちでない方は{" "}
                <Link
                  href="/register"
                  className="font-semibold text-login-violet hover:underline"
                >
                  新規登録
                </Link>
              </p>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setResetSent(false);
                  setResetEmail("");
                }}
                className="mb-6 flex items-center gap-1.5 text-[13px] font-medium text-login-violet"
              >
                <BackIcon />
                ログインに戻る
              </button>

              <h1 className="mb-2 font-login text-[26px] font-bold tracking-[0.01em] text-login-heading">
                パスワードリセット
              </h1>

              {resetSent ? (
                <div className="rounded-xl border border-[rgba(124,58,237,0.18)] bg-[rgba(124,58,237,0.06)] px-[18px] py-4">
                  <p className="m-0 font-body text-sm leading-relaxed text-login-label">
                    <strong className="text-login-violet">{resetEmail}</strong>{" "}
                    にリセット用のメールを送信しました。メールボックスをご確認ください。
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-7 font-body text-sm leading-relaxed text-login-muted">
                    登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
                  </p>
                  <form onSubmit={handleReset} className="flex flex-col gap-4">
                    <div>
                      <label
                        htmlFor="reset-email"
                        className="mb-1.5 block text-[13px] font-semibold text-login-label"
                      >
                        メールアドレス
                      </label>
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(event) => setResetEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        className={fieldClassName}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-[10px] bg-gradient-to-br from-[#7c3aed] to-[#6366f1] py-3 font-login text-[15px] font-semibold tracking-[0.04em] text-white shadow-login-btn transition-all duration-200 disabled:cursor-not-allowed disabled:bg-login-disabled disabled:bg-none disabled:shadow-none"
                    >
                      {loading ? "送信中…" : "リセットリンクを送信"}
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </div>

        <p className="mt-5 text-center text-[11px] text-login-faint">
          ©2026 GameLog — ゲーム記録・レビュー管理サービス
        </p>
      </div>
    </div>
  );
}

function SnsButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2.5 rounded-[10px] border border-login-border bg-white px-4 py-[11px] text-sm font-medium text-login-label transition-all duration-150 hover:border-[#d1d5db] hover:bg-[#f9fafb]"
    >
      {icon}
      {label}
    </button>
  );
}

function ControllerIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="M6 12h4M8 10v4M15 11h.01M17 13h.01" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
