"use client";

import { useState } from "react";
import { t } from "@/locales/fr";

export function ManageSubscriptionsButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/account/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Une erreur est survenue");
        setLoading(false);
        return;
      }

      // Rediriger vers le Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      alert("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-[#3b1f4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2a1538] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "..." : t.account.subscriptions.manageButton}
    </button>
  );
}

