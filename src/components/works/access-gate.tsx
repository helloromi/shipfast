"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { AccessCheckResult } from "@/lib/utils/access-control";
import { CheckoutButton } from "@/components/payments/checkout-button";

type AccessGateProps = {
  user: User | null;
  sceneId: string;
  workId?: string;
  children: React.ReactNode;
  onAccessGranted?: () => void;
};

export function AccessGate({
  user,
  sceneId,
  workId,
  children,
  onAccessGranted,
}: AccessGateProps) {
  const router = useRouter();
  const [accessCheck, setAccessCheck] = useState<AccessCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setAccessCheck({
          hasAccess: false,
          accessType: "none",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/access/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sceneId, workId }),
        });

        if (!response.ok) {
          throw new Error("Failed to check access");
        }

        const result = await response.json();
        setAccessCheck(result);
      } catch (error) {
        console.error("Error checking access:", error);
        setAccessCheck({
          hasAccess: false,
          accessType: "none",
        });
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [user, sceneId, workId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-[#524b5a]">Vérification de l'accès...</div>
      </div>
    );
  }

  if (!accessCheck) {
    return null;
  }

  if (accessCheck.hasAccess) {
    return <>{children}</>;
  }

  // Pas d'accès - abonnement requis
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e7e1d9] bg-white/92 p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
          Accès réservé aux abonnés
        </h3>
        <p className="text-sm text-[#524b5a]">
          Abonnez-vous à 5€/mois pour débloquer l'apprentissage, l'import et toute la bibliothèque.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CheckoutButton 
          plan="monthly"
          className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
        >
          S'abonner — 5€/mois
        </CheckoutButton>

        {!user && (
          <button
            onClick={() => router.push("/login")}
            className="w-full rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
          >
            Se connecter
          </button>
        )}

        {onAccessGranted && (
          <button
            onClick={onAccessGranted}
            className="w-full rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
          >
            J'ai déjà payé
          </button>
        )}
      </div>
    </div>
  );
}
