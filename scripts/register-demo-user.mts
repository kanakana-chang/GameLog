import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });
config({ path: ".env.local" });

const email = (process.env.DEMO_EMAIL ?? "gamelog.dev+demo@gmail.com").trim();
const password = process.env.DEMO_PASSWORD ?? "Demopass1";
const displayName = (process.env.DEMO_DISPLAY_NAME ?? "デモユーザー").trim();
const preferredUsername = (process.env.DEMO_USERNAME ?? "demo").trim();

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase の環境変数が設定されていません");
}

const { prisma } = await import("../src/lib/prisma");

async function ensureProfile(userId: string) {
  const existing = await prisma.profiles.findUnique({ where: { id: userId } });
  if (existing) {
    if (existing.role === "admin") {
      throw new Error("このメールアドレスは管理者アカウントです");
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
          display_name: displayName.slice(0, 50),
          role: "user",
        },
      });
    } catch (error) {
      username = `demo_${Math.random().toString(36).slice(2, 8)}`.slice(0, 30);
      if (attempt === 5) throw error;
    }
  }
  throw new Error("ユーザー名の確保に失敗しました");
}

async function confirmEmail(userId: string) {
  const authUser = await prisma.users.findUnique({ where: { id: userId } });
  if (!authUser) throw new Error("ユーザーが見つかりません");
  if (authUser.email_confirmed_at) return;
  await prisma.users.update({
    where: { id: userId },
    data: { email_confirmed_at: new Date() },
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);
let userId = "";

const existing = await prisma.users.findFirst({
  where: { email },
});

if (existing) {
  userId = existing.id;
} else {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        username: preferredUsername,
      },
    },
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "デモアカウントの作成に失敗しました");
  }
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error("このメールアドレスは既に登録されています");
  }
  userId = data.user.id;
}

const profile = await ensureProfile(userId);
await confirmEmail(userId);

const login = await supabase.auth.signInWithPassword({ email, password });
if (login.error || !login.data.user) {
  throw new Error(login.error?.message ?? "デモアカウントのログイン確認に失敗しました");
}

console.log(
  JSON.stringify({
    ok: true,
    email,
    displayName: profile.display_name,
    username: profile.username,
    role: profile.role,
    canLogin: true,
  }),
);
