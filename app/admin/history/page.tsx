"use client";

import { useState, useEffect } from "react";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, EmptyState } from "@/components/ui/components";
import {
  formatDate,
  formatRelative,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  cn,
} from "@/lib/utils";
import type { Booking } from "@/types";

export default function AdminHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [status, page]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("pageSize", "20");
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

  const STATUS_TABS = [
    { value: "", label: "All Activity" },
    { value: "RETURNED", label: "Returned" },
    { value: "ISSUED", label: "Issued" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">System-Wide Activity</h1>
          <p className="page-subtitle">{total} total booking records</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {STATUS_TABS.map((tab) => (
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
        <EmptyState icon={History} title="No records found" description="No booking activity matches this filter." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Roll No.</th>
                  <th>Asset</th>
                  <th>Qty</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Issued At</th>
                  <th>Returned At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const isOverdue = booking.status === "ISSUED" && new Date(booking.toDate) < new Date();
                  return (
                    <tr key={booking.id}>
                      <td>
                        <div className="font-medium text-gray-900 text-sm">{booking.user?.name}</div>
                        <div className="text-xs text-gray-400">{booking.user?.email}</div>
                      </td>
                      <td className="text-gray-500 text-sm">{booking.user?.rollNumber || "—"}</td>
                      <td>
                        <div className="font-medium text-gray-800 text-sm max-w-[160px] truncate">
                          {booking.asset?.name}
                        </div>
                        <div className="text-xs text-gray-400">{booking.asset?.category?.name}</div>
                      </td>
                      <td className="text-center font-semibold text-gray-700">{booking.quantity}</td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(booking.fromDate)}</td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(booking.toDate)}</td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {booking.issuedAt ? formatDate(booking.issuedAt) : "—"}
                      </td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {booking.returnedAt ? formatDate(booking.returnedAt) : "—"}
                      </td>
                      <td>
                        <span className={cn("badge", BOOKING_STATUS_COLORS[(isOverdue ? "OVERDUE" : booking.status) as keyof typeof BOOKING_STATUS_COLORS])}>
                          {isOverdue ? "Overdue" : BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
                        </span>
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
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
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
    </div>
  );
}
