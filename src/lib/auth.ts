import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import type { AuthUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export type { AuthUser } from "@/lib/auth-user";

export type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
  agreed: boolean;
};

export type RegisterResult = {
  email: string;
  displayName: string;
  session: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ProfileUpdateInput = {
  username: string;
  displayName: string;
  email: string;
  aboutText: string;
  favoriteGenre: string;
};

export const OAUTH_PROVIDERS = ["google", "twitter"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export const OAUTH_ERROR_MESSAGE =
  "ソーシャルログインに失敗しました。時間をおいて再度お試しください。";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object") {
    throw new Error("送信内容が正しくありません");
  }
  return body as Record<string, unknown>;
}

function randomSuffix(length: number) {
  return Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/g, "")
    .slice(0, length)
    .padEnd(length, "0");
}

export function slugUsername(displayName: string) {
  const ascii = displayName
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
  if (ascii.length >= 3) return ascii;
  return `user_${randomSuffix(8)}`;
}

export function parseRegisterInput(body: unknown): RegisterInput {
  const record = asRecord(body);
  const displayName =
    typeof record.displayName === "string" ? record.displayName.trim() : "";
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const password = typeof record.password === "string" ? record.password : "";
  const agreed = record.agreed === true;

  if (!displayName) throw new Error("表示名を入力してください");
  if (displayName.length > 50) {
    throw new Error("表示名は50文字以内で入力してください");
  }
  if (!EMAIL_RE.test(email)) {
    throw new Error("有効なメールアドレスを入力してください");
  }
  if (email.length > 255) {
    throw new Error("メールアドレスが正しくありません");
  }
  if (password.length < 8) {
    throw new Error("パスワードは8文字以上で入力してください");
  }
  if (password.length > 72) {
    throw new Error("パスワードが正しくありません");
  }
  if (!agreed) throw new Error("利用規約への同意が必要です");

  return { displayName, email, password, agreed };
}

export function parseLoginInput(body: unknown): LoginInput {
  const record = asRecord(body);
  const email = typeof record.email === "string" ? record.email.trim() : "";
  const password = typeof record.password === "string" ? record.password : "";
  if (!EMAIL_RE.test(email)) {
    throw new Error("有効なメールアドレスを入力してください");
  }
  if (!password) throw new Error("パスワードを入力してください");
  return { email, password };
}

export function parseResetInput(body: unknown) {
  const record = asRecord(body);
  const email = typeof record.email === "string" ? record.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    throw new Error("有効なメールアドレスを入力してください");
  }
  return { email };
}

export type PasswordChangeInput = {
  currentPassword: string;
  password: string;
  confirm: string;
};

export type PasswordResetCompleteInput = {
  password: string;
  confirm: string;
};

export const PASSWORD_RECOVERY_COOKIE = "gl_pw_recovery";
const PASSWORD_RECOVERY_MAX_AGE = 15 * 60;

function assertNewPassword(password: string, confirm: string) {
  if (password.length < 8 || password.length > 72) {
    throw new Error("パスワードは8文字以上で入力してください");
  }
  if (password !== confirm) {
    throw new Error("新しいパスワードが一致しません");
  }
}

export function parsePasswordChangeInput(body: unknown): PasswordChangeInput {
  const record = asRecord(body);
  const currentPassword =
    typeof record.currentPassword === "string" ? record.currentPassword : "";
  const password = typeof record.password === "string" ? record.password : "";
  const confirm = typeof record.confirm === "string" ? record.confirm : "";
  if (!currentPassword) {
    throw new Error("現在のパスワードを入力してください");
  }
  assertNewPassword(password, confirm);
  if (currentPassword === password) {
    throw new Error("現在のパスワードと異なるパスワードを入力してください");
  }
  return { currentPassword, password, confirm };
}

export function parsePasswordResetCompleteInput(
  body: unknown,
): PasswordResetCompleteInput {
  const record = asRecord(body);
  const password = typeof record.password === "string" ? record.password : "";
  const confirm = typeof record.confirm === "string" ? record.confirm : "";
  assertNewPassword(password, confirm);
  return { password, confirm };
}

function recoveryCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PASSWORD_RECOVERY_MAX_AGE,
  };
}

export async function markPasswordRecovery() {
  const cookieStore = await cookies();
  cookieStore.set(PASSWORD_RECOVERY_COOKIE, "1", recoveryCookieOptions());
}

