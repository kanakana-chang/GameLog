import type { Metadata } from "next";
import { AccountSettings } from "@/components/account-settings/account-settings";

export const metadata: Metadata = {
  title: "アカウント設定 | GameLog",
  description: "プロフィール情報・セキュリティ設定を管理できます",
};

type SettingsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { tab } = await searchParams;
  const initialTab =
    tab === "password" || tab === "danger" ? tab : "profile";

  return <AccountSettings initialTab={initialTab} />;
}
