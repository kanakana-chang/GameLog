import type { Metadata } from "next";
import { LoginForm } from "@/components/login/login-form";

export const metadata: Metadata = {
  title: "ログイン | GameLog",
  description: "GameLogアカウントにサインインして、プレイ記録を続けましょう",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <LoginForm
      initialError={
        error === "oauth"
          ? "ソーシャルログインに失敗しました。時間をおいて再度お試しください。"
          : ""
      }
    />
  );
}
