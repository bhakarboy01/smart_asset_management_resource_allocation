import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, requireAdmin, isAuthResponse } from "@/lib/auth/middleware";
import { updateAssetSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  const asset = await db.asset.findUnique({
    where: { id },
    include: {
      category: true,
      bookings: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      maintenanceLogs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!asset) {
    return NextResponse.json(
      { success: false, error: "Asset not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: { asset } });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const result = updateAssetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;
    const updateData: Record<string, unknown> = { ...data };

    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.warrantyExpiry) updateData.warrantyExpiry = new Date(data.warrantyExpiry);

    // Auto-update status based on quantities
    if (data.totalQuantity !== undefined || data.availableQty !== undefined) {
      const asset = await db.asset.findUnique({ where: { id } });
      if (asset) {
        const total = data.totalQuantity ?? asset.totalQuantity;
        const avail = data.availableQty ?? asset.availableQty;
        if (avail === 0) updateData.status = "UNAVAILABLE";
        else if (avail < total) updateData.status = "PARTIALLY_AVAILABLE";
        else updateData.status = "AVAILABLE";
      }
    }

    const asset = await db.asset.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    await createAuditLog({
      userId: authResult.id,
      action: "ASSET_UPDATED",
      entityType: "Asset",
      entityId: id,
      details: `Asset updated: ${asset.name}`,
    });

    return NextResponse.json({
      success: true,
      data: { asset },
      message: "Asset updated successfully",
    });
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  const asset = await db.asset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json(
      { success: false, error: "Asset not found" },
      { status: 404 }
    );
  }

  // Soft delete
  await db.asset.update({
    where: { id },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: authResult.id,
    action: "ASSET_DELETED",
    entityType: "Asset",
    entityId: id,
    details: `Asset deleted: ${asset.name}`,
  });

  return NextResponse.json({
    success: true,
    message: "Asset removed successfully",
  });
}
