"use client";

import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/types";

interface QrModalProps {
  asset: Asset;
  onClose: () => void;
}

export function QrModal({ asset, onClose }: QrModalProps) {
  function handleDownload() {
    if (!asset.qrCode) return;
    const link = document.createElement("a");
    link.href = asset.qrCode;
    link.download = `qr-${asset.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.click();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Asset QR Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 text-center">
          <h3 className="font-medium text-gray-900 mb-1">{asset.name}</h3>
          <p className="text-xs text-gray-400 mb-4">{asset.category?.name}</p>
          {asset.qrCode ? (
            <div className="flex justify-center">
              <img
                src={asset.qrCode}
                alt="QR Code"
                className="w-48 h-48 border-4 border-gray-100 rounded-xl"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mx-auto text-sm text-gray-400">
              QR not generated
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Scan to view asset details during issue/return
          </p>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Close</Button>
          {asset.qrCode && (
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
