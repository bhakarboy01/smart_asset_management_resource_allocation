import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/auth/middleware";
import { createAuditLog, createNotification } from "@/lib/utils/audit";
import {
  sendBookingApprovedEmail,
  sendBookingRejectedEmail,
  sendOverdueReminderEmail,
} from "@/lib/utils/email";
import { formatDate } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      user: true,
      asset: { include: { category: true } },
    },
  });

  if (!booking) {
    return NextResponse.json(
      { success: false, error: "Booking not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: { booking } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { id } = await params;

  try {
    const body = await request.json();
    const { action, adminNotes, rejectionReason } = body;

    const booking = await db.booking.findUnique({
      where: { id },
      include: { asset: true, user: true },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    let updatedBooking;
    let notifTitle = "";
    let notifMessage = "";
    let notifType = "info";
    let auditAction: "BOOKING_APPROVED" | "BOOKING_REJECTED" | "ASSET_ISSUED" | "ASSET_RETURNED" | "BOOKING_CANCELLED" = "BOOKING_APPROVED";

    switch (action) {
      case "APPROVE":
        if (booking.status !== "PENDING") {
          return NextResponse.json(
            { success: false, error: "Only pending bookings can be approved" },
            { status: 400 }
          );
        }
        updatedBooking = await db.booking.update({
          where: { id },
          data: { status: "APPROVED", adminNotes: adminNotes || null },
        });
        auditAction = "BOOKING_APPROVED";
        notifTitle = "Booking Approved ✓";
        notifMessage = `Your request for "${booking.asset.name}" has been approved. Please collect it from the admin.`;
        notifType = "success";
        break;

      case "REJECT":
        if (booking.status !== "PENDING") {
          return NextResponse.json(
            { success: false, error: "Only pending bookings can be rejected" },
            { status: 400 }
          );
        }
        updatedBooking = await db.booking.update({
          where: { id },
          data: {
            status: "REJECTED",
            adminNotes: adminNotes || null,
            rejectionReason: rejectionReason || null,
          },
        });
        auditAction = "BOOKING_REJECTED";
        notifTitle = "Booking Request Rejected";
        notifMessage = `Your request for "${booking.asset.name}" was not approved. ${rejectionReason || ""}`;
        notifType = "error";
        break;

      case "ISSUE":
        if (booking.status !== "APPROVED") {
          return NextResponse.json(
            { success: false, error: "Only approved bookings can be issued" },
            { status: 400 }
          );
        }
        // Deduct from available quantity
        await db.asset.update({
          where: { id: booking.assetId },
          data: {
            availableQty: { decrement: booking.quantity },
          },
        });
        // Update asset status
        const asset = await db.asset.findUnique({ where: { id: booking.assetId } });
        if (asset) {
          const newAvail = asset.availableQty;
          await db.asset.update({
            where: { id: booking.assetId },
            data: {
              status: newAvail === 0 ? "UNAVAILABLE" : newAvail < asset.totalQuantity ? "PARTIALLY_AVAILABLE" : "AVAILABLE",
            },
          });
        }
        updatedBooking = await db.booking.update({
          where: { id },
          data: { status: "ISSUED", issuedAt: new Date(), adminNotes: adminNotes || null },
        });
        auditAction = "ASSET_ISSUED";
        notifTitle = "Asset Issued";
        notifMessage = `"${booking.asset.name}" (${booking.quantity} unit(s)) has been issued to you. Return by ${booking.toDate.toDateString()}.`;
        notifType = "success";
        break;

      case "RETURN":
        if (booking.status !== "ISSUED" && booking.status !== "OVERDUE") {
          return NextResponse.json(
            { success: false, error: "Only issued bookings can be returned" },
            { status: 400 }
          );
        }
        // Restore available quantity
        await db.asset.update({
          where: { id: booking.assetId },
          data: {
            availableQty: { increment: booking.quantity },
          },
        });
        const assetAfterReturn = await db.asset.findUnique({ where: { id: booking.assetId } });
        if (assetAfterReturn) {
          await db.asset.update({
            where: { id: booking.assetId },
            data: {
              status:
                assetAfterReturn.availableQty === 0
                  ? "UNAVAILABLE"
                  : assetAfterReturn.availableQty < assetAfterReturn.totalQuantity
                  ? "PARTIALLY_AVAILABLE"
                  : "AVAILABLE",
            },
          });
        }
        updatedBooking = await db.booking.update({
          where: { id },
          data: {
            status: "RETURNED",
            returnedAt: new Date(),
            adminNotes: adminNotes || null,
          },
        });
        auditAction = "ASSET_RETURNED";
        notifTitle = "Asset Returned";
        notifMessage = `"${booking.asset.name}" has been successfully returned. Thank you!`;
        notifType = "success";
        break;

      case "CANCEL":
        if (!["PENDING", "APPROVED"].includes(booking.status)) {
          return NextResponse.json(
            { success: false, error: "This booking cannot be cancelled" },
            { status: 400 }
          );
        }
        updatedBooking = await db.booking.update({
          where: { id },
          data: { status: "CANCELLED", adminNotes: adminNotes || null },
        });
        auditAction = "BOOKING_CANCELLED";
        notifTitle = "Booking Cancelled";
        notifMessage = `Your booking for "${booking.asset.name}" has been cancelled.`;
        notifType = "warning";
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    await createAuditLog({
      userId: authResult.id,
      action: auditAction,
      entityType: "Booking",
      entityId: id,
      details: `Booking ${action.toLowerCase()}: ${booking.asset.name} for ${booking.user.name}`,
    });

    if (notifTitle) {
      await createNotification({
        userId: booking.userId,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        link: "/bookings",
      });
    }

    // Fire-and-forget email notifications
    if (action === "APPROVE") {
      sendBookingApprovedEmail({
        to: booking.user.email,
        userName: booking.user.name,
        assetName: booking.asset.name,
        fromDate: formatDate(booking.fromDate),
        toDate: formatDate(booking.toDate),
        adminNotes: adminNotes,
      }).catch(() => {});
    } else if (action === "REJECT") {
      sendBookingRejectedEmail({
        to: booking.user.email,
        userName: booking.user.name,
        assetName: booking.asset.name,
        rejectionReason: rejectionReason,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: { booking: updatedBooking },
      message: `Booking ${action.toLowerCase()}d successfully`,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
