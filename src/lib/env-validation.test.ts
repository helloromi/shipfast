import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { validateEnv } from "./env-validation";

const REQUIRED_VALID: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
  RESEND_API_KEY: "re_123",
  RESEND_FROM: "Test <test@example.com>",
  CRON_SECRET: "a-strong-secret",
};

const ENV_KEYS = [
  ...Object.keys(REQUIRED_VALID),
  "NEXT_PUBLIC_SITE_URL",
  "STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY",
  "STRIPE_SUBSCRIPTION_PRICE_ID_QUARTERLY",
  "STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY",
];

let saved: Record<string, string | undefined> = {};

describe("validateEnv", () => {
  beforeEach(() => {
    saved = {};
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
    Object.assign(process.env, REQUIRED_VALID);
  });

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("valide une configuration complète (dev)", () => {
    expect(validateEnv(false)).toEqual({ ok: true });
  });

  it("signale chaque variable requise manquante", () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.RESEND_API_KEY;
    const result = validateEnv(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join("\n")).toContain("STRIPE_SECRET_KEY");
      expect(result.errors.join("\n")).toContain("RESEND_API_KEY");
    }
  });

  it("exige NEXT_PUBLIC_SITE_URL en production seulement", () => {
    expect(validateEnv(false).ok).toBe(true);
    const prod = validateEnv(true);
    expect(prod.ok).toBe(false);
    if (!prod.ok) {
      expect(prod.errors.join("\n")).toContain("NEXT_PUBLIC_SITE_URL");
    }
  });

  it("refuse une NEXT_PUBLIC_SITE_URL non-HTTPS en production", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://insecure.example";
    const result = validateEnv(true);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join("\n")).toContain("HTTPS");
    }
  });

  it("refuse le CRON_SECRET d'exemple", () => {
    process.env.CRON_SECRET =
      "30f0beeed745ae3c40d4aefd0a6737e576d9a7306e54a5b51f93a48f221bac8e";
    const result = validateEnv(false);
    expect(result.ok).toBe(false);
  });

  it("valide le format des Price IDs Stripe", () => {
    process.env.STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY = "pas-un-price-id";
    const result = validateEnv(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join("\n")).toContain("Price ID");
    }
  });

  it("valide les préfixes des clés Stripe", () => {
    process.env.STRIPE_SECRET_KEY = "mauvaise-cle";
    process.env.STRIPE_WEBHOOK_SECRET = "mauvais-secret";
    const result = validateEnv(false);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    }
  });
});
