import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/jwt";
import db from "@/lib/db/prisma";
import { History, Package } from "lucide-react";
import { EmptyState } from "@/components/ui/components";
import {
  formatDate,
  formatRelative,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  cn,
} from "@/lib/utils";
import type { BookingStatus } from "@/types";
import type { Prisma } from "@prisma/client";

type BookingWithAsset = Prisma.BookingGetPayload<{
  include: { asset: { include: { category: true } } };
}>;

export const metadata = { title: "Borrowing History" };

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [pastBookings, activeBookings] = await Promise.all([
    db.booking.findMany({
      where: {
        userId: user.id,
        status: { in: ["RETURNED", "REJECTED", "CANCELLED", "OVERDUE"] },
      },
      include: { asset: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.booking.findMany({
      where: {
        userId: user.id,
        status: { in: ["PENDING", "APPROVED", "ISSUED"] },
      },
      include: { asset: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const returnedCount = pastBookings.filter((b) => b.status === "RETURNED").length;
  const cancelledCount = pastBookings.filter((b) => b.status === "CANCELLED").length;
  const rejectedCount = pastBookings.filter((b) => b.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Borrowing History</h1>
          <p className="page-subtitle">{pastBookings.length + activeBookings.length} total bookings</p>
        </div>
        <Link href="/assets">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors cursor-pointer">
            <Package className="w-4 h-4" />
            Browse Assets
          </span>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active", value: activeBookings.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Returned", value: returnedCount, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", value: rejectedCount, color: "text-red-600", bg: "bg-red-50" },
          { label: "Cancelled", value: cancelledCount, color: "text-gray-600", bg: "bg-gray-50" },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active bookings */}
      {activeBookings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Active Bookings</h2>
          <div className="space-y-2">
            {activeBookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        </div>
      )}

      {/* Past bookings */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Past Bookings</h2>
        {pastBookings.length === 0 ? (
          <EmptyState
            icon={History}
            title="No booking history yet"
            description="Your completed, rejected, and cancelled bookings will appear here."
          />
        ) : (
          <div className="space-y-2">
            {pastBookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: BookingWithAsset }) {
  const isOverdue =
    booking.status === "ISSUED" && new Date(booking.toDate) < new Date();
  const displayStatus: BookingStatus = isOverdue ? "OVERDUE" : booking.status;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border p-4 flex items-center gap-4",
        isOverdue ? "border-red-200 bg-red-50/20" : "border-gray-100"
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
        <Package className="w-5 h-5 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{booking.asset?.name}</span>
          <span className="text-xs text-gray-400">{booking.asset?.category?.name}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
          <span>📅 {formatDate(booking.fromDate)} → {formatDate(booking.toDate)}</span>
          {booking.eventName && <span>🎭 {booking.eventName}</span>}
          <span>Qty: {booking.quantity}</span>
          {booking.returnedAt && (
            <span>✅ Returned {formatDate(booking.returnedAt)}</span>
          )}
        </div>
        {booking.rejectionReason && (
          <p className="text-xs text-red-500 mt-1">Reason: {booking.rejectionReason}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <span className={cn("badge", BOOKING_STATUS_COLORS[displayStatus as keyof typeof BOOKING_STATUS_COLORS])}>
          {BOOKING_STATUS_LABELS[displayStatus as keyof typeof BOOKING_STATUS_LABELS]}
        </span>
        <span className="text-xs text-gray-400">{formatRelative(booking.createdAt)}</span>
      </div>
    </div>
  );
}
