import type { NextConfig } from "next";
import { assertEnvValid } from "./src/lib/env-validation";

// Valider les variables d'environnement au build time
// En production, cela fera échouer le build si des variables critiques manquent
const isProduction = process.env.NODE_ENV === "production";
try {
  assertEnvValid(isProduction);
} catch (error) {
  // En production, on fait échouer le build
  if (isProduction) {
    throw error;
  }
  // En développement, on affiche juste un avertissement
  console.warn("⚠️  Variables d'environnement manquantes (mode développement)");
}

const nextConfig: NextConfig = {
  turbopack: {
    // Force le root pour éviter que Next choisisse /Users/pauloromi à cause d'autres lockfiles
    root: __dirname,
  },
};

export default nextConfig;
