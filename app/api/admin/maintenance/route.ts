import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/auth/middleware";
import { createMaintenanceSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");

  const logs = await db.maintenanceLog.findMany({
    where: assetId ? { assetId } : {},
    include: { asset: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ success: true, data: { logs } });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const result = createMaintenanceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    const log = await db.maintenanceLog.create({
      data: {
        assetId: data.assetId,
        title: data.title,
        description: data.description || null,
        condition: data.condition,
        cost: data.cost || null,
        technicianName: data.technicianName || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
    });

    // Update asset condition
    await db.asset.update({
      where: { id: data.assetId },
      data: {
        condition: data.condition,
        status: "UNDER_MAINTENANCE",
      },
    });

    await createAuditLog({
      userId: authResult.id,
      action: "MAINTENANCE_SCHEDULED",
      entityType: "Asset",
      entityId: data.assetId,
      details: `Maintenance scheduled: ${data.title}`,
    });

    return NextResponse.json(
      { success: true, data: { log }, message: "Maintenance log created" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create maintenance log" },
      { status: 500 }
    );
  }
}
