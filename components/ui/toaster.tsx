"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Global event bus for toasts (no context needed) ─────────────────────────
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

type Listener = (toast: Toast) => void;
const listeners: Listener[] = [];

function emit(toast: Toast) {
  listeners.forEach((l) => l(toast));
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const toast = {
  show(opts: Omit<Toast, "id">) {
    emit({ ...opts, id: Math.random().toString(36).slice(2) });
  },
  success(title: string, message?: string) {
    this.show({ type: "success", title, message });
  },
  error(title: string, message?: string) {
    this.show({ type: "error", title, message });
  },
  info(title: string, message?: string) {
    this.show({ type: "info", title, message });
  },
  warning(title: string, message?: string) {
    this.show({ type: "warning", title, message });
  },
};

// ─── Toaster component (place once in root layout) ───────────────────────────
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const listener: Listener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => remove(t.id), 5000);
    };
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [remove]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  };

  const styles: Record<ToastType, string> = {
    success: "border-l-4 border-green-500",
    error: "border-l-4 border-red-500",
    info: "border-l-4 border-blue-500",
    warning: "border-l-4 border-yellow-500",
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "bg-white rounded-lg shadow-xl px-4 py-3 flex items-start gap-3 pointer-events-auto animate-fade-in",
            styles[t.type]
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
            {t.message && <p className="text-xs text-gray-500 mt-0.5">{t.message}</p>}
          </div>
          <button onClick={() => remove(t.id)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
