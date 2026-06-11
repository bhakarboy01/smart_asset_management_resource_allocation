"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/components";
import type { Booking } from "@/types";
import { formatDate } from "@/lib/utils";

interface ReviewModalProps {
  booking: Booking;
  action: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ booking, action, onClose, onSuccess }: ReviewModalProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isApprove = action === "APPROVE";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isApprove && !rejectionReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes, rejectionReason }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isApprove ? "bg-green-50" : "bg-red-50"}`}>
              {isApprove
                ? <CheckCircle className="w-[18px] h-[18px] text-green-500" />
                : <XCircle className="w-[18px] h-[18px] text-red-500" />
              }
            </div>
            <h2 className="font-semibold text-gray-900">
              {isApprove ? "Approve Booking" : "Reject Booking"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Booking summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Asset</span>
              <span className="font-medium text-gray-900">{booking.asset?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Requested by</span>
              <span className="font-medium text-gray-900">{booking.user?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-900">
                {formatDate(booking.fromDate)} → {formatDate(booking.toDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="font-medium text-gray-900">{booking.quantity}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm">
              {error}
            </div>
          )}

          {!isApprove && (
            <div>
              <Label>Reason for Rejection *</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected…"
                rows={3}
                className="mt-1.5"
                required
              />
            </div>
          )}

          <div>
            <Label>Admin Notes (optional)</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Any additional notes for the user…"
              rows={2}
              className="mt-1.5"
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${isApprove ? "" : "bg-red-500 hover:bg-red-600"}`}
              loading={loading}
            >
              {isApprove ? "Approve" : "Reject"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
