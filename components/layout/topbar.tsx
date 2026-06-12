"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn, getInitials, formatRelative } from "@/lib/utils";
import type { SessionUser, Notification } from "@/types";

interface TopBarProps {
  user: SessionUser;
}

const notifIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
  error: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  info: <Info className="w-3.5 h-3.5 text-blue-500" />,
};

export function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    if (showNotifs) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifs]);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications?limit=10");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch {
      // silent fail
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silent fail
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/assets?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0 sticky top-0 z-30">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets, bookings…"
            className="topbar-search"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifs(!showNotifs);
              if (!showNotifs && unreadCount > 0) fetchNotifications();
            }}
            className={cn(
              "relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150",
              showNotifs ? "bg-orange-50 text-orange-500" : "hover:bg-gray-100 text-gray-500"
            )}
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm shadow-orange-500/50 animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-12 w-[340px] bg-white rounded-2xl z-50 overflow-hidden animate-slide-up"
              style={{ boxShadow: "0 10px 40px -4px rgb(0 0 0 / 0.12), 0 4px 12px -4px rgb(0 0 0 / 0.06), 0 0 0 1px rgb(0 0 0 / 0.04)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifs(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="max-h-[340px] overflow-y-auto scrollbar-thin divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No notifications</p>
                    <p className="text-xs text-gray-400 mt-0.5">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "px-4 py-3 hover:bg-gray-50/80 transition-colors cursor-default",
                        !notif.isRead && "bg-orange-50/40"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                          notif.type === "success" ? "bg-emerald-100" :
                          notif.type === "error" ? "bg-red-100" :
                          notif.type === "warning" ? "bg-amber-100" :
                          "bg-blue-100"
                        )}>
                          {notifIcons[notif.type] || notifIcons.info}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-800 truncate">{notif.title}</p>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{formatRelative(notif.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                <Link
                  href="/notifications"
                  className="text-xs text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                  onClick={() => setShowNotifs(false)}
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 hover:bg-gray-100 rounded-xl px-2.5 py-1.5 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-orange-500/30 group-hover:scale-105 transition-transform">
            {getInitials(user.name)}
          </div>
          <div className="hidden sm:block">
            <div className="text-[13px] font-semibold text-gray-800 leading-none">
              {user.name.split(" ")[0]}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {user.role === "ADMIN" ? "Administrator" : user.department?.split(" ")[0] || "Student"}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
