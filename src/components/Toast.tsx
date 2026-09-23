'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

export const toast = {
  error: (message: string) => {
    toast.show('error', message);
  },
  success: (message: string) => {
    toast.show('success', message);
  },
  info: (message: string) => {
    toast.show('info', message);
  },
  show: (type: ToastType, message: string) => {
    if (!message) return;
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type, message };
    toasts = [...toasts, item];
    notify();

    setTimeout(() => {
      toast.dismiss(id);
    }, 4500);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export function ToastContainer() {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener: ToastListener = (updated) => setActiveToasts(updated);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (activeToasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-2.5 pointer-events-none"
    >
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border-2 bg-white px-4 py-3 shadow-pop transition-all animate-pop-in ${
            t.type === 'error'
              ? 'border-red-500'
              : t.type === 'success'
              ? 'border-emerald-500'
              : 'border-foreground'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {t.type === 'error' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-4 w-4" />
              </div>
            )}
            {t.type === 'success' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            )}
            {t.type === 'info' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Info className="h-4 w-4" />
              </div>
            )}
            <p className="text-sm font-semibold text-foreground truncate-2-lines break-words">
              {t.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