export async function hasPasswordRecovery() {
  const cookieStore = await cookies();
  return cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value === "1";
}

async function consumePasswordRecovery() {
  const allowed = await hasPasswordRecovery();
  if (allowed) {
    const cookieStore = await cookies();
    cookieStore.set(PASSWORD_RECOVERY_COOKIE, "", {
      ...recoveryCookieOptions(),
      maxAge: 0,
    });
  }
  return allowed;
}

export async function changePassword(input: PasswordChangeInput) {
  await requireSessionUser();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) {
    throw new Error("ログインしてください");
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: input.currentPassword,
  });
  if (verifyError) {
    throw new Error("現在のパスワードが正しくありません");
  }

  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });
  if (error) {
    mapAuthError(error.message, "パスワードの変更に失敗しました");
  }
}

export async function completePasswordReset(input: PasswordResetCompleteInput) {
  await requireSessionUser();
  const allowed = await consumePasswordRecovery();
  if (!allowed) {
    throw new Error("リセットリンクの有効期限が切れています");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });
  if (error) {
    await markPasswordRecovery();
    mapAuthError(error.message, "パスワードの変更に失敗しました");
  }
}

function formText(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function parseProfileForm(form: FormData): ProfileUpdateInput {
  const username = formText(form, "username");
  const displayName = formText(form, "displayName");
  const email = formText(form, "email");
  const aboutText = formText(form, "aboutText");
  const favoriteGenre = formText(form, "favoriteGenre");

  if (!username) throw new Error("ユーザー名を入力してください");
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    throw new Error(
      "ユーザー名は3〜30文字の半角英数字と_で入力してください",
    );
  }
  if (!displayName) throw new Error("表示名を入力してください");
  if (displayName.length > 50) {
    throw new Error("表示名は50文字以内で入力してください");
  }
  if (!EMAIL_RE.test(email)) {
    throw new Error("有効なメールアドレスを入力してください");
  }
  if (email.length > 255) {
    throw new Error("メールアドレスが正しくありません");
  }
  if (favoriteGenre.length > 50) {
    throw new Error("好きなジャンルは50文字以内で入力してください");
  }
  if (aboutText.length > 1000) {
    throw new Error("自己紹介は1000文字以内で入力してください");
  }

  return { username, displayName, email, aboutText, favoriteGenre };
}

export function parseOAuthProvider(value: string): OAuthProvider {
  if (value === "google" || value === "twitter") return value;
  throw new Error("未対応のログイン方法です");
}

export function safeAppPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

function metaString(meta: Record<string, unknown>, key: string) {
  const value = meta[key];
  return typeof value === "string" ? value.trim() : "";
}

function displayNameFromUser(user: User) {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [
    metaString(meta, "display_name"),
    metaString(meta, "full_name"),
    metaString(meta, "name"),
    metaString(meta, "preferred_username"),
    metaString(meta, "user_name"),
    metaString(meta, "username"),
  ];
  const name = candidates.find((item) => item.length > 0);
  return (name || user.email?.split("@")[0] || "ゲスト").slice(0, 50);
}

function usernameFromUser(user: User, displayName: string) {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [
    metaString(meta, "preferred_username"),
    metaString(meta, "user_name"),
    metaString(meta, "username"),
  ];
  for (const candidate of candidates) {
    const slug = slugUsername(candidate);
    if (slug.length >= 3 && !slug.startsWith("user_")) return slug;
  }
  return slugUsername(displayName);
}

function avatarFromUser(user: User) {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return avatarSrcFrom(
    metaString(meta, "avatar_url") || metaString(meta, "picture"),
  );
}

function isUniqueViolation(error: unknown, field: string) {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }
  const target = error.meta?.target;
  if (Array.isArray(target)) return target.includes(field);
  return typeof target === "string" && target.includes(field);
}

function isAlreadyRegistered(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("already registered") ||
    lower.includes("already exists") ||
    lower.includes("user already") ||
    message.includes("既に登録")
  );
}

