import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { requireAdminUser } from "@/lib/auth";
import { parseReportStatus, updateReportStatus } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const report = await updateReportStatus(
      id,
      parseReportStatus(await request.json()),
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to update report status", error);
    return jsonError(error, "通報の更新に失敗しました");
  }
}
