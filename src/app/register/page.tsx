import type { Metadata } from "next";
import { RegisterForm } from "@/components/register/register-form";

export const metadata: Metadata = {
  title: "新規登録 | GameLog",
  description: "GameLogの無料アカウントを作成して、プレイ記録を始めましょう",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <RegisterForm
      initialError={
        error === "oauth"
          ? "ソーシャルログインに失敗しました。時間をおいて再度お試しください。"
          : ""
      }
    />
  );
}
