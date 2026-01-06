"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useImportNotifications() {
  const [hasNotifications, setHasNotifications] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Ne pas poller si on est déjà sur la page bibliothèque
    if (pathname === "/bibliotheque") {
      setHasNotifications(false);
      return;
    }

    // Fonction pour vérifier les imports terminés
    const checkImports = async () => {
      try {
        const response = await fetch("/api/scenes/import/status");
        if (!response.ok) return;

        const data = await response.json();
        if (data.success && data.count > 0) {
          setHasNotifications(true);
        } else {
          setHasNotifications(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des imports:", error);
      }
    };

    // Vérifier immédiatement
    checkImports();

    // Poller toutes les 5 secondes
    const interval = setInterval(checkImports, 5000);

    return () => clearInterval(interval);
  }, [pathname]);

  return hasNotifications;
}

