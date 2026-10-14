import type { User } from "@supabase/supabase-js";
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

function isAdminUser(user: User) {
  const meta = user.app_metadata ?? {};
  if (meta.role === "admin" || meta.is_admin === true) return true;
  if (user.role === "admin") return true;
  const email = user.email?.toLowerCase();
  return Boolean(email && adminEmails().includes(email));
}

function avatarSrcFrom(url: string | null | undefined) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return url;
  } catch {
    return "";
  }
  return "";
}

async function toAuthUser(user: User): Promise<AuthUser> {
  const displayName = displayNameFromUser(user);
  const profile = await ensureProfile(
    user.id,
    displayName,
    usernameFromUser(user, displayName),
    avatarFromUser(user),
  );

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: profile.display_name,
    username: profile.username,
    avatarSrc: avatarSrcFrom(profile.avatar_url) || avatarFromUser(user),
    isAdmin: isAdminUser(user),
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
