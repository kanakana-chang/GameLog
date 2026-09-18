import type { Metadata } from "next";
import { RegisterForm } from "@/components/register/register-form";

export const metadata: Metadata = {
  title: "新規登録 | GameLog",
  description: "GameLogの無料アカウントを作成して、プレイ記録を始めましょう",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
