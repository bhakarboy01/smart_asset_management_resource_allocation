"use client";

import { useState, useEffect } from "react";
import { X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea, Label } from "@/components/ui/components";
import type { Asset, Category } from "@/types";

interface AssetFormModalProps {
  asset?: Asset | null;
  categories: Category[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"];

export function AssetFormModal({ asset, categories, open, onClose, onSuccess }: AssetFormModalProps) {
  const isEdit = !!asset;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    totalQuantity: 1,
    availableQty: 1,
    condition: "GOOD",
    location: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    warrantyExpiry: "",
    imageUrl: "",
    notes: "",
  });

  useEffect(() => {
    if (asset) {
      setForm({
        name: asset.name,
        description: asset.description || "",
        categoryId: asset.categoryId,
        totalQuantity: asset.totalQuantity,
        availableQty: asset.availableQty,
        condition: asset.condition,
        location: asset.location || "",
        serialNumber: asset.serialNumber || "",
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split("T")[0] : "",
        purchasePrice: asset.purchasePrice ? String(asset.purchasePrice) : "",
        warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split("T")[0] : "",
        imageUrl: asset.imageUrl || "",
        notes: asset.notes || "",
      });
    }
  }, [asset]);

  if (!open) return null;

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      ...form,
      totalQuantity: Number(form.totalQuantity),
      availableQty: Number(form.availableQty),
      purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
    };

    try {
      const url = isEdit ? `/api/assets/${asset!.id}` : "/api/assets";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package className="w-[18px] h-[18px] text-orange-500" />
            </div>
            <h2 className="font-semibold text-gray-900">{isEdit ? "Edit Asset" : "Add New Asset"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Asset Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Canon EOS 80D DSLR Camera"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                required
                className="mt-1.5 flex h-9 w-full rounded-lg border border-input px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Condition *</Label>
              <select
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                className="mt-1.5 flex h-9 w-full rounded-lg border border-input px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Total Quantity *</Label>
              <Input
                type="number" min={1}
                value={form.totalQuantity}
                onChange={(e) => set("totalQuantity", e.target.value)}
                required className="mt-1.5"
              />
            </div>

            <div>
              <Label>Available Quantity *</Label>
              <Input
                type="number" min={0}
                value={form.availableQty}
                onChange={(e) => set("availableQty", e.target.value)}
                required className="mt-1.5"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Cultural Council Office, SAC"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Serial Number</Label>
              <Input
                value={form.serialNumber}
                onChange={(e) => set("serialNumber", e.target.value)}
                placeholder="Optional"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Purchase Date</Label>
              <Input type="date" value={form.purchaseDate} onChange={(e) => set("purchaseDate", e.target.value)} className="mt-1.5" />
            </div>

            <div>
              <Label>Purchase Price (₹)</Label>
              <Input type="number" min={0} value={form.purchasePrice} onChange={(e) => set("purchasePrice", e.target.value)} placeholder="0" className="mt-1.5" />
            </div>

            <div>
              <Label>Warranty Expiry</Label>
              <Input type="date" value={form.warrantyExpiry} onChange={(e) => set("warrantyExpiry", e.target.value)} className="mt-1.5" />
            </div>

            <div>
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://..." className="mt-1.5" />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief description of the asset…"
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Any additional notes for admins…"
                rows={2}
                className="mt-1.5"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-gray-100 flex-shrink-0">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={loading} onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Add Asset"}
          </Button>
        </div>
      </div>
    </div>
  );
}
