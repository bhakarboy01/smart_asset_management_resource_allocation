import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, isAuthResponse } from "@/lib/auth/middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  await db.notification.updateMany({
    where: { id, userId: authResult.id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
