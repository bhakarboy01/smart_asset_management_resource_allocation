import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import type { SessionUser } from "@/types";

export async function requireAuth(
  request: NextRequest
): Promise<SessionUser | NextResponse> {
  const token = request.cookies.get("sampadaa_session")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorised. Please log in." },
      { status: 401 }
    );
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired session." },
      { status: 401 }
    );
  }

  return user;
}

export async function requireAdmin(
  request: NextRequest
): Promise<SessionUser | NextResponse> {
  const result = await requireAuth(request);

  if (result instanceof NextResponse) return result;

  if (result.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Access denied. Admin only." },
      { status: 403 }
    );
  }

  return result;
}

export function isAuthResponse(
  value: SessionUser | NextResponse
): value is NextResponse {
  return value instanceof NextResponse;
}
