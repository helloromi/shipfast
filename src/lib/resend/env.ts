function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

export function getResendEnv() {
  return {
    apiKey: requireEnv("RESEND_API_KEY"),
    from: requireEnv("RESEND_FROM"),
    replyTo: process.env.RESEND_REPLY_TO || null,
    audienceId: process.env.RESEND_AUDIENCE_ID || null,
  };
}

