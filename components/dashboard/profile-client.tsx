"use client";

import { useState } from "react";
import { User, Mail, Phone, Hash, BookOpen, Edit2, Save, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/components";
import { getInitials, formatDate } from "@/lib/utils";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    rollNumber?: string | null;
    department?: string | null;
    phone?: string | null;
    createdAt: Date;
    _count: { bookings: number };
  };
  bookingStats: Array<{ status: string; _count: { status: number } }>;
}

const BOOKING_STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-600" },
  APPROVED: { label: "Approved", color: "text-blue-600" },
  ISSUED: { label: "Issued", color: "text-purple-600" },
  RETURNED: { label: "Returned", color: "text-green-600" },
  REJECTED: { label: "Rejected", color: "text-red-600" },
  CANCELLED: { label: "Cancelled", color: "text-gray-600" },
};

export function ProfileClient({ user, bookingStats }: ProfileClientProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || "",
    department: user.department || "",
  });

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  const totalBookings = user._count.bookings;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✓ Profile updated successfully
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar + stats */}
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {getInitials(user.name)}
            </div>
            <h2 className="font-bold text-gray-900 text-lg">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            <div className="mt-3">
              <span
                className={`badge ${
                  user.role === "ADMIN"
                    ? "bg-orange-100 text-orange-700 border-orange-200"
                    : "bg-blue-100 text-blue-700 border-blue-200"
                }`}
              >
                {user.role === "ADMIN" ? (
                  <><ShieldCheck className="w-3 h-3 inline mr-1" />Administrator</>
                ) : "Student"}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-2xl font-bold text-orange-500">{totalBookings}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Bookings</p>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Member since {formatDate(user.createdAt)}
            </p>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={loading}>
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} loading={loading}>
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  {editing ? (
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      leftIcon={<User className="w-4 h-4" />}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-9 px-3 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      {user.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <div className="flex items-center gap-2 h-9 px-3 text-sm text-gray-500">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="form-label">Roll Number</label>
                  <div className="flex items-center gap-2 h-9 px-3 text-sm text-gray-500">
                    <Hash className="w-4 h-4 text-gray-400" />
                    {user.rollNumber || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="form-label">Mobile Number</label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      leftIcon={<Phone className="w-4 h-4" />}
                      placeholder="10-digit mobile number"
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-9 px-3 text-sm text-gray-500">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {user.phone || "Not set"}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="form-label">Department</label>
                  {editing ? (
                    <Input
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      leftIcon={<BookOpen className="w-4 h-4" />}
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-9 px-3 text-sm text-gray-500">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      {user.department || "Not set"}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking stats */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {bookingStats.map((stat) => {
                  const display = BOOKING_STATUS_DISPLAY[stat.status];
                  if (!display) return null;
                  return (
                    <div key={stat.status} className="text-center p-3 bg-gray-50 rounded-xl">
                      <div className={`text-xl font-bold ${display.color}`}>
                        {stat._count.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{display.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
