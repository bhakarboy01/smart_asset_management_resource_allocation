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
  Info,
  TrendingUp,
  Sparkles,
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
  const overdueCount = myBookings.filter(
    (b) => b.status === "ISSUED" && new Date(b.toDate) < new Date()
  ).length;

  const statCards = [
    {
      label: "Available Assets",
      value: availableAssets,
      icon: Package,
      color: "text-orange-500",
      bg: "bg-orange-500",
      lightBg: "bg-orange-50",
      href: "/assets",
      trend: "+3 this week",
    },
    {
      label: "Active Bookings",
      value: activeBookings.length,
      icon: CalendarCheck,
      color: "text-blue-500",
      bg: "bg-blue-500",
      lightBg: "bg-blue-50",
      href: "/bookings",
      trend: null,
    },
    {
      label: "Pending Approval",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500",
      lightBg: "bg-amber-50",
      href: "/bookings?status=PENDING",
      trend: null,
    },
    {
      label: "Overdue Returns",
      value: overdueCount,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-500",
      lightBg: "bg-red-50",
      href: "/bookings?status=ISSUED",
      trend: null,
    },
  ];

  const notifIcons: Record<string, React.ReactNode> = {
    success: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
    error: <XCircle className="w-3.5 h-3.5 text-red-500" />,
    info: <Info className="w-3.5 h-3.5 text-blue-500" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  };

  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Namaste, {firstName} <span className="text-2xl">👋</span>
          </h1>
          <p className="page-subtitle">
            {user.department ? `${user.department} · IIT Roorkee` : "IIT Roorkee Cultural Council"}
          </p>
        </div>
        <Link
          href="/assets"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          Browse Assets
        </Link>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="alert-danger animate-slide-up">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 text-sm">
            <span className="font-semibold text-red-700">
              {overdueCount} overdue return{overdueCount > 1 ? "s" : ""}!
            </span>{" "}
            <span className="text-red-600">Please return assets immediately to avoid penalties.</span>
          </div>
          <Link
            href="/bookings?status=ISSUED"
            className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap flex items-center gap-1"
          >
            View now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="stat-card group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.lightBg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              {stat.trend && (
                <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </div>
              )}
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
                  className="text-xs text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {myBookings.length === 0 ? (
                <div className="empty-state pb-8">
                  <div className="empty-state-icon">
                    <CalendarCheck className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No bookings yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    <Link href="/assets" className="text-orange-500 hover:underline">Browse assets</Link> to make your first booking
                  </p>
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
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                              <span className="text-base leading-none">{booking.asset.category.icon || "📦"}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 truncate max-w-[140px] text-sm">
                                {booking.asset.name}
                              </div>
                              <div className="text-[11px] text-gray-400">{booking.asset.category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-500 whitespace-nowrap text-sm">{formatDate(booking.fromDate)}</td>
                        <td className="text-gray-500 whitespace-nowrap text-sm">{formatDate(booking.toDate)}</td>
                        <td>
                          <span className={`badge ${BOOKING_STATUS_COLORS[booking.status as keyof typeof BOOKING_STATUS_COLORS]}`}>
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

        {/* Right column */}
        <div className="space-y-4">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                <Link href="/notifications" className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                  All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              {recentNotifications.length === 0 ? (
                <p className="px-5 pb-4 text-sm text-gray-400">No notifications</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-5 py-3 transition-colors ${!notif.isRead ? "bg-orange-50/40" : "hover:bg-gray-50/50"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          notif.type === "success" ? "bg-emerald-100" :
                          notif.type === "error" ? "bg-red-100" :
                          notif.type === "warning" ? "bg-amber-100" : "bg-blue-100"
                        }`}>
                          {notifIcons[notif.type] || notifIcons.info}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800 leading-snug">{notif.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{formatRelative(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 pt-0">
              {[
                { href: "/assets", icon: Package, label: "Browse Assets", desc: "Find and book equipment" },
                { href: "/bookings", icon: CalendarCheck, label: "My Bookings", desc: "View booking status" },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{label}</div>
                    <div className="text-[11px] text-gray-400">{desc}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
