import { NextResponse } from "next/server";
import { getSessionUser, safeAppPath } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeAppPath(url.searchParams.get("next"), "/");
  const returnTo = safeAppPath(url.searchParams.get("return"), "/login");
  const supabase = await createClient();

  if (url.searchParams.get("error")) {
    return redirectTo(request, `${returnTo}?error=oauth`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await getSessionUser();
      return redirectTo(request, next);
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
      await getSessionUser();
      return redirectTo(request, next);
    }
  }

  return redirectTo(request, `${returnTo}?error=oauth`);
}
