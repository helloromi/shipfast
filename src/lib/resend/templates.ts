import { getSiteUrl } from "@/lib/url";

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

// Couleurs alignées sur l'app (globals.css)
const EMAIL_BG = "#f9f7f3";
const EMAIL_INK = "#1c1b1f";
const EMAIL_PRUNE = "#3b1f4a";
const EMAIL_CORAIL = "#ff6b6b";
const EMAIL_MUTED = "#524b5a";
const EMAIL_STROKE = "#e7e1d9";
const EMAIL_CARD = "#ffffff";
const EMAIL_APP_NAME = "Côté-Cour";

function base(): { siteUrl: string } {
  return { siteUrl: getSiteUrl() };
}

function wrapEmailBody(
  siteUrl: string,
  content: string,
  options?: { preheader?: string }
): string {
  const year = new Date().getFullYear();
  const preheader = options?.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${options.preheader}</div>`
    : "";
  return `
<div style="width:100%;background-color:${EMAIL_BG};padding:24px;">
  ${preheader}
  <div style="max-width:600px;margin:0 auto;background:${EMAIL_CARD};border-radius:12px;border:1px solid ${EMAIL_STROKE};">
    <div style="padding:20px 24px;border-bottom:1px solid ${EMAIL_STROKE};">
      <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${EMAIL_PRUNE};font-weight:600;">${EMAIL_APP_NAME}</span>
    </div>
    <div style="padding:24px;color:${EMAIL_INK};font-size:16px;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      ${content}
    </div>
    <div style="padding:16px 24px;font-size:12px;color:${EMAIL_MUTED};border-top:1px solid ${EMAIL_STROKE};">
      © ${year} ${EMAIL_APP_NAME} · <a href="${siteUrl}" style="color:${EMAIL_PRUNE};text-decoration:none;">Ouvrir l'app</a> · <a href="${siteUrl}/confidentialite" style="color:${EMAIL_PRUNE};text-decoration:none;">Politique de confidentialité</a>
    </div>
  </div>
</div>
  `.trim();
}

function buildCta(url: string, label: string, primary: "prune" | "corail"): string {
  const bg = primary === "prune" ? EMAIL_PRUNE : EMAIL_CORAIL;
  return `<a href="${url}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:${bg};color:white;text-decoration:none;font-weight:600;font-size:15px;">${label}</a>`;
}

function buildFallbackLink(url: string, label: string): string {
  return `<p style="margin:24px 0 0;color:${EMAIL_MUTED};font-size:12px;">${label}: ${url}</p>`;
}

export function welcomeEmail(): EmailTemplate {
  const { siteUrl } = base();
  const subject = "Bienvenue sur Côté-Cour — on démarre ?";
  const ctaUrl = `${siteUrl}/home`;
  const text = `Bienvenue !\n\nTu peux commencer ici: ${ctaUrl}\n`;
  const content = `
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${EMAIL_INK};">Bienvenue !</h1>
    <p style="margin:0 0 16px;">Ton espace est prêt. Tu peux commencer tout de suite.</p>
    <p style="margin:0 0 16px;">${buildCta(ctaUrl, "Commencer", "prune")}</p>
    ${buildFallbackLink(ctaUrl, "Si le bouton ne fonctionne pas")}
  `.trim();
  const html = wrapEmailBody(siteUrl, content, { preheader: "Bienvenue sur Côté-Cour" });
  return { subject, html, text };
}

export function unpaidReminderEmail(): EmailTemplate {
  const { siteUrl } = base();
  const subject = "Il te reste une étape pour commencer ton apprentissage";
  const ctaUrl = `${siteUrl}/subscribe`;
  const text = `Tu peux débloquer toutes les fonctionnalités ici: ${ctaUrl}\n`;
  const content = `
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${EMAIL_INK};">Tout débloquer</h1>
    <p style="margin:0 0 16px;">Ton compte est prêt, il te reste une étape pour accéder à tout.</p>
    <p style="margin:0 0 16px;">${buildCta(ctaUrl, "Continuer vers le paiement", "corail")}</p>
    ${buildFallbackLink(ctaUrl, "Lien direct")}
  `.trim();
  const html = wrapEmailBody(siteUrl, content, { preheader: "Une étape pour débloquer tout Côté-Cour" });
  return { subject, html, text };
}

export function paymentThankYouEmail(): EmailTemplate {
  const { siteUrl } = base();
  const subject = "Merci pour ton abonnement";
  const ctaUrl = `${siteUrl}/home`;
  const text = `Merci ! Tu peux reprendre ici: ${ctaUrl}\n`;
  const content = `
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${EMAIL_INK};">Merci !</h1>
    <p style="margin:0 0 16px;">Ton abonnement est actif. Bon apprentissage.</p>
    <p style="margin:0 0 16px;">${buildCta(ctaUrl, "Reprendre", "prune")}</p>
    ${buildFallbackLink(ctaUrl, "Lien direct")}
  `.trim();
  const html = wrapEmailBody(siteUrl, content, { preheader: "Merci pour ton abonnement Côté-Cour" });
  return { subject, html, text };
}

export function inactivityEmail(days: number): EmailTemplate {
  const { siteUrl } = base();
  const subject = "On reprend ?";
  const ctaUrl = `${siteUrl}/home`;
  const text = `Ça fait ${days} jours. Reprends ton apprentissage ici: ${ctaUrl}\n`;
  const content = `
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${EMAIL_INK};">On reprend ?</h1>
    <p style="margin:0 0 16px;">Ça fait ${days} jours depuis ta dernière session. Un petit run aujourd'hui ?</p>
    <p style="margin:0 0 16px;">${buildCta(ctaUrl, "Reprendre", "prune")}</p>
    ${buildFallbackLink(ctaUrl, "Lien direct")}
  `.trim();
  const html = wrapEmailBody(siteUrl, content, { preheader: "On reprend ton texte sur Côté-Cour ?" });
  return { subject, html, text };
}

export function importReadyEmail(params: { jobId: string; title?: string }): EmailTemplate {
  const { siteUrl } = base();
  const sceneTitle = params.title || "Ta scène";
  const subject = `${sceneTitle} est prête à être importée`;
  const ctaUrl = `${siteUrl}/imports/${params.jobId}/preview`;
  const text = `Ton import "${sceneTitle}" est prêt ! Valide-le ici: ${ctaUrl}\n`;
  const content = `
    <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${EMAIL_INK};">Ton import est prêt !</h1>
    <p style="margin:0 0 16px;"><strong>${sceneTitle}</strong> a été traité avec succès et attend ta validation.</p>
    <p style="margin:0 0 16px;">Clique ci-dessous pour vérifier le contenu extrait, ajuster si nécessaire, et valider la création de ta scène.</p>
    <p style="margin:0 0 16px;">${buildCta(ctaUrl, "Valider mon import", "corail")}</p>
    ${buildFallbackLink(ctaUrl, "Lien direct")}
  `.trim();
  const html = wrapEmailBody(siteUrl, content, { preheader: `${sceneTitle} est prête à être importée` });
  return { subject, html, text };
}
