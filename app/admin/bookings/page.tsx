"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, Package, ArrowDownToLine, RotateCcw,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner, EmptyState } from "@/components/ui/components";
import { ReviewModal } from "@/components/admin/review-modal";
import type { Booking } from "@/types";
import {
  formatDate,
  formatRelative,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  cn,
} from "@/lib/utils";

const TABS = [
  { value: "PENDING", label: "Pending", color: "text-yellow-600" },
  { value: "APPROVED", label: "Approved", color: "text-blue-600" },
  { value: "ISSUED", label: "Issued", color: "text-purple-600" },
  { value: "RETURNED", label: "Returned", color: "text-green-600" },
  { value: "REJECTED", label: "Rejected", color: "text-red-600" },
  { value: "", label: "All", color: "text-gray-600" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewBooking, setReviewBooking] = useState<{ booking: Booking; action: string } | null>(null);

  useEffect(() => { fetchBookings(); }, [status, page]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("pageSize", "15");
      const res = await fetch(`/api/bookings?${params}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }

  async function quickAction(bookingId: string, action: string) {
    const res = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (data.success) fetchBookings();
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Requests</h1>
          <p className="page-subtitle">{total} {status.toLowerCase() || "total"} bookings</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              status === tab.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Package} title="No bookings found" description="No bookings match the current filter." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Asset</th>
                  <th>Qty</th>
                  <th>Duration</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const isOverdue = booking.status === "ISSUED" && new Date(booking.toDate) < new Date();
                  return (
                    <tr key={booking.id} className={isOverdue ? "bg-red-50/30" : ""}>
                      <td>
                        <div className="font-medium text-gray-900 text-sm">{booking.user?.name}</div>
                        <div className="text-xs text-gray-400">{booking.user?.rollNumber || booking.user?.email}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-800 text-sm max-w-[150px] truncate">
                          {booking.asset?.name}
                        </div>
                        <div className="text-xs text-gray-400">{booking.asset?.category?.name}</div>
                      </td>
                      <td className="text-center font-semibold text-gray-700">{booking.quantity}</td>
                      <td className="text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(booking.fromDate)}<br />
                        <span className="text-gray-400">→ {formatDate(booking.toDate)}</span>
                      </td>
                      <td>
                        <p className="text-xs text-gray-500 max-w-[180px] truncate" title={booking.purpose}>
                          {booking.purpose}
                        </p>
                      </td>
                      <td>
                        <span className={cn("badge", BOOKING_STATUS_COLORS[(isOverdue ? "OVERDUE" : booking.status) as keyof typeof BOOKING_STATUS_COLORS])}>
                          {isOverdue ? "Overdue" : BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {formatRelative(booking.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {booking.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => setReviewBooking({ booking, action: "APPROVE" })}
                                className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setReviewBooking({ booking, action: "REJECT" })}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {booking.status === "APPROVED" && (
                            <button
                              onClick={() => quickAction(booking.id, "ISSUE")}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Mark as Issued"
                            >
                              <ArrowDownToLine className="w-4 h-4" />
                            </button>
                          )}
                          {(booking.status === "ISSUED" || isOverdue) && (
                            <button
                              onClick={() => quickAction(booking.id, "RETURN")}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                              title="Mark as Returned"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2">{page}/{totalPages}</span>
                <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking.booking}
          action={reviewBooking.action}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => { setReviewBooking(null); fetchBookings(); }}
        />
      )}
    </div>
  );
}
