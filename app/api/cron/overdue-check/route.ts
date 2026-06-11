import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/prisma";
import { createNotification } from "@/lib/utils/audit";
import { sendOverdueReminderEmail, sendDueSoonReminderEmail } from "@/lib/utils/email";
import { formatDate } from "@/lib/utils";
import { differenceInDays } from "date-fns";

/**
 * Cron endpoint — call this daily via a cron job or Vercel Cron.
 * Marks overdue bookings, sends reminder notifications and emails.
 *
 * Secure with CRON_SECRET env var:
 *   curl -H "Authorization: Bearer <CRON_SECRET>" /api/cron/overdue-check
 */
export async function GET(request: NextRequest) {
  // Simple bearer token protection
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let markedOverdue = 0;
  let remindersSet = 0;

  // ── 1. Mark past-due ISSUED bookings as OVERDUE ──────────────────────────
  const overdueBookings = await db.booking.findMany({
    where: {
      status: "ISSUED",
      toDate: { lt: now },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      asset: { select: { name: true } },
    },
  });

  for (const booking of overdueBookings) {
    await db.booking.update({
      where: { id: booking.id },
      data: { status: "OVERDUE" },
    });

    const daysOverdue = differenceInDays(now, booking.toDate);

    // In-app notification
    await createNotification({
      userId: booking.userId,
      title: "⚠️ Asset Return Overdue",
      message: `Your "${booking.asset.name}" is overdue by ${daysOverdue} day(s). Please return it immediately.`,
      type: "error",
      link: "/bookings",
    });

    // Email
    sendOverdueReminderEmail({
      to: booking.user.email,
      userName: booking.user.name,
      assetName: booking.asset.name,
      dueDate: formatDate(booking.toDate),
      daysOverdue,
    }).catch(() => {});

    markedOverdue++;
  }

  // ── 2. Send "due soon" reminders (2 days before) ─────────────────────────
  const dueSoonBookings = await db.booking.findMany({
    where: {
      status: "ISSUED",
      toDate: {
        gte: now,
        lte: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      asset: { select: { name: true } },
    },
  });

  for (const booking of dueSoonBookings) {
    const daysLeft = Math.max(1, differenceInDays(booking.toDate, now));

    // Check: don't spam — only notify once per booking per day
    const recentNotif = await db.notification.findFirst({
      where: {
        userId: booking.userId,
        title: { contains: "Return Reminder" },
        createdAt: { gte: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
      },
    });

    if (recentNotif) continue;

    await createNotification({
      userId: booking.userId,
      title: "⏰ Return Reminder",
      message: `Please return "${booking.asset.name}" in ${daysLeft} day(s) (due ${formatDate(booking.toDate)}).`,
      type: "warning",
      link: "/bookings",
    });

    sendDueSoonReminderEmail({
      to: booking.user.email,
      userName: booking.user.name,
      assetName: booking.asset.name,
      dueDate: formatDate(booking.toDate),
      daysLeft,
    }).catch(() => {});

    remindersSet++;
  }

  // ── 3. Notify admins of overdue summary ──────────────────────────────────
  if (markedOverdue > 0) {
    const admins = await db.user.findMany({ where: { role: "ADMIN", isActive: true } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "Overdue Assets Summary",
        message: `${markedOverdue} booking(s) are now overdue and need follow-up.`,
        type: "warning",
        link: "/admin/bookings",
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: { markedOverdue, remindersSet },
    message: `Overdue check complete. ${markedOverdue} marked overdue, ${remindersSet} reminders sent.`,
  });
}
