import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, requireAdmin, isAuthResponse } from "@/lib/auth/middleware";
import { createAssetSchema } from "@/lib/validations/schemas";
import { createAuditLog } from "@/lib/utils/audit";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "12");
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { serialNumber: { contains: search } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (status) where.status = status;

  const [assets, total] = await Promise.all([
    db.asset.findMany({
      where,
      include: {
        category: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.asset.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      assets,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const result = createAssetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    // Generate QR code
    let qrCode: string | null = null;
    try {
      const assetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/assets`;
      qrCode = await QRCode.toDataURL(assetUrl);
    } catch {
      // QR generation failure is non-fatal
    }

    const asset = await db.asset.create({
      data: {
        name: data.name,
        description: data.description || null,
        categoryId: data.categoryId,
        totalQuantity: data.totalQuantity,
        availableQty: data.availableQty ?? data.totalQuantity,
        condition: data.condition,
        location: data.location || null,
        serialNumber: data.serialNumber || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice || null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        imageUrl: data.imageUrl || null,
        notes: data.notes || null,
        qrCode,
        status:
          (data.availableQty ?? data.totalQuantity) === 0
            ? "UNAVAILABLE"
            : (data.availableQty ?? data.totalQuantity) < data.totalQuantity
            ? "PARTIALLY_AVAILABLE"
            : "AVAILABLE",
      },
      include: { category: true },
    });

    await createAuditLog({
      userId: authResult.id,
      action: "ASSET_CREATED",
      entityType: "Asset",
      entityId: asset.id,
      details: `Asset created: ${asset.name}`,
    });

    return NextResponse.json(
      { success: true, data: { asset }, message: "Asset added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create asset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
