import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { requireAdmin, isAuthResponse } from "@/lib/auth/middleware";
import { subDays, format, startOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (isAuthResponse(authResult)) return authResult;

  const { searchParams } = new URL(request.url);
  const range = parseInt(searchParams.get("range") || "30");

  const rangeStart = subDays(new Date(), range);

  // Core stats
  const [
    totalAssets,
    availableAssets,
    totalUsers,
    pendingBookings,
    activeBookings,
    overdueBookings,
    totalBookings,
  ] = await Promise.all([
    db.asset.count({ where: { isActive: true } }),
    db.asset.count({ where: { isActive: true, status: "AVAILABLE" } }),
    db.user.count({ where: { isActive: true, role: "USER" } }),
    db.booking.count({ where: { status: "PENDING" } }),
    db.booking.count({ where: { status: { in: ["APPROVED", "ISSUED"] } } }),
    db.booking.count({
      where: {
        status: "ISSUED",
        toDate: { lt: new Date() },
      },
    }),
    db.booking.count({ where: { createdAt: { gte: rangeStart } } }),
  ]);

  // Most utilised assets
  const topAssets = await db.booking.groupBy({
    by: ["assetId"],
    _count: { assetId: true },
    where: { createdAt: { gte: rangeStart } },
    orderBy: { _count: { assetId: "desc" } },
    take: 8,
  });

  const topAssetsWithDetails = await Promise.all(
    topAssets.map(async (item) => {
      const asset = await db.asset.findUnique({
        where: { id: item.assetId },
        include: { category: true },
      });
      return {
        assetId: item.assetId,
        assetName: asset?.name || "Unknown",
        category: asset?.category?.name || "Unknown",
        totalBookings: item._count.assetId,
        utilizationRate:
          asset ? Math.round((item._count.assetId / Math.max(asset.totalQuantity, 1)) * 100) : 0,
      };
    })
  );

  // Category distribution
  const categoryStats = await db.asset.groupBy({
    by: ["categoryId"],
    _count: { categoryId: true },
    where: { isActive: true },
  });

  const categoryStatsWithNames = await Promise.all(
    categoryStats.map(async (item) => {
      const category = await db.category.findUnique({ where: { id: item.categoryId } });
      return {
        category: category?.name || "Unknown",
        count: item._count.categoryId,
        percentage: Math.round((item._count.categoryId / Math.max(totalAssets, 1)) * 100),
      };
    })
  );

  // Booking trend (last N days)
  const bookingTrend = [];
  for (let i = range - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [booked, returned] = await Promise.all([
      db.booking.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      }),
      db.booking.count({
        where: { returnedAt: { gte: dayStart, lt: dayEnd } },
      }),
    ]);

    bookingTrend.push({
      date: format(date, "dd MMM"),
      bookings: booked,
      returns: returned,
    });
  }

  // Booking status distribution
  const statusDistribution = await db.booking.groupBy({
    by: ["status"],
    _count: { status: true },
    where: { createdAt: { gte: rangeStart } },
  });

  // Recent activity
  const recentBookings = await db.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      asset: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        totalAssets,
        availableAssets,
        totalUsers,
        pendingBookings,
        activeBookings,
        overdueBookings,
        totalBookings,
      },
      topAssets: topAssetsWithDetails,
      categoryStats: categoryStatsWithNames,
      bookingTrend,
      statusDistribution,
      recentBookings,
    },
  });
}
