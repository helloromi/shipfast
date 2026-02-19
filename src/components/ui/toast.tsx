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
    "fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-[80] flex w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-[#3b1f4a1a] backdrop-blur-md";
  const styles =
    variant === "success"
      ? "border-emerald-200 bg-white/90 text-[#1c1b1f]"
      : "border-red-200 bg-white/90 text-[#1c1b1f]";
  const iconColor = variant === "success" ? "text-emerald-600" : "text-red-600";

  return (
    <div
      className={`${base} ${styles}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      <span className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center ${iconColor}`}>
        {variant === "success" ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="flex-1 leading-snug">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-semibold text-[#524b5a] hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b6b] focus-visible:ring-offset-2"
          aria-label="Fermer la notification"
        >
          ×
        </button>
      )}
    </div>
  );
}




