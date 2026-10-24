import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/reset-password/reset-password-form";
import { getSessionUser, hasPasswordRecovery } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "パスワード再設定 | GameLog",
  description: "新しいパスワードを設定します",
};

export default async function ResetPasswordPage() {
  const user = await getSessionUser();
  const recovery = await hasPasswordRecovery();

  if (user && !recovery) {
    redirect("/settings?tab=password");
  }

  return <ResetPasswordForm expired={!user || !recovery} />;
}
