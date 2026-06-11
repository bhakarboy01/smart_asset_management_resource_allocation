import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getCurrentUser } from "@/lib/auth/jwt";
import { createAuditLog } from "@/lib/utils/audit";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (user) {
    await createAuditLog({
      userId: user.id,
      action: "USER_LOGOUT",
      details: `User logged out: ${user.email}`,
    });
  }

  await clearAuthCookie();

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export async function GET(request: NextRequest) {
  await clearAuthCookie();
  return NextResponse.redirect(new URL("/auth/login", request.url));
}
