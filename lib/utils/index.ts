import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isAfter, isBefore } from "date-fns";
import type { BookingStatus, AssetStatus, AssetCondition } from "@/types";

// ─── Tailwind class merge ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date utilities ───────────────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(toDate: Date | string): boolean {
  return isBefore(new Date(toDate), new Date());
}

export function isDueSoon(toDate: Date | string, days = 2): boolean {
  const dueDate = new Date(toDate);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return isAfter(dueDate, new Date()) && isBefore(dueDate, cutoff);
}

// ─── Status helpers ───────────────────────────────────────────────────────────

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ISSUED: "Issued",
  RETURNED: "Returned",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED: "bg-blue-100 text-blue-800 border-blue-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  ISSUED: "bg-purple-100 text-purple-800 border-purple-200",
  RETURNED: "bg-green-100 text-green-800 border-green-200",
  OVERDUE: "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  PARTIALLY_AVAILABLE: "Partially Available",
  UNAVAILABLE: "Unavailable",
  UNDER_MAINTENANCE: "Under Maintenance",
};

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  PARTIALLY_AVAILABLE: "bg-yellow-100 text-yellow-800",
  UNAVAILABLE: "bg-red-100 text-red-800",
  UNDER_MAINTENANCE: "bg-orange-100 text-orange-800",
};

export const CONDITION_LABELS: Record<AssetCondition, string> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  DAMAGED: "Damaged",
};

export const CONDITION_COLORS: Record<AssetCondition, string> = {
  EXCELLENT: "text-emerald-600",
  GOOD: "text-green-600",
  FAIR: "text-yellow-600",
  POOR: "text-orange-600",
  DAMAGED: "text-red-600",
};

// ─── Number utilities ─────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function calculateUtilization(total: number, available: number): number {
  if (total === 0) return 0;
  return Math.round(((total - available) / total) * 100);
}

// ─── String utilities ─────────────────────────────────────────────────────────

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── API utilities ────────────────────────────────────────────────────────────

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const str = query.toString();
  return str ? `?${str}` : "";
}
