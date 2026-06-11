import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "";
  const userId = searchParams.get("userId") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
