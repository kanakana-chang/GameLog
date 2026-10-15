import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });
config({ path: ".env.local" });

const email = process.env.ADMIN_EMAIL?.trim() ?? "";
const password = process.env.ADMIN_PASSWORD ?? "";
const displayName = (process.env.ADMIN_DISPLAY_NAME ?? "管理者").trim();
const preferredUsername = (process.env.ADMIN_USERNAME ?? "admin").trim();

if (!email || !password) {
  throw new Error("ADMIN_EMAIL と ADMIN_PASSWORD を指定してください");
}

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase の環境変数が設定されていません");
}

const { prisma } = await import("../src/lib/prisma");
const { grantAdminRole } = await import("../src/lib/admin-users");

async function ensureProfile(userId: string) {
  const existing = await prisma.profiles.findUnique({ where: { id: userId } });
  if (existing) return existing;

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
      username = `admin_${Math.random().toString(36).slice(2, 8)}`.slice(0, 30);
      if (attempt === 5) throw error;
    }
  }
  throw new Error("ユーザー名の確保に失敗しました");
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
    throw new Error(error?.message ?? "管理者アカウントの作成に失敗しました");
  }
  if (data.user.identities && data.user.identities.length === 0) {
    throw new Error("このメールアドレスは既に登録されています");
  }
  userId = data.user.id;
}

await ensureProfile(userId);
await grantAdminRole(userId);

const profile = await prisma.profiles.findUnique({ where: { id: userId } });
console.log(
  JSON.stringify({
    ok: true,
    email,
    displayName: profile?.display_name,
    username: profile?.username,
    role: profile?.role,
  }),
);
