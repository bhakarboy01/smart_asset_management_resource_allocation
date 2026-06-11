import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAuth, isAuthResponse } from "@/lib/auth/middleware";
import { createAuditLog } from "@/lib/utils/audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  const booking = await db.booking.findFirst({
    where: {
      id,
      ...(authResult.role !== "ADMIN" ? { userId: authResult.id } : {}),
    },
    include: {
      asset: { include: { category: true } },
      user: { select: { id: true, name: true, email: true, rollNumber: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { booking } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  const booking = await db.booking.findFirst({
    where: { id, userId: authResult.id },
    include: { asset: true },
  });

  if (!booking) {
    return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
  }

  if (!["PENDING", "APPROVED"].includes(booking.status)) {
    return NextResponse.json(
      { success: false, error: "This booking cannot be cancelled." },
      { status: 400 }
    );
  }

  await db.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await createAuditLog({
    userId: authResult.id,
    action: "BOOKING_CANCELLED",
    entityType: "Booking",
    entityId: id,
    details: `Booking cancelled by user: ${booking.asset.name}`,
  });

  return NextResponse.json({ success: true, message: "Booking cancelled." });
}
