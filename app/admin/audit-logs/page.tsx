"use client";

import { useState, useEffect } from "react";
import { ClipboardList, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner, EmptyState } from "@/components/ui/components";
import type { AuditLog, AuditAction } from "@/types";
import { formatDateTime, getInitials, cn } from "@/lib/utils";

const ACTION_COLORS: Record<AuditAction, string> = {
  USER_REGISTERED: "bg-blue-100 text-blue-700",
  USER_LOGIN: "bg-gray-100 text-gray-700",
  USER_LOGOUT: "bg-gray-100 text-gray-600",
  ASSET_CREATED: "bg-green-100 text-green-700",
  ASSET_UPDATED: "bg-yellow-100 text-yellow-700",
  ASSET_DELETED: "bg-red-100 text-red-700",
  BOOKING_CREATED: "bg-blue-100 text-blue-700",
  BOOKING_APPROVED: "bg-green-100 text-green-700",
  BOOKING_REJECTED: "bg-red-100 text-red-700",
  BOOKING_CANCELLED: "bg-orange-100 text-orange-700",
  ASSET_ISSUED: "bg-purple-100 text-purple-700",
  ASSET_RETURNED: "bg-teal-100 text-teal-700",
  MAINTENANCE_SCHEDULED: "bg-indigo-100 text-indigo-700",
  MAINTENANCE_COMPLETED: "bg-emerald-100 text-emerald-700",
};

const ACTION_LABELS: Record<AuditAction, string> = {
  USER_REGISTERED: "User Registered",
  USER_LOGIN: "User Login",
  USER_LOGOUT: "User Logout",
  ASSET_CREATED: "Asset Created",
  ASSET_UPDATED: "Asset Updated",
  ASSET_DELETED: "Asset Deleted",
  BOOKING_CREATED: "Booking Created",
  BOOKING_APPROVED: "Booking Approved",
  BOOKING_REJECTED: "Booking Rejected",
  BOOKING_CANCELLED: "Booking Cancelled",
  ASSET_ISSUED: "Asset Issued",
  ASSET_RETURNED: "Asset Returned",
  MAINTENANCE_SCHEDULED: "Maintenance Scheduled",
  MAINTENANCE_COMPLETED: "Maintenance Completed",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => { fetchLogs(); }, [page, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      params.set("page", String(page));
      params.set("pageSize", "20");
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">{total} total events recorded</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setActionFilter(""); setPage(1); }}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
            actionFilter === ""
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
          )}
        >
          All Events
        </button>
        {(["BOOKING_APPROVED", "BOOKING_REJECTED", "ASSET_ISSUED", "ASSET_RETURNED", "ASSET_CREATED", "ASSET_DELETED", "USER_REGISTERED"] as AuditAction[]).map((action) => (
          <button
            key={action}
            onClick={() => { setActionFilter(action); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              actionFilter === action
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
            )}
          >
            {ACTION_LABELS[action]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No audit logs found" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td>
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {getInitials(log.user.name)}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-800">{log.user.name}</div>
                            <div className="text-[10px] text-gray-400">{log.user.email}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">System</span>
                      )}
                    </td>
                    <td>
                      <span className={cn("badge text-[10px]", ACTION_COLORS[log.action as AuditAction] || "bg-gray-100 text-gray-700")}>
                        {ACTION_LABELS[log.action as AuditAction] || log.action}
                      </span>
                    </td>
                    <td className="text-xs text-gray-500 max-w-[240px] truncate">
                      {log.details || "—"}
                    </td>
                    <td className="text-xs text-gray-400">
                      {log.entityType ? (
                        <span>{log.entityType}</span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2">{page}/{totalPages}</span>
                <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
