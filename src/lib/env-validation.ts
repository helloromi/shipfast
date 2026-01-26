/**
 * Validation des variables d'environnement au démarrage
 * 
 * Cette fonction doit être appelée au démarrage de l'application pour s'assurer
 * que toutes les variables d'environnement requises sont présentes.
 * 
 * En production, l'absence d'une variable critique fera échouer le démarrage.
 */

type EnvValidationResult = {
  ok: true;
} | {
  ok: false;
  errors: string[];
};

/**
 * Valide les variables d'environnement requises
 * @param isProduction - Si true, valide aussi les variables optionnelles en dev
 */
export function validateEnv(isProduction: boolean = process.env.NODE_ENV === "production"): EnvValidationResult {
  const errors: string[] = [];

  // Variables toujours requises
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "RESEND_API_KEY",
    "RESEND_FROM",
    "CRON_SECRET",
  ];

  // Variables requises uniquement en production
  const requiredInProduction = [
    "NEXT_PUBLIC_SITE_URL",
  ];

  // Variables optionnelles mais recommandées
  const optional = [
    "STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY",
    "STRIPE_SUBSCRIPTION_PRICE_ID_QUARTERLY",
    "STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY",
  ];

  // Valider les variables toujours requises
  for (const key of required) {
    if (!process.env[key] || process.env[key]!.trim() === "") {
      errors.push(`Variable d'environnement requise manquante: ${key}`);
    }
  }

  // Valider les variables requises en production
  if (isProduction) {
    for (const key of requiredInProduction) {
      if (!process.env[key] || process.env[key]!.trim() === "") {
        errors.push(`Variable d'environnement requise en production manquante: ${key}`);
      }
    }
  }

  // Avertir pour les variables optionnelles manquantes
  const missingOptional: string[] = [];
  for (const key of optional) {
    if (!process.env[key] || process.env[key]!.trim() === "") {
      missingOptional.push(key);
    }
  }

  if (missingOptional.length > 0 && isProduction) {
    console.warn(
      `⚠️  Variables d'environnement optionnelles manquantes (peuvent causer des erreurs): ${missingOptional.join(", ")}`
    );
  }

  // Validation spécifique pour CRON_SECRET (ne doit pas être la valeur par défaut)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret === "30f0beeed745ae3c40d4aefd0a6737e576d9a7306e54a5b51f93a48f221bac8e") {
    errors.push(
      "CRON_SECRET utilise la valeur par défaut du fichier example.env. ⚠️ SÉCURITÉ: Générer un secret aléatoire unique."
    );
  }

  // Validation du format des Price IDs Stripe
  const priceIdPattern = /^price_[a-zA-Z0-9]+$/;
  const priceIds = [
    process.env.STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY,
    process.env.STRIPE_SUBSCRIPTION_PRICE_ID_QUARTERLY,
    process.env.STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY,
  ].filter(Boolean) as string[];

  for (const priceId of priceIds) {
    if (!priceIdPattern.test(priceId)) {
      errors.push(`Format de Price ID Stripe invalide: ${priceId} (doit commencer par 'price_')`);
    }
  }

  // Validation du format de NEXT_PUBLIC_SITE_URL en production
  if (isProduction && process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    try {
      const url = new URL(siteUrl);
      if (url.protocol !== "https:") {
        errors.push(
          `NEXT_PUBLIC_SITE_URL doit utiliser HTTPS en production: ${siteUrl}`
        );
      }
    } catch {
      errors.push(`NEXT_PUBLIC_SITE_URL n'est pas une URL valide: ${siteUrl}`);
    }
  }

  // Validation du format de STRIPE_WEBHOOK_SECRET
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (webhookSecret && !webhookSecret.startsWith("whsec_")) {
    errors.push(
      `Format de STRIPE_WEBHOOK_SECRET invalide (doit commencer par 'whsec_'): ${webhookSecret.substring(0, 10)}...`
    );
  }

  // Validation du format de STRIPE_SECRET_KEY
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey && !stripeKey.startsWith("sk_")) {
    errors.push(
      `Format de STRIPE_SECRET_KEY invalide (doit commencer par 'sk_'): ${stripeKey.substring(0, 10)}...`
    );
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true };
}

/**
 * Valide les variables d'environnement et lance une erreur si des variables critiques manquent
 * À appeler au démarrage de l'application
 */
export function assertEnvValid(isProduction?: boolean): void {
  const result = validateEnv(isProduction);
  if (!result.ok) {
    const errorMessage = [
      "❌ Erreurs de configuration des variables d'environnement:",
      ...result.errors.map((e) => `  - ${e}`),
      "",
      "Corrigez ces erreurs avant de démarrer l'application.",
    ].join("\n");

    if (isProduction ?? process.env.NODE_ENV === "production") {
      throw new Error(errorMessage);
    } else {
      console.error(errorMessage);
      console.warn("⚠️  L'application démarre malgré les erreurs (mode développement)");
    }
  }
}
