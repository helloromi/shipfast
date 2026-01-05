"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CheckoutButtonProps = {
  workId?: string;
  sceneId?: string;
  className?: string;
  children: React.ReactNode;
};

export function CheckoutButton({
  workId,
  sceneId,
  className,
  children,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!workId && !sceneId) return;

    setLoading(true);

    try {
      // Ne construire l'objet qu'avec les valeurs définies et non vides
      const body: { workId?: string; sceneId?: string } = {};
      if (workId && workId.trim() !== "") body.workId = workId;
      if (sceneId && sceneId.trim() !== "") body.sceneId = sceneId;

      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Erreur: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? "Chargement..." : children}
    </button>
  );
}




