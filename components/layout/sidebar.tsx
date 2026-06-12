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
  LogOut,
  ShieldCheck,
  BarChart3,
  Users,
  ClipboardList,
  Wrench,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface SidebarProps {
  user: SessionUser;
}

const userNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse Assets", href: "/assets", icon: Package },
  { label: "My Bookings", href: "/bookings", icon: CalendarCheck },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "History", href: "/history", icon: History },
  { label: "My Profile", href: "/profile", icon: User },
];

const adminNavItems = [
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Assets", href: "/admin/assets", icon: Package },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Asset Health", href: "/admin/health", icon: Wrench },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Activity Log", href: "/admin/history", icon: History },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="sidebar w-64 flex-shrink-0 flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <Link href={isAdmin ? "/admin/analytics" : "/dashboard"} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-200">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-[17px] leading-none tracking-tight">
              Sampadaa
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5 font-medium tracking-widest uppercase">
              {isAdmin ? "Admin Console" : "Resource Portal"}
            </div>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      {isAdmin && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/15">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-400 text-[11px] font-semibold tracking-wide uppercase">Administrator</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        <div className="px-3 pb-2 pt-1">
          <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
            {isAdmin ? "Management" : "Navigation"}
          </span>
        </div>

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
              <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0 transition-colors", isActive ? "text-orange-400" : "")} />
              <span className="flex-1 text-[13.5px]">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              )}
            </Link>
          );
        })}

        {/* Admin: asset catalogue link */}
        {isAdmin && (
          <>
            <div className="px-3 pb-2 pt-4">
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">User View</span>
            </div>
            <Link
              href="/assets"
              className={cn("sidebar-link", pathname === "/assets" && "active")}
            >
              <Package className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="text-[13.5px]">Asset Catalogue</span>
            </Link>
          </>
        )}
      </nav>

      {/* User info at bottom */}
      <div className="px-3 pb-3 pt-2 border-t border-white/5 space-y-1">
        <Link
          href={isAdmin ? "/profile" : "/profile"}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md shadow-orange-500/20">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
            <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
          </div>
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="sidebar-link w-full group hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/10"
          >
            <LogOut className="w-[17px] h-[17px] group-hover:text-red-400 transition-colors" />
            <span className="text-[13.5px]">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
