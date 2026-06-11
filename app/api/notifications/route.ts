import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, isAuthResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId: authResult.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    db.notification.count({
      where: { userId: authResult.id, isRead: false },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: { notifications, unreadCount },
  });
}
