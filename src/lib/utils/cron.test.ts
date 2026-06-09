import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import { assertCronAuth } from "./cron";

const SECRET = "test-cron-secret";

function makeRequest(authorization?: string): NextRequest {
  return new NextRequest("https://cote-cour.fr/api/cron/test", {
    headers: authorization ? { authorization } : {},
  });
}

describe("assertCronAuth", () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("refuse si CRON_SECRET n'est pas configuré", () => {
    delete process.env.CRON_SECRET;
    expect(assertCronAuth(makeRequest(`Bearer ${SECRET}`)).ok).toBe(false);
  });

  it("refuse sans header Authorization", () => {
    process.env.CRON_SECRET = SECRET;
    expect(assertCronAuth(makeRequest()).ok).toBe(false);
  });

  it("refuse un token invalide", () => {
    process.env.CRON_SECRET = SECRET;
    expect(assertCronAuth(makeRequest("Bearer wrong-token")).ok).toBe(false);
  });

  it("refuse un header sans schéma Bearer", () => {
    process.env.CRON_SECRET = SECRET;
    expect(assertCronAuth(makeRequest(SECRET)).ok).toBe(false);
  });

  it("accepte le bon token", () => {
    process.env.CRON_SECRET = SECRET;
    expect(assertCronAuth(makeRequest(`Bearer ${SECRET}`))).toEqual({ ok: true });
  });

  it("accepte 'bearer' en minuscules", () => {
    process.env.CRON_SECRET = SECRET;
    expect(assertCronAuth(makeRequest(`bearer ${SECRET}`))).toEqual({ ok: true });
  });
});
