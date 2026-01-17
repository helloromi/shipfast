import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createResendClient } from "./client";
import { getResendEnv } from "./env";
import {
  inactivityEmail,
  paymentThankYouEmail,
  unpaidReminderEmail,
  welcomeEmail,
} from "./templates";

type EmailType = "welcome" | "unpaid_reminder_1" | "payment_thanks" | "inactivity";

function nowIso() {
  return new Date().toISOString();
}

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string } | null;
  return Boolean(e && e.code === "23505");
}

async function tryCreateEmailLog(params: {
  userId: string;
  emailType: EmailType;
  dedupeKey: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("email_log").insert({
    user_id: params.userId,
    email_type: params.emailType,
    dedupe_key: params.dedupeKey,
    status: "created",
    metadata: params.metadata ?? null,
  });

  if (error) {
    if (isUniqueViolation(error)) return { created: false as const };
    throw error;
  }
  return { created: true as const };
}

async function updateEmailLog(params: {
  dedupeKey: string;
  status: "sent" | "error" | "skipped";
  resendId?: string | null;
  error?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("email_log")
    .update({
      status: params.status,
      resend_id: params.resendId ?? null,
      error: params.error ?? null,
    })
    .eq("dedupe_key", params.dedupeKey);
  if (error) throw error;
}

async function ensureUserEmailStateRow(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("user_email_state")
    .upsert({ user_id: userId, updated_at: nowIso() }, { onConflict: "user_id" });
  if (error) throw error;
}

async function setUserEmailState(userId: string, patch: Record<string, unknown>) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("user_email_state")
    .update({ ...patch, updated_at: nowIso() })
    .eq("user_id", userId);
  if (error) throw error;
}

async function getUserProfile(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("email,marketing_consent,auth_created_at")
    .eq("user_id", userId)
    .maybeSingle<{ email: string | null; marketing_consent: boolean; auth_created_at: string | null }>();
  if (error) throw error;
  return data ?? null;
}

async function resolveEmailForUser(userId: string): Promise<string | null> {
  const profile = await getUserProfile(userId);
  if (profile?.email) return profile.email;

  // Fallback: Supabase Admin auth API (service role)
  const supabase = createSupabaseAdminClient();
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) return null;
    const email = data.user?.email ?? null;
    return email;
  } catch {
    return null;
  }
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const resend = createResendClient();
  const { from } = getResendEnv();
  const res = await resend.emails.send({
    from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
  return res;
}

export async function syncAudienceContactIfOptIn(userId: string) {
  const profile = await getUserProfile(userId);
  if (!profile?.marketing_consent) return { synced: false as const, reason: "no_consent" as const };

  const { audienceId } = getResendEnv();
  if (!audienceId) return { synced: false as const, reason: "no_audience" as const };

  const email = await resolveEmailForUser(userId);
  if (!email) return { synced: false as const, reason: "no_email" as const };

  const resend = createResendClient();

  // Upsert (get-by-email -> update, else create)
  const existing = await resend.contacts.get({ audienceId, email });
  if (existing.error) {
    // If not_found, create. For other errors, return.
    if (existing.error.name !== "not_found") {
      return { synced: false as const, reason: "resend_error" as const, error: existing.error.message };
    }
  }

  if (existing.data?.id) {
    const upd = await resend.contacts.update({ audienceId, id: existing.data.id, unsubscribed: false });
    if (upd.error) return { synced: false as const, reason: "resend_error" as const, error: upd.error.message };
    return { synced: true as const };
  }

  const created = await resend.contacts.create({ audienceId, email, unsubscribed: false });
  if (created.error) return { synced: false as const, reason: "resend_error" as const, error: created.error.message };
  return { synced: true as const };
}

export async function sendWelcomeEmailIfNeeded(userId: string) {
  await ensureUserEmailStateRow(userId);

  const email = await resolveEmailForUser(userId);
  if (!email) return { sent: false as const, reason: "no_email" as const };

  const dedupeKey = `welcome:${userId}`;
  const created = await tryCreateEmailLog({ userId, emailType: "welcome", dedupeKey });
  if (!created.created) return { sent: false as const, reason: "duplicate" as const };

  const tpl = welcomeEmail();
  try {
    const res = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    if (res.error) {
      await updateEmailLog({ dedupeKey, status: "error", error: res.error.message });
      return { sent: false as const, reason: "resend_error" as const, error: res.error.message };
    }
    await updateEmailLog({ dedupeKey, status: "sent", resendId: res.data?.id ?? null });
    await setUserEmailState(userId, { welcome_sent_at: nowIso() });
    return { sent: true as const };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await updateEmailLog({ dedupeKey, status: "error", error: message });
    return { sent: false as const, reason: "exception" as const, error: message };
  } finally {
    // best-effort sync
    await syncAudienceContactIfOptIn(userId).catch(() => null);
  }
}

export async function sendPaymentThankYouEmailIfNeeded(userId: string) {
  await ensureUserEmailStateRow(userId);
  const email = await resolveEmailForUser(userId);
  if (!email) return { sent: false as const, reason: "no_email" as const };

  const dedupeKey = `payment_thanks:${userId}`;
  const created = await tryCreateEmailLog({ userId, emailType: "payment_thanks", dedupeKey });
  if (!created.created) return { sent: false as const, reason: "duplicate" as const };

  const tpl = paymentThankYouEmail();
  try {
    const res = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    if (res.error) {
      await updateEmailLog({ dedupeKey, status: "error", error: res.error.message });
      return { sent: false as const, reason: "resend_error" as const, error: res.error.message };
    }
    await updateEmailLog({ dedupeKey, status: "sent", resendId: res.data?.id ?? null });
    await setUserEmailState(userId, { payment_thanks_sent_at: nowIso() });
    return { sent: true as const };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await updateEmailLog({ dedupeKey, status: "error", error: message });
    return { sent: false as const, reason: "exception" as const, error: message };
  } finally {
    await syncAudienceContactIfOptIn(userId).catch(() => null);
  }
}

export async function sendUnpaidReminder1Email(userId: string) {
  await ensureUserEmailStateRow(userId);
  const email = await resolveEmailForUser(userId);
  if (!email) return { sent: false as const, reason: "no_email" as const };

  const dedupeKey = `unpaid_reminder_1:${userId}`;
  const created = await tryCreateEmailLog({ userId, emailType: "unpaid_reminder_1", dedupeKey });
  if (!created.created) return { sent: false as const, reason: "duplicate" as const };

  const tpl = unpaidReminderEmail();
  try {
    const res = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    if (res.error) {
      await updateEmailLog({ dedupeKey, status: "error", error: res.error.message });
      return { sent: false as const, reason: "resend_error" as const, error: res.error.message };
    }
    await updateEmailLog({ dedupeKey, status: "sent", resendId: res.data?.id ?? null });
    await setUserEmailState(userId, { unpaid_reminder_1_sent_at: nowIso() });
    return { sent: true as const };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await updateEmailLog({ dedupeKey, status: "error", error: message });
    return { sent: false as const, reason: "exception" as const, error: message };
  } finally {
    await syncAudienceContactIfOptIn(userId).catch(() => null);
  }
}

export async function sendInactivityEmailIfNeeded(params: {
  userId: string;
  lastActivityAt: string;
  inactivityDays: number;
}) {
  await ensureUserEmailStateRow(params.userId);
  const email = await resolveEmailForUser(params.userId);
  if (!email) return { sent: false as const, reason: "no_email" as const };

  const dedupeKey = `inactivity:${params.userId}:${params.lastActivityAt}`;
  const created = await tryCreateEmailLog({
    userId: params.userId,
    emailType: "inactivity",
    dedupeKey,
    metadata: { lastActivityAt: params.lastActivityAt, inactivityDays: params.inactivityDays },
  });
  if (!created.created) return { sent: false as const, reason: "duplicate" as const };

  const tpl = inactivityEmail(params.inactivityDays);
  try {
    const res = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    if (res.error) {
      await updateEmailLog({ dedupeKey, status: "error", error: res.error.message });
      return { sent: false as const, reason: "resend_error" as const, error: res.error.message };
    }
    await updateEmailLog({ dedupeKey, status: "sent", resendId: res.data?.id ?? null });
    await setUserEmailState(params.userId, {
      inactivity_sent_at: nowIso(),
      last_inactivity_for_activity_at: params.lastActivityAt,
    });
    return { sent: true as const };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await updateEmailLog({ dedupeKey, status: "error", error: message });
    return { sent: false as const, reason: "exception" as const, error: message };
  } finally {
    await syncAudienceContactIfOptIn(params.userId).catch(() => null);
  }
}

