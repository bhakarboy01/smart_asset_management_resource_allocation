"use client";

import { useState } from "react";
import { X, Package, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/components";
import type { Asset } from "@/types";
import { formatDate } from "@/lib/utils";

interface BookingModalProps {
  asset: Asset;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ asset, open, onClose, onSuccess }: BookingModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    quantity: 1,
    purpose: "",
    eventName: "",
    fromDate: today,
    toDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, assetId: asset.id }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to submit booking");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setForm({ quantity: 1, purpose: "", eventName: "", fromDate: today, toDate: "" });
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{asset.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {asset.category?.name} · {asset.availableQty} unit(s) available
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Booking Submitted!</h3>
            <p className="text-sm text-gray-500 mt-1">
              Your request is pending admin approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">From Date</label>
                <Input
                  type="date"
                  value={form.fromDate}
                  min={today}
                  onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
              </div>
              <div>
                <label className="form-label">Return Date</label>
                <Input
                  type="date"
                  value={form.toDate}
                  min={form.fromDate || today}
                  onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">
                Quantity{" "}
                <span className="text-gray-400 font-normal">
                  (max {asset.availableQty})
                </span>
              </label>
              <Input
                type="number"
                min={1}
                max={asset.availableQty}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>

            <div>
              <label className="form-label">Event / Programme Name (optional)</label>
              <Input
                placeholder="e.g. Thomso 2024, Cognizance"
                value={form.eventName}
                onChange={(e) => setForm({ ...form, eventName: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Purpose of Booking</label>
              <Textarea
                placeholder="Briefly describe why you need this asset and how it will be used…"
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                rows={3}
                required
                minLength={10}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Submit Request
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
