import { prisma } from "@/lib/prisma";

export async function grantAdminRole(userId: string) {
  const profile = await prisma.profiles.findUnique({ where: { id: userId } });
  if (!profile) throw new Error("プロフィールが見つかりません");

  await prisma.profiles.update({
    where: { id: userId },
    data: { role: "admin" },
  });

  const authUser = await prisma.users.findUnique({ where: { id: userId } });
  if (!authUser) throw new Error("ユーザーが見つかりません");

  const meta =
    authUser.raw_app_meta_data &&
    typeof authUser.raw_app_meta_data === "object" &&
    !Array.isArray(authUser.raw_app_meta_data)
      ? (authUser.raw_app_meta_data as Record<string, unknown>)
      : {};

  await prisma.users.update({
    where: { id: userId },
    data: {
      email_confirmed_at: authUser.email_confirmed_at ?? new Date(),
      raw_app_meta_data: { ...meta, role: "admin", is_admin: true },
    },
  });
}
