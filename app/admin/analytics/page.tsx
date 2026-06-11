"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Package,
  Users,
  CalendarCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Spinner } from "@/components/ui/components";
import { Button } from "@/components/ui/button";
import { formatRelative, BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS, cn } from "@/lib/utils";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4", "#84cc16"];

interface AnalyticsData {
  stats: {
    totalAssets: number;
    availableAssets: number;
    totalUsers: number;
    pendingBookings: number;
    activeBookings: number;
    overdueBookings: number;
    totalBookings: number;
  };
  topAssets: Array<{
    assetId: string;
    assetName: string;
    category: string;
    totalBookings: number;
    utilizationRate: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  bookingTrend: Array<{
    date: string;
    bookings: number;
    returns: number;
  }>;
  statusDistribution: Array<{
    status: string;
    _count: { status: number };
  }>;
  recentBookings: Array<{
    id: string;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
    asset: { name: string };
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-32 text-sm text-gray-500">
        Analytics data is unavailable right now.
      </div>
    );
  }

  const { stats, topAssets, categoryStats, bookingTrend, statusDistribution, recentBookings } = data;

  const statCards = [
    { label: "Total Assets", value: stats.totalAssets, icon: Package, color: "text-orange-500", bg: "bg-orange-50", change: "+4 this week" },
    { label: "Active Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50", change: "+12 this month" },
    { label: "Pending Requests", value: stats.pendingBookings, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50", change: "Needs review" },
    { label: "Active Bookings", value: stats.activeBookings, icon: CalendarCheck, color: "text-purple-500", bg: "bg-purple-50", change: "Issued + Approved" },
    { label: "Available Assets", value: stats.availableAssets, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", change: `of ${stats.totalAssets} total` },
    { label: "Overdue Returns", value: stats.overdueBookings, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", change: stats.overdueBookings > 0 ? "Action needed!" : "All good" },
  ];

  const pieData = categoryStats.map((c) => ({
    name: c.category,
    value: c.count,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Real-time operational overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {[7, 30, 90].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                )}
              >
                {r}d
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-[18px] h-[18px] ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs font-medium text-gray-600 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Booking Activity (Last {range} days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={Math.floor(bookingTrend.length / 6)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} dot={false} name="New Bookings" />
                <Line type="monotone" dataKey="returns" stroke="#10b981" strokeWidth={2} dot={false} name="Returns" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category pie */}
        <Card>
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {pieData.slice(0, 5).map((item: any, i: number) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top assets */}
        <Card>
          <CardHeader>
            <CardTitle>Most Requested Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topAssets} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="assetName"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip contentStyle={{ borderRadius: "8px", fontSize: 12 }} />
                <Bar dataKey="totalBookings" fill="#f97316" radius={[0, 4, 4, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Booking Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {recentBookings.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400">No recent activity</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Asset</th>
                    <th>Status</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any) => (
                    <tr key={b.id}>
                      <td>
                        <div className="font-medium text-gray-800 text-xs">{b.user.name}</div>
                      </td>
                      <td>
                        <div className="text-xs text-gray-600 truncate max-w-[120px]">{b.asset.name}</div>
                      </td>
                      <td>
                        <span className={cn("badge text-[10px]", BOOKING_STATUS_COLORS[b.status as keyof typeof BOOKING_STATUS_COLORS])}>
                          {BOOKING_STATUS_LABELS[b.status as keyof typeof BOOKING_STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="text-xs text-gray-400 whitespace-nowrap">
                        {formatRelative(b.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
