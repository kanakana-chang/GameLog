import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MyPage } from "@/components/my-page/my-page";
import { getSessionUser } from "@/lib/auth";
import { getMyPageContent } from "@/lib/mypage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "マイページ | GameLog",
  description: "自分のゲーム棚とレビューを確認できます",
};

export default async function MyPageRoute() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { games, reviews } = await getMyPageContent(user.id);
  return <MyPage games={games} reviews={reviews} />;
}
