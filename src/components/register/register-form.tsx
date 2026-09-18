"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

type Step = "register" | "verify";
type FieldErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  agreed?: string;
};

const BENEFITS = [
  { icon: "🏆", text: "クリア実績を自動記録" },
  { icon: "📊", text: "プレイ時間をひと目で把握" },
  { icon: "🎰", text: "無課金での遊びやすさを比較" },
  { icon: "📸", text: "スクショをゲームと紐付けて管理" },
] as const;

const VERIFY_STEPS = [
  "受信ボックスを確認する",
  "メール内のリンクをクリック",
  "プロフィールを設定して冒険開始！",
] as const;

const STRENGTH_LABEL = ["", "弱い", "普通", "強い"] as const;
const STRENGTH_CLASS = [
  "",
  "bg-register-weak text-register-weak",
  "bg-register-medium text-register-medium",
  "bg-register-strong text-register-strong",
] as const;

export function RegisterForm() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("register");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const strength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : /[A-Z]/.test(password) && /[0-9]/.test(password)
          ? 3
          : 2;

  const validate = () => {
    const next: FieldErrors = {};
    if (!displayName.trim()) next.displayName = "表示名を入力してください";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "有効なメールアドレスを入力してください";
    }
    if (password.length < 8) {
      next.password = "パスワードは8文字以上で入力してください";
    }
    if (!agreed) next.agreed = "利用規約への同意が必要です";
    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setStep("verify");
    }, 1400);
  };

  if (step === "verify") {
    return (
      <div className="flex min-h-[calc(100dvh-4rem)] flex-1 items-center justify-center bg-register-bg p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <GameLogo />
          </div>
          <div className="rounded-2xl border border-register-border bg-register-card p-10 text-center shadow-register-card">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#5b3ef5] to-[#9333ea]">
              <MailIcon />
            </div>
            <h2 className="mb-2 font-display text-2xl font-bold text-register-fg">
              確認メールを送信しました
            </h2>
            <p className="mb-1 text-sm text-register-muted">
              <span className="font-semibold text-register-primary">{email}</span>{" "}
              に確認メールをお送りしました。
            </p>
            <p className="mb-8 text-sm text-register-muted">
              メール内のリンクをクリックしてアカウントを有効化してください。
            </p>
            <div className="mb-6 rounded-xl border border-register-border bg-register-muted-bg p-4 text-left">
              <p className="mb-2 text-xs font-medium text-register-muted">
                次のステップ
              </p>
              {VERIFY_STEPS.map((text, index) => (
                <div key={text} className="flex items-center gap-2 py-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-register-primary text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm text-register-secondary">{text}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep("register")}
              className="text-sm font-medium text-register-primary transition-opacity hover:opacity-70"
            >
              ← 登録画面に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-1 items-stretch bg-register-bg">
      <aside
        className="relative hidden w-96 shrink-0 flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{
          background:
            "linear-gradient(160deg, #1a0d4a 0%, #2d1b8e 40%, #4c2db5 70%, #7c3aed 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 80%, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10">
          <GameLogo white />
        </div>
        <div className="relative z-10">
          <div className="mb-8">
            {BENEFITS.map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 py-2.5">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-white/90">{text}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/[0.12] bg-white/[0.08] p-4">
            <p className="mb-1 text-xs text-white/60">現在のユーザー数</p>
            <p className="font-display text-3xl font-bold text-white">
              128,400<span className="text-lg opacity-70">+</span>
            </p>
            <p className="mt-1 text-xs text-white/50">ゲーマーが記録中</p>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-md py-8">
          <div className="mb-8 flex justify-center lg:hidden">
            <GameLogo />
          </div>

          <div className="mb-8">
            <h1 className="mb-1 font-display text-3xl font-extrabold text-register-fg">
              アカウント作成
            </h1>
            <p className="text-sm text-register-muted">
              すでにアカウントをお持ちの方は{" "}
              <button
                type="button"
                onClick={login}
                className="font-semibold text-register-primary transition-opacity hover:opacity-70"
              >
                ログイン
              </button>
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <SnsButton icon={<GoogleIcon />} label="Google" />
            <SnsButton icon={<XIcon />} label="X (Twitter)" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-register-border" />
            <span className="px-1 text-xs font-medium text-register-muted">
              またはメールで登録
            </span>
            <div className="h-px flex-1 bg-register-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <Field
              label="表示名"
              id="displayName"
              type="text"
              placeholder="ゲーマータグ / ニックネーム"
              value={displayName}
              onChange={(value) => {
                setDisplayName(value);
                setErrors((current) => ({ ...current, displayName: undefined }));
              }}
              error={errors.displayName}
              icon={<UserIcon />}
            />

            <Field
              label="メールアドレス"
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              error={errors.email}
              icon={<EnvelopeIcon />}
            />

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-register-fg"
              >
                パスワード
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-register-muted">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="8文字以上"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  className={`w-full rounded-xl border-[1.5px] bg-register-card py-3 pr-11 pl-10 font-body text-sm text-register-fg outline-none transition-all placeholder:text-register-muted/70 focus:border-register-primary ${
                    errors.password
                      ? "border-register-error"
                      : "border-register-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((current) => !current)}
                  className="absolute top-1/2 right-3.5 -translate-y-1/2 text-register-muted transition-opacity hover:opacity-60"
                  aria-label={showPass ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {password.length > 0 ? (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          strength >= level
                            ? STRENGTH_CLASS[strength].split(" ")[0]
                            : "bg-register-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-xs font-medium ${STRENGTH_CLASS[strength].split(" ")[1]}`}
                  >
                    {STRENGTH_LABEL[strength]}
                  </span>
                </div>
              ) : null}
              {errors.password ? (
                <p className="mt-1.5 text-xs text-register-error">
                  {errors.password}
                </p>
              ) : null}
            </div>

            <div>
              <label className="group flex cursor-pointer items-start gap-3">
                <span className="relative mt-0.5 h-5 w-5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => {
                      setAgreed(event.target.checked);
                      setErrors((current) => ({ ...current, agreed: undefined }));
                    }}
                    className="absolute inset-0 z-10 h-5 w-5 cursor-pointer opacity-0"
                  />
                  <span
                    className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded transition-all duration-150 ${
                      agreed
                        ? "border-2 border-register-primary bg-register-primary"
                        : errors.agreed
                          ? "border-2 border-register-error bg-register-card"
                          : "border-2 border-register-border bg-register-card"
                    }`}
                  >
                    {agreed ? <CheckIcon /> : null}
                  </span>
                </span>
                <span className="text-sm leading-snug text-register-secondary">
                  <a
                    href="#"
                    className="font-semibold text-register-primary transition-opacity hover:opacity-70"
                  >
                    利用規約
                  </a>
                  {" および "}
                  <a
                    href="#"
                    className="font-semibold text-register-primary transition-opacity hover:opacity-70"
                  >
                    プライバシーポリシー
                  </a>
                  に同意します
                </span>
              </label>
              {errors.agreed ? (
                <p className="mt-1.5 ml-8 text-xs text-register-error">
                  {errors.agreed}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#5b3ef5] to-[#7c3aed] py-3.5 font-display text-[15px] font-bold tracking-wide text-white shadow-register-btn transition-all duration-150 disabled:opacity-75 disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <SpinnerIcon />
                  登録中...
                </>
              ) : (
                <>
                  無料でアカウントを作成
                  <ArrowRightIcon />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-register-muted">
            登録することで、確認メールが送信されます。迷惑メールフォルダもご確認ください。
          </p>
        </div>
      </div>
    </div>
  );
}

function GameLogo({ white = false }: { white?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          white
            ? "bg-white/15"
            : "bg-gradient-to-br from-[#5b3ef5] to-[#7c3aed]"
        }`}
      >
        <PlayIcon />
      </div>
      <span
        className={`font-display text-lg font-extrabold tracking-tight ${
          white ? "text-white" : "text-register-fg"
        }`}
      >
        GameLog
      </span>
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
      className="flex items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-register-border bg-register-card py-3 text-sm font-medium text-register-secondary transition-all duration-150 hover:border-[#c4bef8] hover:bg-[#faf9ff] hover:shadow-sm active:scale-95"
    >
      {icon}
      <span className="font-display">{label}</span>
    </button>
  );
}

function Field({
  label,
  id,
  type,
  placeholder,
  value,
  onChange,
  error,
  icon,
}: {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-register-fg"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-register-muted">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-xl border-[1.5px] bg-register-card py-3 pr-4 pl-10 font-body text-sm text-register-fg outline-none transition-all placeholder:text-register-muted/70 focus:border-register-primary ${
            error ? "border-register-error" : "border-register-border"
          }`}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-register-error">{error}</p>
      ) : null}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width={18} height={18} viewBox="0 0 24 24" fill="#1DA1F2" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width={16}
      height={16}
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

function EyeOffIcon() {
  return (
    <svg
      width={16}
      height={16}
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

function CheckIcon() {
  return (
    <svg
      width={11}
      height={11}
      viewBox="0 0 12 12"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
