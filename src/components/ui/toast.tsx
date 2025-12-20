"use client";

import { useEffect } from "react";

type ToastVariant = "success" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
  duration?: number;
};

export function Toast({ message, variant = "success", onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => onClose(), duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const base =
    "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm shadow-lg border";
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-100 dark:border-emerald-800"
      : "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-800";

  return (
    <div className={`${base} ${styles}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-full px-2 py-1 text-xs font-semibold hover:bg-white/30 dark:hover:bg-white/10"
          aria-label="Fermer la notification"
        >
          ×
        </button>
      )}
    </div>
  );
}

