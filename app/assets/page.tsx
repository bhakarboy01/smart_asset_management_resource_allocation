"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Package,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle,
  Clock,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner, EmptyState, Badge } from "@/components/ui/components";
import { BookingModal } from "@/components/bookings/booking-modal";
import type { Asset, Category } from "@/types";
import { ASSET_STATUS_COLORS, ASSET_STATUS_LABELS, cn } from "@/lib/utils";

const STATUS_ICONS = {
  AVAILABLE: CheckCircle,
  PARTIALLY_AVAILABLE: Clock,
  UNAVAILABLE: AlertCircle,
  UNDER_MAINTENANCE: Wrench,
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [search, selectedCategory, selectedStatus, page]);

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
      if (selectedCategory) params.set("categoryId", selectedCategory);
      if (selectedStatus) params.set("status", selectedStatus);
      params.set("page", String(page));
      params.set("pageSize", "12");

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

  function handleBook(asset: Asset) {
    setSelectedAsset(asset);
    setBookingModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Catalogue</h1>
          <p className="page-subtitle">{total} assets available for booking</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search cameras, lights, costumes…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-lg border border-input text-sm bg-white min-w-[160px] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
          className="h-9 px-3 rounded-lg border border-input text-sm bg-white min-w-[160px] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="PARTIALLY_AVAILABLE">Partially Available</option>
          <option value="UNAVAILABLE">Unavailable</option>
        </select>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory("")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              selectedCategory === ""
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                selectedCategory === cat.id
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
              )}
            >
              {cat.name} {cat._count && `(${cat._count.assets})`}
            </button>
          ))}
        </div>
      )}

      {/* Asset grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No assets found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assets.map((asset) => {
              const StatusIcon = STATUS_ICONS[asset.status];
              const isBookable = asset.status === "AVAILABLE" || asset.status === "PARTIALLY_AVAILABLE";
              return (
                <div key={asset.id} className="asset-card">
                  {/* Asset image / placeholder */}
                  <div className="h-36 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center relative">
                    {asset.imageUrl ? (
                      <img
                        src={asset.imageUrl}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="w-14 h-14 text-orange-300" />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={cn("badge text-xs", ASSET_STATUS_COLORS[asset.status])}>
                        {ASSET_STATUS_LABELS[asset.status]}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                        {asset.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Tag className="w-3 h-3" />
                      <span>{asset.category?.name}</span>
                    </div>

                    {asset.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{asset.location}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{asset.availableQty}</span>
                        /{asset.totalQuantity} available
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleBook(asset)}
                      disabled={!isBookable}
                      variant={isBookable ? "default" : "secondary"}
                    >
                      {isBookable ? "Book Now" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Booking modal */}
      {selectedAsset && (
        <BookingModal
          asset={selectedAsset}
          open={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedAsset(null);
          }}
          onSuccess={() => {
            setBookingModalOpen(false);
            setSelectedAsset(null);
            fetchAssets();
          }}
        />
      )}
    </div>
  );
}
