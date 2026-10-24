import { NextResponse } from "next/server";
import {
  getSessionUser,
  markPasswordRecovery,
  safeAppPath,
} from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function isRecoveryFlow(type: string | null, next: string) {
  return type === "recovery" || next.startsWith("/reset-password");
}

async function finishAuth(request: Request, next: string, recovery: boolean) {
  await getSessionUser();
  if (recovery) {
    await markPasswordRecovery();
    return redirectTo(request, next === "/" ? "/reset-password" : next);
  }
  return redirectTo(request, next);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeAppPath(url.searchParams.get("next"), "/");
  const returnTo = safeAppPath(url.searchParams.get("return"), "/login");
  const recovery = isRecoveryFlow(type, next);
  const failError = recovery ? "reset" : "oauth";
  const supabase = await createClient();

  if (url.searchParams.get("error")) {
    return redirectTo(request, `${returnTo}?error=${failError}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return finishAuth(request, next, recovery);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as
        | "signup"
        | "email"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change",
      token_hash: tokenHash,
    });
    if (!error) {
      return finishAuth(request, next, recovery);
    }
  }

  return redirectTo(request, `${returnTo}?error=${failError}`);
}
