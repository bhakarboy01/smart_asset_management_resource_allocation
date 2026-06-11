"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, EmptyState, Badge } from "@/components/ui/components";
import type { Booking } from "@/types";
import {
  formatDate,
  formatRelative,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  cn,
} from "@/lib/utils";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "ISSUED", label: "Issued" },
  { value: "RETURNED", label: "Returned" },
  { value: "REJECTED", label: "Rejected" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, [status]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("pageSize", "20");
      const res = await fetch(`/api/bookings?${params}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings);
        setTotal(data.data.total);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) fetchBookings();
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">{total} total booking requests</p>
        </div>
        <Link href="/assets">
          <Button variant="default">
            <Package className="w-4 h-4" />
            Browse Assets
          </Button>
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              status === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description={status ? "No bookings with this status." : "You haven't made any booking requests yet."}
          action={
            <Link href="/assets">
              <Button>Browse Assets</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const isOverdue =
              booking.status === "ISSUED" && new Date(booking.toDate) < new Date();
            return (
              <div
                key={booking.id}
                className={cn(
                  "bg-white rounded-xl border p-4 flex flex-col sm:flex-row gap-4",
                  isOverdue ? "border-red-200 bg-red-50/30" : "border-gray-100"
                )}
              >
                {/* Asset icon */}
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.asset?.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {booking.asset?.category?.name} · Qty: {booking.quantity}
                      </p>
                    </div>
                    <span className={cn("badge", BOOKING_STATUS_COLORS[(isOverdue ? "OVERDUE" : booking.status) as keyof typeof BOOKING_STATUS_COLORS])}>
                      {isOverdue ? "Overdue" : BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                    <span>📅 {formatDate(booking.fromDate)} → {formatDate(booking.toDate)}</span>
                    {booking.eventName && <span>🎭 {booking.eventName}</span>}
                    <span>⏱ {formatRelative(booking.createdAt)}</span>
                  </div>

                  {booking.purpose && (
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2">
                      {booking.purpose}
                    </p>
                  )}

                  {booking.rejectionReason && (
                    <p className="mt-2 text-xs text-red-500">
                      Reason: {booking.rejectionReason}
                    </p>
                  )}

                  {booking.adminNotes && (
                    <p className="mt-2 text-xs text-gray-500 italic">
                      Admin note: {booking.adminNotes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                  <div className="flex items-center sm:items-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(booking.id)}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
