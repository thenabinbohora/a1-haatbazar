import { NextResponse } from "next/server";
import { recordAdminAuthEvent } from "@/lib/admin-auth-audit";
import { getCurrentUser } from "@/lib/auth";

export async function requireAdminApi() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Admin authentication required." },
        { status: 401 },
      ),
    };
  }

  if (user.role !== "ADMIN") {
    recordAdminAuthEvent({
      event: "access_denied",
      reason: "role",
      userId: user.id,
    });

    return {
      user: null,
      response: NextResponse.json(
        { error: "Admin authentication required." },
        { status: 403 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}
