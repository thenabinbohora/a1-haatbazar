import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export function GET(request: NextRequest) {
  const destination = new URL(
    "/admin/login?status=session-expired",
    request.url,
  );
  const response = NextResponse.redirect(destination);

  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
