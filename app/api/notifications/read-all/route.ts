import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, isAuthResponse } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  await db.notification.updateMany({
    where: { userId: authResult.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true, message: "All notifications marked as read" });
}
