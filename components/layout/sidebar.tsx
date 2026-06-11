"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  BarChart3,
  Users,
  ClipboardList,
  Wrench,
  QrCode,
  ChevronRight,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface SidebarProps {
  user: SessionUser;
}

const userNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Browse Assets",
    href: "/assets",
    icon: Package,
  },
  {
    label: "My Bookings",
    href: "/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Borrowing History",
    href: "/history",
    icon: History,
  },
  {
    label: "My Profile",
    href: "/profile",
    icon: User,
  },
];

const adminNavItems = [
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Assets",
    href: "/admin/assets",
    icon: Package,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Asset Health",
    href: "/admin/health",
    icon: Wrench,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Activity Log",
    href: "/admin/history",
    icon: History,
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ClipboardList,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="sidebar w-64 flex-shrink-0 flex flex-col h-full border-r border-white/10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href={isAdmin ? "/admin/analytics" : "/dashboard"} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none font-display">
              Sampadaa
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {isAdmin ? "Admin Console" : "Resource Portal"}
            </div>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/20">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 text-xs font-semibold">Administrator</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin/analytics" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-link", isActive && "active")}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              )}
            </Link>
          );
        })}

        {/* Admin: also show user view link */}
        {isAdmin && (
          <>
            <div className="px-3 py-2 mt-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User View
              </div>
            </div>
            <Link href="/assets" className="sidebar-link">
              <Package className="w-[18px] h-[18px] flex-shrink-0" />
              <span>Asset Catalogue</span>
            </Link>
          </>
        )}
      </nav>

      {/* User info at bottom */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user.name}</div>
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="sidebar-link w-full mt-1 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
