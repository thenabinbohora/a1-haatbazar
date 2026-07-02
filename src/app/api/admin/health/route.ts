import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";

export async function GET() {
  const { user, response } = await requireAdminApi();

  if (response) {
    return response;
  }

  return NextResponse.json({
    ok: true,
    role: user.role,
  });
}

