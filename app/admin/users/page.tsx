import db from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { Users, ShieldCheck, Mail, Phone, BookOpen } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/components";

export const metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") redirect("/dashboard");

  const users = await db.user.findMany({
    where: { isActive: true },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = users.filter((u) => u.role === "USER").length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <Users className="w-[18px] h-[18px] text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
            <ShieldCheck className="w-[18px] h-[18px] text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{adminCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">Administrators</div>
        </div>
        <div className="stat-card">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <BookOpen className="w-[18px] h-[18px] text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{userCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">Regular Users</div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roll No.</th>
                <th>Department</th>
                <th>Role</th>
                <th>Bookings</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-600 text-sm">{user.rollNumber || "—"}</td>
                  <td className="text-gray-600 text-sm max-w-[160px] truncate">
                    {user.department || "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === "ADMIN"
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {user.role === "ADMIN" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="text-center font-semibold text-gray-700">
                    {user._count.bookings}
                  </td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
