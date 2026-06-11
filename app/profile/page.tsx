import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import db from "@/lib/db/prisma";
import { ProfileClient } from "@/components/dashboard/profile-client";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: { _count: { select: { bookings: true } } },
  });

  if (!user) redirect("/auth/login");

  const bookingStats = await db.booking.groupBy({
    by: ["status"],
    where: { userId: sessionUser.id },
    _count: { status: true },
  });

  return <ProfileClient user={user} bookingStats={bookingStats} />;
}
