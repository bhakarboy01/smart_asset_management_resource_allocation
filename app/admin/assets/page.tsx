"use client";

import { useState, useEffect } from "react";
import {
  Plus, Search, Edit, Trash2, Package, QrCode,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner, EmptyState, Badge } from "@/components/ui/components";
import { AssetFormModal } from "@/components/admin/asset-form-modal";
import { QrModal } from "@/components/admin/qr-modal";
import type { Asset, Category } from "@/types";
import {
  ASSET_STATUS_COLORS,
  ASSET_STATUS_LABELS,
  CONDITION_LABELS,
  CONDITION_COLORS,
  formatDate,
  cn,
} from "@/lib/utils";

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchAssets(); }, [search, categoryFilter, page]);

  async function fetchCategories() {
    const res = await fetch("/api/assets/categories");
    const data = await res.json();
    if (data.success) setCategories(data.data.categories);
  }

  async function fetchAssets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      params.set("page", String(page));
      params.set("pageSize", "10");
      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();
      if (data.success) {
        setAssets(data.data.assets);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove asset "${name}"? This action cannot be undone.`)) return;
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchAssets();
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Inventory</h1>
          <p className="page-subtitle">{total} assets in catalogue</p>
        </div>
        <Button onClick={() => { setEditAsset(null); setFormOpen(true); }}>
          <Plus className="w-4 h-4" />
          Add Asset
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search assets…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-lg border border-input text-sm bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No assets found"
          action={<Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" />Add Asset</Button>}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Qty (Avail/Total)</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Location</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                          <Package className="w-[18px] h-[18px] text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 max-w-[200px] truncate">
                            {asset.name}
                          </div>
                          {asset.serialNumber && (
                            <div className="text-xs text-gray-400">S/N: {asset.serialNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-600">{asset.category?.name}</td>
                    <td>
                      <span className="font-semibold text-gray-900">{asset.availableQty}</span>
                      <span className="text-gray-400">/{asset.totalQuantity}</span>
                    </td>
                    <td>
                      <span className={cn("badge", ASSET_STATUS_COLORS[asset.status])}>
                        {ASSET_STATUS_LABELS[asset.status]}
                      </span>
                    </td>
                    <td>
                      <span className={cn("text-xs font-medium", CONDITION_COLORS[asset.condition])}>
                        {CONDITION_LABELS[asset.condition]}
                      </span>
                    </td>
                    <td className="text-gray-500 text-xs max-w-[120px] truncate">
                      {asset.location || "—"}
                    </td>
                    <td className="text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(asset.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQrAsset(asset)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditAsset(asset); setFormOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id, asset.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2">{page} / {totalPages}</span>
                <Button variant="outline" size="icon-sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {formOpen && (
        <AssetFormModal
          asset={editAsset}
          categories={categories}
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditAsset(null); }}
          onSuccess={() => { setFormOpen(false); setEditAsset(null); fetchAssets(); }}
        />
      )}
      {qrAsset && (
        <QrModal asset={qrAsset} onClose={() => setQrAsset(null)} />
      )}
    </div>
  );
}
