import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard/admin-dashboard";
import { INITIAL_GAMES, type AdminReport } from "@/components/admin-dashboard/data";
import { getSessionUser } from "@/lib/auth";
import { getAdminGamesFromDb } from "@/lib/games";
import { listAdminReports } from "@/lib/reports";

export const metadata: Metadata = {
  title: "管理コンソール | GameLog",
  description: "ゲームタイトルと通報の管理",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let games = INITIAL_GAMES;
  let reports: AdminReport[] = [];
  try {
    games = await getAdminGamesFromDb();
  } catch (error) {
    console.error("Failed to load admin games from database", error);
  }
  try {
    const user = await getSessionUser();
    if (user?.isAdmin) {
      reports = await listAdminReports();
    }
  } catch (error) {
    console.error("Failed to load admin reports from database", error);
  }

  return <AdminDashboard initialGames={games} initialReports={reports} />;
}
