"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { AccessCheckResult } from "@/lib/utils/access-control";
import { CheckoutButton } from "@/components/payments/checkout-button";
import { t } from "@/locales/fr";

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
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setAccessCheck({
          hasAccess: false,
          accessType: "none",
          canUseFreeSlot: false,
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
          canUseFreeSlot: false,
        });
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [user, sceneId, workId]);

  const handleUseFreeSlot = async () => {
    if (!user || !accessCheck?.canUseFreeSlot) return;

    setGranting(true);
    try {
      const response = await fetch("/api/access/grant-free-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sceneId }),
      });

      if (!response.ok) {
        throw new Error("Failed to grant free slot access");
      }

      const { success } = await response.json();
      if (success) {
        if (onAccessGranted) {
          onAccessGranted();
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error granting free slot access:", error);
    } finally {
      setGranting(false);
    }
  };

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

  // Pas d'accès - afficher le gate
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#e7e1d9] bg-white/92 p-6 shadow-sm">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
          {t.scenes.works.access.title || "Accès limité"}
        </h3>
        <p className="text-sm text-[#524b5a]">
          {t.scenes.works.access.description || "Vous devez débloquer cette œuvre pour y accéder."}
        </p>
      </div>

      {accessCheck.canUseFreeSlot && accessCheck.freeSlotInfo && (
        <div className="rounded-xl border border-[#f4c95d] bg-[#f4c95d33] p-4">
          <p className="text-sm font-semibold text-[#3b1f4a]">
            {t.scenes.works.access.freeSlotAvailable || "Slot gratuit disponible"}
          </p>
          <p className="mt-1 text-xs text-[#524b5a]">
            {t.scenes.works.access.freeSlotInfo
              ? t.scenes.works.access.freeSlotInfo
                  .replace("{used}", accessCheck.freeSlotInfo.usedLines.toString())
                  .replace("{limit}", accessCheck.freeSlotInfo.limit.toString())
                  .replace("{sceneLines}", accessCheck.freeSlotInfo.sceneLines.toString())
                  .replace("{remaining}", accessCheck.freeSlotInfo.remaining.toString())
              : `Vous avez utilisé ${accessCheck.freeSlotInfo.usedLines} répliques sur ${accessCheck.freeSlotInfo.limit}. ` +
                `Cette scène contient ${accessCheck.freeSlotInfo.sceneLines} répliques. ` +
                `Il vous reste ${accessCheck.freeSlotInfo.remaining} répliques gratuites.`}
          </p>
          <button
            onClick={handleUseFreeSlot}
            disabled={granting}
            className="mt-3 rounded-full bg-[#f4c95d] px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#e6b947] disabled:opacity-50"
          >
            {granting
              ? t.scenes.works.access.granting || "Déblocage..."
              : t.scenes.works.access.useFreeSlot || "Utiliser le slot gratuit"}
          </button>
        </div>
      )}

      {!accessCheck.canUseFreeSlot && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#524b5a]">
            {accessCheck.freeSlotInfo && accessCheck.freeSlotInfo.remaining === 0
              ? "Vous avez atteint la limite du slot gratuit (20 répliques). Débloquez cette œuvre pour continuer."
              : accessCheck.freeSlotInfo
              ? `Cette scène contient ${accessCheck.freeSlotInfo.sceneLines} répliques, mais il ne vous reste que ${accessCheck.freeSlotInfo.remaining} répliques gratuites. Débloquez cette œuvre pour continuer.`
              : t.scenes.works.access.purchaseRequired ||
                "Vous devez débloquer cette œuvre pour y accéder."}
          </p>
          <CheckoutButton
            workId={workId}
            sceneId={sceneId}
            className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
          >
            {t.scenes.works.access.purchaseButton || "Débloquer cette œuvre"}
          </CheckoutButton>
        </div>
      )}
    </div>
  );
}



