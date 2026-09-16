"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { DeleteDialog } from "./delete-dialog";
import { FormField } from "./form-field";
import { PasswordField } from "./password-field";
import { PasswordStrength } from "./password-strength";

type Tab = "profile" | "password" | "danger";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "profile", label: "プロフィール", icon: "👤" },
  { id: "password", label: "パスワード", icon: "🔒" },
  { id: "danger", label: "アカウント削除", icon: "⚠️" },
];

const DELETED_DATA = [
  "プロフィール情報・アバター画像",
  "クリア実績・プレイ時間の記録",
  "スクリーンショット・レビュー投稿",
  "フォロー・フォロワー関係",
  "ウィッシュリスト・ゲームコレクション",
];

export function AccountSettings({
  initialTab = "profile",
}: {
  initialTab?: Tab;
}) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    username: "StarHunter_Ryota",
    displayName: "龍太",
    email: "ryota.k@gmail.com",
    bio: "Nintendo Switch と FPS が好き。無課金でも楽しめるゲームを中心にプレイ中。",
    favoriteGenre: "RPG / ガチャ",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [accountDeleted, setAccountDeleted] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarSrc(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = (event: React.FormEvent) => {
    event.preventDefault();
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2500);
  };

  const handlePasswordSave = (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    if (passwords.newPass !== passwords.confirm) {
      setPasswordError("新しいパスワードが一致しません。");
      return;
    }
    if (passwords.newPass.length < 8) {
      setPasswordError("パスワードは8文字以上で設定してください。");
      return;
    }
    setPasswordSaved(true);
    setPasswords({ current: "", newPass: "", confirm: "" });
    window.setTimeout(() => setPasswordSaved(false), 2500);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmText("");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === "退会する") {
      closeDeleteDialog();
      setAccountDeleted(true);
    }
  };

  if (accountDeleted) {
    return (
      <div className="flex min-h-full items-center justify-center px-6">
        <p className="font-display text-lg font-semibold text-heading">
          アカウントを削除しました。
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg font-body text-heading">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <Link
            href="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-fg"
            aria-label="マイページへ戻る"
          >
            G
          </Link>
          <span className="text-sm font-medium text-muted">/</span>
          <span className="text-sm font-semibold text-heading">アカウント設定</span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-1 font-display text-2xl font-bold tracking-tight text-heading">
            アカウント設定
          </h1>
          <p className="text-sm text-muted">
            プロフィール情報・セキュリティ設定を管理できます
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <nav className="shrink-0 md:w-52">
            <ul className="flex flex-row gap-1 md:flex-col">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === "danger";

                return (
                  <li key={tab.id} className="flex-1 md:flex-none">
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-body text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? isDanger
                            ? "bg-danger-soft text-danger"
                            : "bg-primary-soft text-primary"
                          : "bg-transparent text-label"
                      }`}
                    >
                      <span className="text-base leading-none">{tab.icon}</span>
                      <span className="hidden md:inline">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">
            {activeTab === "profile" && (
              <section className="rounded-xl border border-border bg-surface p-6">
                <h2 className="mb-5 font-display text-base font-semibold text-heading">
                  プロフィール編集
                </h2>

                <div className="mb-6 flex items-center gap-4 border-b border-border pb-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-softer">
                    {avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                      <img
                        src={avatarSrc}
                        alt="プロフィール画像"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl leading-none">🎮</span>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-heading">
                      プロフィール画像
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-label transition-colors duration-150 hover:bg-bg"
                    >
                      画像を変更
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <p className="mt-1.5 text-xs text-muted">
                      JPG・PNG・GIF（最大 2MB）
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      label="ユーザー名"
                      id="username"
                      value={profile.username}
                      onChange={(value) =>
                        setProfile({ ...profile, username: value })
                      }
                      placeholder="例: StarHunter_Ryota"
                      hint="ゲームログイン ID"
                    />
                    <FormField
                      label="表示名"
                      id="displayName"
                      value={profile.displayName}
                      onChange={(value) =>
                        setProfile({ ...profile, displayName: value })
                      }
                      placeholder="例: 龍太"
                    />
                  </div>
                  <FormField
                    label="メールアドレス"
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(value) => setProfile({ ...profile, email: value })}
                    placeholder="example@email.com"
                  />
                  <FormField
                    label="好きなジャンル"
                    id="genre"
                    value={profile.favoriteGenre}
                    onChange={(value) =>
                      setProfile({ ...profile, favoriteGenre: value })
                    }
                    placeholder="例: RPG / ガチャ"
                  />
                  <div>
                    <label
                      htmlFor="bio"
                      className="mb-1.5 block text-xs font-medium text-label"
                    >
                      自己紹介
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={profile.bio}
                      onChange={(event) =>
                        setProfile({ ...profile, bio: event.target.value })
                      }
                      placeholder="ゲームの楽しみ方や好きなタイトルを教えてください"
                      className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 font-body text-sm text-heading outline-none transition-all duration-150 placeholder:text-muted/70 focus:border-primary focus:shadow-focus-primary"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-fg transition-all duration-150 hover:bg-primary-hover"
                    >
                      変更を保存
                    </button>
                    {profileSaved ? (
                      <span className="text-xs font-medium text-success">
                        ✓ 保存しました
                      </span>
                    ) : null}
                  </div>
                </form>
              </section>
            )}

            {activeTab === "password" && (
              <section className="rounded-xl border border-border bg-surface p-6">
                <h2 className="mb-1 font-display text-base font-semibold text-heading">
                  パスワード変更
                </h2>
                <p className="mb-6 text-xs text-muted">
                  定期的なパスワードの変更でアカウントを守りましょう
                </p>

                <form
                  onSubmit={handlePasswordSave}
                  className="max-w-md space-y-4"
                >
                  <PasswordField
                    label="現在のパスワード"
                    id="current"
                    value={passwords.current}
                    onChange={(value) =>
                      setPasswords({ ...passwords, current: value })
                    }
                    show={showCurrentPass}
                    onToggle={() => setShowCurrentPass((current) => !current)}
                  />
                  <PasswordField
                    label="新しいパスワード"
                    id="new"
                    value={passwords.newPass}
                    onChange={(value) =>
                      setPasswords({ ...passwords, newPass: value })
                    }
                    show={showNewPass}
                    onToggle={() => setShowNewPass((current) => !current)}
                    hint="8文字以上で設定してください"
                  />
                  <PasswordField
                    label="新しいパスワード（確認）"
                    id="confirm"
                    value={passwords.confirm}
                    onChange={(value) =>
                      setPasswords({ ...passwords, confirm: value })
                    }
                    show={showConfirmPass}
                    onToggle={() => setShowConfirmPass((current) => !current)}
                  />

                  {passwords.newPass.length > 0 ? (
                    <PasswordStrength value={passwords.newPass} />
                  ) : null}

                  {passwordError ? (
                    <p className="text-xs font-medium text-danger">{passwordError}</p>
                  ) : null}

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-fg transition-all duration-150 hover:bg-primary-hover"
                    >
                      パスワードを変更
                    </button>
                    {passwordSaved ? (
                      <span className="text-xs font-medium text-success">
                        ✓ 変更しました
                      </span>
                    ) : null}
                  </div>
                </form>
              </section>
            )}

            {activeTab === "danger" && (
              <section className="rounded-xl border border-danger-border bg-surface p-6">
                <h2 className="mb-1 font-display text-base font-semibold text-danger">
                  アカウント削除（退会）
                </h2>
                <p className="mb-6 text-xs text-muted">
                  この操作は取り消しできません。慎重にご確認ください。
                </p>

                <div className="mb-6 rounded-lg border border-danger-border bg-danger-tint p-4 text-sm">
                  <p className="mb-2 text-sm font-semibold text-danger-heading">
                    削除されるデータ
                  </p>
                  <ul className="space-y-1.5 text-xs text-danger-body">
                    {DELETED_DATA.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="rounded-lg bg-danger px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-danger-hover"
                >
                  アカウントを削除する
                </button>
              </section>
            )}
          </div>
        </div>
      </div>

      {showDeleteDialog ? (
        <DeleteDialog
          confirmText={deleteConfirmText}
          onConfirmTextChange={setDeleteConfirmText}
          onCancel={closeDeleteDialog}
          onConfirm={handleDeleteAccount}
        />
      ) : null}
    </div>
  );
}
