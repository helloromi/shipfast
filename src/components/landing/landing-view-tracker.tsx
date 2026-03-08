"use client";

import { useEffect } from "react";

const SESSION_KEY = "landing_view_recorded";

export function LandingViewTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    fetch("/api/landing/view", { method: "POST" })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(SESSION_KEY, "1");
      })
      .catch(() => {});

    return undefined;
  }, []);

  return null;
}