async function ensureProfile(
  userId: string,
  displayName: string,
  preferredUsername: string,
  avatarUrl?: string,
) {
  const existing = await prisma.profiles.findUnique({ where: { id: userId } });
  if (existing) {
    const data: { is_deleted?: boolean; avatar_url?: string } = {};
    if (existing.is_deleted) data.is_deleted = false;
    if (!existing.avatar_url && avatarUrl) data.avatar_url = avatarUrl;
    if (Object.keys(data).length > 0) {
      return prisma.profiles.update({ where: { id: userId }, data });
    }
    return existing;
  }

  let username = preferredUsername.slice(0, 30);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await prisma.profiles.create({
        data: {
          id: userId,
          username,
          display_name: displayName,
          avatar_url: avatarUrl || null,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error, "username")) {
        username = `${preferredUsername.slice(0, 20)}_${randomSuffix(6)}`.slice(
          0,
          30,
        );
        continue;
      }
      throw error;
    }
  }

  throw new Error("ユーザー名の確保に失敗しました");
}

export async function registerUser(
  input: RegisterInput,
  emailRedirectTo: string,
): Promise<RegisterResult> {
  const supabase = await createClient();
  const username = slugUsername(input.displayName);
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.displayName,
        username,
      },
      emailRedirectTo,
    },
  });

  if (error) {
    if (isAlreadyRegistered(error.message)) {
      throw new Error("このメールアドレスは既に登録されています");
    }
    const lower = error.message.toLowerCase();
    if (lower.includes("invalid") && lower.includes("email")) {
      throw new Error("有効なメールアドレスを入力してください");
    }
    if (
      lower.includes("rate limit") ||
      lower.includes("only request this after") ||
      lower.includes("security purposes")
    ) {
      throw new Error(
        "確認メールの送信上限に達しました。しばらくしてから再度お試しください。",
      );
    }
    if (error.message.toLowerCase().includes("password")) {
      throw new Error("パスワードは8文字以上で入力してください");
    }
    console.error("Supabase signUp failed", error.message);
    throw new Error("アカウントの作成に失敗しました");
  }

  const user = data.user;
  if (!user) {
    throw new Error("アカウントの作成に失敗しました");
  }

  if (user.identities && user.identities.length === 0) {
    throw new Error("このメールアドレスは既に登録されています");
  }

  await ensureProfile(user.id, input.displayName, username);

  return {
    email: input.email,
    displayName: input.displayName,
    session: Boolean(data.session),
  };
}

function mapAuthError(message: string, fallback: string) {
  const lower = message.toLowerCase();
  if (isAlreadyRegistered(message)) {
    throw new Error("このメールアドレスは既に登録されています");
  }
  if (lower.includes("email not confirmed") || lower.includes("not confirmed")) {
    throw new Error("メールアドレスの確認が完了していません");
  }
  if (
    lower.includes("invalid login") ||
    lower.includes("invalid credentials") ||
    lower.includes("invalid email or password")
  ) {
    throw new Error("メールアドレスまたはパスワードが正しくありません");
  }
  if (
    lower.includes("should be different") ||
    lower.includes("same password") ||
    lower.includes("different from the old")
  ) {
    throw new Error("現在のパスワードと異なるパスワードを入力してください");
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    throw new Error("有効なメールアドレスを入力してください");
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("only request this after") ||
    lower.includes("security purposes")
  ) {
    throw new Error(
      "確認メールの送信上限に達しました。しばらくしてから再度お試しください。",
    );
  }
  if (lower.includes("password")) {
    throw new Error("パスワードは8文字以上で入力してください");
  }
  console.error("Supabase auth failed", message);
  throw new Error(fallback);
}

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUser(user: User, profileRole?: string) {
  if (profileRole === "admin") return true;
  const meta = user.app_metadata ?? {};
  if (meta.role === "admin" || meta.is_admin === true) return true;
  if (user.role === "admin") return true;
  const email = user.email?.toLowerCase();
  return Boolean(email && adminEmails().includes(email));
}

function avatarSrcFrom(url: string | null | undefined) {
  if (!url) return "";
  if (url.startsWith("data:image/")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return "";
  }
  return "";
}

function decodeAboutMeta(about: string | null | undefined) {
  const raw = about ?? "";
  const match = raw.match(/^<!--gl:(.*?)-->\n?([\s\S]*)$/);
  if (!match) return { text: raw, genre: "" };
  try {
    const meta = JSON.parse(match[1]) as { genre?: unknown };
    return {
      text: match[2] ?? "",
      genre: typeof meta.genre === "string" ? meta.genre : "",
    };
  } catch {
    return { text: raw, genre: "" };
  }
}

