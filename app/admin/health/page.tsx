"use client";

import { useState, useEffect } from "react";
import {
  Wrench, Plus, CheckCircle, Clock, AlertTriangle,
  Package, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner, EmptyState, Card, CardHeader, CardTitle, CardContent, Label, Textarea } from "@/components/ui/components";
import { CONDITION_LABELS, CONDITION_COLORS, formatDate, formatCurrency, cn } from "@/lib/utils";
import type { Asset, MaintenanceLog, AssetCondition } from "@/types";

const CONDITIONS: AssetCondition[] = ["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"];

export default function AdminHealthPage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    assetId: "",
    title: "",
    description: "",
    condition: "FAIR" as AssetCondition,
    cost: "",
    technicianName: "",
    scheduledAt: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [logsRes, assetsRes] = await Promise.all([
        fetch("/api/admin/maintenance"),
        fetch("/api/assets?pageSize=100"),
      ]);
      const [logsData, assetsData] = await Promise.all([logsRes.json(), assetsRes.json()]);
      if (logsData.success) setLogs(logsData.data.logs);
      if (assetsData.success) setAssets(assetsData.data.assets);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cost: form.cost ? Number(form.cost) : undefined }),
      });
      const data = await res.json();
      if (!data.success) { setFormError(data.error); return; }
      setFormOpen(false);
      setForm({ assetId: "", title: "", description: "", condition: "FAIR", cost: "", technicianName: "", scheduledAt: "" });
      fetchAll();
    } catch {
      setFormError("Network error.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleComplete(logId: string) {
    if (!confirm("Mark this maintenance as completed?")) return;
    setCompleting(logId);
    try {
      const res = await fetch(`/api/admin/maintenance/${logId}`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) fetchAll();
    } finally {
      setCompleting(null);
    }
  }

  // Group by asset
  const byAsset: Record<string, MaintenanceLog[]> = {};
  for (const log of logs) {
    const key = log.asset?.name || log.assetId;
    if (!byAsset[key]) byAsset[key] = [];
    byAsset[key].push(log);
  }

  // Assets under maintenance
  const underMaintenance = assets.filter((a) => a.status === "UNDER_MAINTENANCE");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Health Tracking</h1>
          <p className="page-subtitle">
            {logs.length} maintenance records · {underMaintenance.length} assets currently under maintenance
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4" />
          Log Maintenance
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(["EXCELLENT", "GOOD", "FAIR", "POOR"] as AssetCondition[]).map((cond) => {
          const count = assets.filter((a) => a.condition === cond && a.isActive).length;
          return (
            <div key={cond} className="stat-card">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className={cn("text-sm font-semibold mt-1", CONDITION_COLORS[cond])}>
                {CONDITION_LABELS[cond]}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">condition</div>
            </div>
          );
        })}
      </div>

      {/* Under maintenance */}
      {underMaintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Wrench className="w-4 h-4" /> Currently Under Maintenance ({underMaintenance.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Available Qty</th>
                </tr>
              </thead>
              <tbody>
                {underMaintenance.map((asset) => (
                  <tr key={asset.id}>
                    <td className="font-medium text-gray-900">{asset.name}</td>
                    <td className="text-gray-500 text-sm">{asset.category?.name}</td>
                    <td>
                      <span className={cn("text-sm font-medium", CONDITION_COLORS[asset.condition])}>
                        {CONDITION_LABELS[asset.condition]}
                      </span>
                    </td>
                    <td className="text-center">{asset.availableQty}/{asset.totalQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Maintenance logs */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance records yet"
          description="Log maintenance events to track asset health over time."
          action={<Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" />Log Maintenance</Button>}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Title</th>
                  <th>Condition After</th>
                  <th>Technician</th>
                  <th>Cost</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium text-gray-800 text-sm">
                      {log.asset?.name || "—"}
                    </td>
                    <td>
                      <div className="text-sm text-gray-700">{log.title}</div>
                      {log.description && (
                        <div className="text-xs text-gray-400 truncate max-w-[180px]">{log.description}</div>
                      )}
                    </td>
                    <td>
                      <span className={cn("text-sm font-medium", CONDITION_COLORS[log.condition])}>
                        {CONDITION_LABELS[log.condition]}
                      </span>
                    </td>
                    <td className="text-gray-500 text-sm">{log.technicianName || "—"}</td>
                    <td className="text-gray-600 text-sm">
                      {log.cost ? formatCurrency(log.cost) : "—"}
                    </td>
                    <td className="text-gray-400 text-xs whitespace-nowrap">
                      {log.scheduledAt ? formatDate(log.scheduledAt) : "—"}
                    </td>
                    <td>
                      {log.completedAt ? (
                        <span className="badge bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Done {formatDate(log.completedAt)}
                        </span>
                      ) : (
                        <span className="badge bg-orange-100 text-orange-700 border-orange-200">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      {!log.completedAt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleComplete(log.id)}
                          loading={completing === log.id}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create maintenance modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Wrench className="w-[18px] h-[18px] text-orange-500" />
                </div>
                <h2 className="font-semibold text-gray-900">Log Maintenance Event</h2>
              </div>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{formError}</div>
              )}

              <div>
                <Label>Asset *</Label>
                <select
                  value={form.assetId}
                  onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                  required
                  className="mt-1.5 flex h-9 w-full rounded-lg border border-input px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">Select asset</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Maintenance Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sensor cleaning, Lens repair"
                  required className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Condition After *</Label>
                  <select
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value as AssetCondition })}
                    className="mt-1.5 flex h-9 w-full rounded-lg border border-input px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Cost (₹)</Label>
                  <Input
                    type="number" min={0}
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Technician Name</Label>
                  <Input
                    value={form.technicianName}
                    onChange={(e) => setForm({ ...form, technicianName: e.target.value })}
                    placeholder="Optional"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="date"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the maintenance work…"
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </form>

            <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" loading={formLoading} onClick={handleCreate}>Log Maintenance</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
