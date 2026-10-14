import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-error";
import { parseRegisterInput, registerUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function confirmRedirectUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.origin}/auth/callback`;
}

export async function POST(request: Request) {
  try {
    const result = await registerUser(
      parseRegisterInput(await request.json()),
      confirmRedirectUrl(request),
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to register user", error);
    return jsonError(error, "アカウントの作成に失敗しました");
  }
}
