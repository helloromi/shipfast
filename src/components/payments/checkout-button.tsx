"use client";

import { useState } from "react";
import { Toast } from "@/components/ui/toast";

type CheckoutButtonProps = {
  className?: string;
  children: React.ReactNode;
  plan: "monthly" | "quarterly" | "yearly";
};

export function CheckoutButton({
  className,
  children,
  plan,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de créer la session de paiement.");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue. Veuillez réessayer.";
      setErrorMessage(message);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={loading}
        aria-busy={loading}
        className={className}
      >
        {loading ? "Chargement…" : children}
      </button>
      {errorMessage && (
        <Toast
          message={errorMessage}
          variant="error"
          onClose={() => setErrorMessage(null)}
        />
      )}
    </>
  );
}