function encodeAboutMeta(text: string, genre: string) {
  const trimmedGenre = genre.trim();
  if (!trimmedGenre) return text || null;
  return `<!--gl:${JSON.stringify({ genre: trimmedGenre })}-->\n${text}`;
}

const AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

async function storeAvatar(userId: string, file: File): Promise<string> {
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error("画像は2MB以内で選択してください");
  }
  const type = file.type || "image/jpeg";
  if (!AVATAR_TYPES.has(type)) {
    throw new Error("JPG・PNG・GIFで選択してください");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = type === "image/jpeg" ? "jpg" : type.split("/")[1];
  const path = `${userId}/avatar.${ext}`;
  const supabase = await createClient();
  const { error } = await supabase.storage.from("avatars").upload(path, buffer, {
    contentType: type,
    upsert: true,
  });
  if (!error) {
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }
  console.error("Avatar storage upload failed", error.message);
  return `data:${type};base64,${buffer.toString("base64")}`;
}

async function toAuthUser(user: User): Promise<AuthUser> {
  const displayName = displayNameFromUser(user);
  const profile = await ensureProfile(
    user.id,
    displayName,
    usernameFromUser(user, displayName),
    avatarFromUser(user),
  );
  const about = decodeAboutMeta(profile.about_text);

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: profile.display_name,
    username: profile.username,
    avatarSrc: avatarSrcFrom(profile.avatar_url) || avatarFromUser(user),
    aboutText: about.text,
    favoriteGenre: about.genre,
    isAdmin: isAdminUser(user, profile.role),
  };
}

export async function startOAuthLogin(
  provider: OAuthProvider,
  redirectTo: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) {
    mapAuthError(error?.message ?? "", OAUTH_ERROR_MESSAGE);
    throw new Error(OAUTH_ERROR_MESSAGE);
  }
  return data.url;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return toAuthUser(data.user);
}

export async function requireSessionUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("ログインしてください");
  return user;
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await requireSessionUser();
  if (!user.isAdmin) throw new Error("管理者権限が必要です");
  return user;
}

export { grantAdminRole } from "@/lib/admin-users";

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) mapAuthError(error.message, "ログインに失敗しました");
  if (!data.user) throw new Error("ログインに失敗しました");
  return toAuthUser(data.user);
}

export async function logoutUser() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Supabase signOut failed", error.message);
    throw new Error("ログアウトに失敗しました");
  }
}

export async function updateProfile(
  input: ProfileUpdateInput,
  avatar: File | null,
): Promise<{ user: AuthUser; emailPending: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("ログインしてください");

  const user = data.user;
  const displayName = displayNameFromUser(user);
  await ensureProfile(
    user.id,
    displayName,
    usernameFromUser(user, displayName),
    avatarFromUser(user),
  );
  const avatarUrl = avatar ? await storeAvatar(user.id, avatar) : undefined;
  const aboutText = encodeAboutMeta(input.aboutText, input.favoriteGenre);

  try {
    await prisma.profiles.update({
      where: { id: user.id },
      data: {
        username: input.username,
        display_name: input.displayName,
        about_text: aboutText,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      },
    });
  } catch (updateError) {
    if (isUniqueViolation(updateError, "username")) {
      throw new Error("このユーザー名は既に使われています");
    }
    throw updateError;
  }

  const authUpdate: {
    email?: string;
    data: { display_name: string; username: string };
  } = {
    data: {
      display_name: input.displayName,
      username: input.username,
    },
  };
  const emailPending = input.email !== (user.email ?? "");
  if (emailPending) authUpdate.email = input.email;

  const { error: authError } = await supabase.auth.updateUser(authUpdate);
  if (authError) {
    mapAuthError(authError.message, "プロフィールの保存に失敗しました");
  }

  const updated = await toAuthUser({
    ...user,
    email: emailPending ? user.email : input.email,
    user_metadata: {
      ...user.user_metadata,
      display_name: input.displayName,
      username: input.username,
    },
  });
  return { user: updated, emailPending };
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes("rate limit") ||
      lower.includes("only request this after") ||
      lower.includes("security purposes")
    ) {
      throw new Error(
        "確認メールの送信上限に達しました。しばらくしてから再度お試しください。",
      );
    }
    console.error("Supabase resetPassword failed", error.message);
  }
}
