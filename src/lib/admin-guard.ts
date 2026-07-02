import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

export async function requireAdminApi() {
  const user = await isAdminRequest();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Admin authentication required." },
        { status: 401 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

