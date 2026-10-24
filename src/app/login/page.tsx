import type { Metadata } from "next";
import { LoginForm } from "@/components/login/login-form";

export const metadata: Metadata = {
  title: "ログイン | GameLog",
  description: "GameLogアカウントにサインインして、プレイ記録を続けましょう",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reset?: string; deleted?: string }>;
}) {
  const { error, reset, deleted } = await searchParams;
  return (
    <LoginForm
      initialView={reset === "1" ? "reset" : "login"}
      initialNotice={
        deleted === "1" ? "アカウントを削除しました。" : ""
      }
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
