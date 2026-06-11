import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/auth/middleware";
import { createAuditLog } from "@/lib/utils/audit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  const log = await db.maintenanceLog.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!log) {
    return NextResponse.json({ success: false, error: "Log not found" }, { status: 404 });
  }

  const updated = await db.maintenanceLog.update({
    where: { id },
    data: { completedAt: new Date() },
  });

  // Restore asset to available
  await db.asset.update({
    where: { id: log.assetId },
    data: {
      status: log.asset.availableQty > 0 ? "AVAILABLE" : "UNAVAILABLE",
      condition: log.condition,
    },
  });

  await createAuditLog({
    userId: authResult.id,
    action: "MAINTENANCE_COMPLETED",
    entityType: "Asset",
    entityId: log.assetId,
    details: `Maintenance completed: ${log.title}`,
  });

  return NextResponse.json({
    success: true,
    data: { log: updated },
    message: "Maintenance marked as complete",
  });
}
