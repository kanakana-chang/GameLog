import type { Metadata } from "next";
import { LoginForm } from "@/components/login/login-form";

export const metadata: Metadata = {
  title: "ログイン | GameLog",
  description: "GameLogアカウントにサインインして、プレイ記録を続けましょう",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string }>;
}) {
  const { error, reset } = await searchParams;
  return (
    <LoginForm
      initialView={reset === "1" ? "reset" : "login"}
      initialError={
        error === "oauth"
          ? "ソーシャルログインに失敗しました。時間をおいて再度お試しください。"
          : error === "reset"
            ? "リセットリンクが無効か期限切れです。もう一度リセットを申請してください。"
            : ""
      }
    />
  );
}
