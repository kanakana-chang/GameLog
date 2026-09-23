import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard/admin-dashboard";

export const metadata: Metadata = {
  title: "管理コンソール | GameLog",
  description: "ゲームタイトルと通報の管理",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
