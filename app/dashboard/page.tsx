import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/jwt";
import db from "@/lib/db/prisma";
import {
  Package,
  CalendarCheck,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/components";
import {
  formatDate,
  formatRelative,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
} from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [myBookings, availableAssets, recentNotifications] = await Promise.all([
    db.booking.findMany({
      where: { userId: user.id },
      include: { asset: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.asset.count({ where: { isActive: true, status: "AVAILABLE" } }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const activeBookings = myBookings.filter((b) =>
    ["PENDING", "APPROVED", "ISSUED"].includes(b.status)
  );
  const pendingCount = myBookings.filter((b) => b.status === "PENDING").length;
  const issuedCount = myBookings.filter((b) => b.status === "ISSUED").length;
  const overdueCount = myBookings.filter(
    (b) => b.status === "ISSUED" && new Date(b.toDate) < new Date()
  ).length;

  const statCards = [
    {
      label: "Available Assets",
      value: availableAssets,
      icon: Package,
      color: "text-orange-500",
      bg: "bg-orange-50",
      href: "/assets",
    },
    {
      label: "My Active Bookings",
      value: activeBookings.length,
      icon: CalendarCheck,
      color: "text-blue-500",
      bg: "bg-blue-50",
      href: "/bookings",
    },
    {
      label: "Pending Approval",
      value: pendingCount,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
      href: "/bookings?status=PENDING",
    },
    {
      label: "Overdue Returns",
      value: overdueCount,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
      href: "/bookings?status=ISSUED",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Namaste, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="page-subtitle">
          {user.department
            ? `${user.department} · IIT Roorkee`
            : "IIT Roorkee Cultural Council"}
        </p>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-red-700">
              {overdueCount} overdue return{overdueCount > 1 ? "s" : ""}!
            </span>{" "}
            <span className="text-red-600">
              Please return the assets immediately to avoid penalties.
            </span>
          </div>
          <Link
            href="/bookings?status=ISSUED"
            className="text-xs font-semibold text-red-600 hover:underline whitespace-nowrap"
          >
            View now →
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="stat-card group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Link
                  href="/bookings"
                  className="text-xs text-orange-500 hover:underline font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {myBookings.length === 0 ? (
                <div className="px-5 pb-5 text-center text-sm text-gray-400 py-8">
                  No bookings yet.{" "}
                  <Link href="/assets" className="text-orange-500 hover:underline">
                    Browse assets →
                  </Link>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="font-medium text-gray-900 truncate max-w-[160px]">
                            {booking.asset.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {booking.asset.category.name}
                          </div>
                        </td>
                        <td className="text-gray-600 whitespace-nowrap">
                          {formatDate(booking.fromDate)}
                        </td>
                        <td className="text-gray-600 whitespace-nowrap">
                          {formatDate(booking.toDate)}
                        </td>
                        <td>
                          <span
                            className={`badge ${BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS]}`}
                          >
                            {BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Link
                  href="/notifications"
                  className="text-xs text-orange-500 hover:underline font-medium"
                >
                  All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {recentNotifications.length === 0 ? (
                <p className="px-5 pb-4 text-sm text-gray-400">No notifications</p>
              ) : (
                <div>
                  {recentNotifications.map((notif) => {
                    const icons: Record<string, React.ReactNode> = {
                      success: <CheckCircle className="w-4 h-4 text-green-500" />,
                      error: <XCircle className="w-4 h-4 text-red-500" />,
                      info: <Loader className="w-4 h-4 text-blue-500" />,
                      warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
                    };
                    return (
                      <div
                        key={notif.id}
                        className={`px-5 py-3 border-b border-gray-50 last:border-0 ${
                          !notif.isRead ? "bg-orange-50/40" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            {icons[notif.type] || icons.info}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatRelative(notif.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Link
                href="/assets"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-orange-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Browse Assets</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400" />
              </Link>
              <Link
                href="/bookings"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-orange-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">My Bookings</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
