import type { Metadata } from "next";
import { LoginForm } from "@/components/login/login-form";

export const metadata: Metadata = {
  title: "ログイン | GameLog",
  description: "GameLogアカウントにサインインして、プレイ記録を続けましょう",
};

export default function LoginPage() {
  return <LoginForm />;
}
