import { Resend } from "resend";
import { getResendEnv } from "./env";

export function createResendClient() {
  const { apiKey } = getResendEnv();
  return new Resend(apiKey);
}

