import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { loginUser, parseLoginInput } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await loginUser(parseLoginInput(await request.json()));
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Failed to login", error);
    return jsonError(error, "ログインに失敗しました");
  }
}
