import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAuthClient, setSupabaseRecoveryCookies } from "@/lib/supabase-auth-server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/admin")) {
    return "/account";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=reset_link_invalid", request.url));
  }

  try {
    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session?.access_token || !data.session.refresh_token) {
      return NextResponse.redirect(new URL("/login?error=reset_link_invalid", request.url));
    }

    await setSupabaseRecoveryCookies(data.session.access_token, data.session.refresh_token);
    return NextResponse.redirect(new URL(next, request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=reset_link_invalid", request.url));
  }
}
