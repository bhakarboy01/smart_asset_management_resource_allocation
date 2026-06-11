import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const users = await db.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      rollNumber: true,
      department: true,
      phone: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: { users } });
}
