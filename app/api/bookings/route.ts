import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, isAuthResponse } from "@/lib/auth/middleware";
import { createBookingSchema } from "@/lib/validations/schemas";
import { createAuditLog, createNotification } from "@/lib/utils/audit";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};

  // Regular users only see their own bookings
  if (authResult.role !== "ADMIN") {
    where.userId = authResult.id;
  }

  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, rollNumber: true, department: true },
        },
        asset: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.booking.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      bookings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  try {
    const body = await request.json();
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { assetId, quantity, purpose, eventName, fromDate, toDate } = result.data;

    // Check asset availability
    const asset = await db.asset.findUnique({ where: { id: assetId } });
    if (!asset || !asset.isActive) {
      return NextResponse.json(
        { success: false, error: "Asset not found or unavailable" },
        { status: 404 }
      );
    }

    if (asset.availableQty < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${asset.availableQty} unit(s) available. You requested ${quantity}.`,
        },
        { status: 400 }
      );
    }

    // Check for conflicting bookings in same date range
    const conflicts = await db.booking.count({
      where: {
        assetId,
        status: { in: ["APPROVED", "ISSUED"] },
        AND: [
          { fromDate: { lte: new Date(toDate) } },
          { toDate: { gte: new Date(fromDate) } },
        ],
      },
    });

    if (conflicts > 0) {
      return NextResponse.json(
        { success: false, error: "Asset is already booked for this date range." },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      data: {
        userId: authResult.id,
        assetId,
        quantity,
        purpose,
        eventName: eventName || null,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        status: "PENDING",
      },
      include: {
        asset: { include: { category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      userId: authResult.id,
      action: "BOOKING_CREATED",
      entityType: "Booking",
      entityId: booking.id,
      details: `Booking created for ${asset.name}`,
    });

    // Notify the user
    await createNotification({
      userId: authResult.id,
      title: "Booking Request Submitted",
      message: `Your request for "${asset.name}" has been submitted and is pending approval.`,
      type: "info",
      link: `/bookings`,
    });

    // Notify all admins
    const admins = await db.user.findMany({ where: { role: "ADMIN", isActive: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "New Booking Request",
        message: `${authResult.name} has requested "${asset.name}" for ${quantity} unit(s).`,
        type: "info",
        link: `/admin/bookings`,
      });
    }

    return NextResponse.json(
      { success: true, data: { booking }, message: "Booking request submitted!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit booking request" },
      { status: 500 }
    );
  }
}
