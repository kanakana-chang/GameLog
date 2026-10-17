import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireSessionUser } from "@/lib/auth";
import { createReport, parseReportInput } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const report = await createReport(
      parseReportInput(await request.json()),
      user.id,
    );
    return NextResponse.json({ id: report.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create report", error);
    return jsonError(error, "通報の送信に失敗しました");
  }
}
