import { NextResponse } from "next/server";
import {
  OAUTH_ERROR_MESSAGE,
  parseOAuthProvider,
  safeAppPath,
  startOAuthLogin,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const url = new URL(request.url);
  const returnTo = safeAppPath(url.searchParams.get("return"), "/login");
  try {
    const { provider } = await params;
    const next = safeAppPath(url.searchParams.get("next"), "/");
    const redirectTo = `${url.origin}/auth/callback?next=${encodeURIComponent(next)}&return=${encodeURIComponent(returnTo)}`;
    const oauthUrl = await startOAuthLogin(parseOAuthProvider(provider), redirectTo);
    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    console.error("Failed to start OAuth", error);
    const dest = new URL(returnTo, request.url);
    dest.searchParams.set("error", "oauth");
    dest.searchParams.set("message", OAUTH_ERROR_MESSAGE);
    return NextResponse.redirect(dest);
  }
}
