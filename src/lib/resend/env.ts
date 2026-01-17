function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function getResendEnv() {
  return {
    apiKey: requireEnv("RESEND_API_KEY"),
    from: requireEnv("RESEND_FROM"),
    audienceId: process.env.RESEND_AUDIENCE_ID || null,
  };
}

