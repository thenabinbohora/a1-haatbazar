import { NextRequest, NextResponse } from "next/server";
import { safeInternalReturnPath } from "@/lib/safe-return-path";
import {
  clearSupabaseRecoveryCookies,
  createSupabaseRecoveryPkceClient,
  setSupabaseRecoveryCookies,
} from "@/lib/supabase-auth-server";

function recoveryReturnPath(value: string | null) {
  const safePath = safeInternalReturnPath(value, "/reset-password");
  return safePath === "/reset-password" || safePath.startsWith("/reset-password?")
    ? safePath
    : "/reset-password";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = recoveryReturnPath(requestUrl.searchParams.get("next"));

  if (!code) {
    await clearSupabaseRecoveryCookies();
    return NextResponse.redirect(new URL("/login?error=reset_link_invalid", request.url));
  }

  try {
    const supabase = await createSupabaseRecoveryPkceClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session?.access_token || !data.session.refresh_token) {
      await clearSupabaseRecoveryCookies();
      return NextResponse.redirect(new URL("/login?error=reset_link_invalid", request.url));
    }

    await setSupabaseRecoveryCookies(data.session.access_token, data.session.refresh_token);
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    await clearSupabaseRecoveryCookies();
    return NextResponse.redirect(new URL("/login?error=reset_link_invalid", request.url));
  }
}
