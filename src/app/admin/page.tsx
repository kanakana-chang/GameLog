import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard/admin-dashboard";
import { INITIAL_GAMES } from "@/components/admin-dashboard/data";
import { getAdminGamesFromDb } from "@/lib/games";

export const metadata: Metadata = {
  title: "管理コンソール | GameLog",
  description: "ゲームタイトルと通報の管理",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let games = INITIAL_GAMES;
  try {
    games = await getAdminGamesFromDb();
  } catch (error) {
    console.error("Failed to load admin games from database", error);
  }

  return <AdminDashboard initialGames={games} />;
}
