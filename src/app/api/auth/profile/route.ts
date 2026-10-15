import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { parseProfileForm, updateProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const form = await request.formData();
    const avatar = form.get("avatar");
    const result = await updateProfile(
      parseProfileForm(form),
      avatar instanceof File && avatar.size > 0 ? avatar : null,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update profile", error);
    return jsonError(error, "プロフィールの保存に失敗しました");
  }
}
