import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";

export default async function RootPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin/analytics");
  }

  redirect("/dashboard");
}
