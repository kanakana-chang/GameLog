import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireAdminUser } from "@/lib/auth";
import { listAdminReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminUser();
    const reports = await listAdminReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Failed to list admin reports", error);
    return jsonError(error, "通報の取得に失敗しました");
  }
}
