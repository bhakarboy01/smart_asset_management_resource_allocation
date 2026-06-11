import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";

export default async function NotificationsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-3xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
