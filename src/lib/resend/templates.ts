import { getSiteUrl } from "@/lib/url";

export type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function base(): { siteUrl: string } {
  return { siteUrl: getSiteUrl() };
}

export function welcomeEmail(): EmailTemplate {
  const { siteUrl } = base();
  const subject = "Bienvenue — on démarre ?";
  const ctaUrl = `${siteUrl}/home`;
  const text = `Bienvenue !\n\nTu peux commencer ici: ${ctaUrl}\n`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <h1 style="margin:0 0 12px;">Bienvenue !</h1>
      <p style="margin:0 0 16px;">Ton espace est prêt. Tu peux commencer tout de suite.</p>
      <p style="margin:0 0 16px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#3b1f4a;color:white;text-decoration:none;">
          Commencer
        </a>
      </p>
      <p style="margin:24px 0 0;color:#6b6471;font-size:12px;">Si le bouton ne fonctionne pas: ${ctaUrl}</p>
    </div>
  `.trim();
  return { subject, html, text };
}

export function unpaidReminderEmail(): EmailTemplate {
  const { siteUrl } = base();
  const subject = "Il te reste une étape pour tout débloquer";
  const ctaUrl = `${siteUrl}/subscribe`;
  const text = `Tu peux débloquer toutes les fonctionnalités ici: ${ctaUrl}\n`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <h1 style="margin:0 0 12px;">Tout débloquer</h1>
      <p style="margin:0 0 16px;">Ton compte est prêt, il te reste une étape pour accéder à tout.</p>
      <p style="margin:0 0 16px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#ff6b6b;color:white;text-decoration:none;">
          Continuer vers le paiement
        </a>
      </p>
      <p style="margin:24px 0 0;color:#6b6471;font-size:12px;">Lien direct: ${ctaUrl}</p>
    </div>
  `.trim();
  return { subject, html, text };
}

export function paymentThankYouEmail(): EmailTemplate {
  const { siteUrl } = base();
  const subject = "Merci pour ton abonnement";
  const ctaUrl = `${siteUrl}/home`;
  const text = `Merci ! Tu peux reprendre ici: ${ctaUrl}\n`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <h1 style="margin:0 0 12px;">Merci !</h1>
      <p style="margin:0 0 16px;">Ton abonnement est actif. Bon apprentissage.</p>
      <p style="margin:0 0 16px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#3b1f4a;color:white;text-decoration:none;">
          Reprendre
        </a>
      </p>
      <p style="margin:24px 0 0;color:#6b6471;font-size:12px;">Lien direct: ${ctaUrl}</p>
    </div>
  `.trim();
  return { subject, html, text };
}

export function inactivityEmail(days: number): EmailTemplate {
  const { siteUrl } = base();
  const subject = "On reprend ?";
  const ctaUrl = `${siteUrl}/home`;
  const text = `Ça fait ${days} jours. Reprends ton apprentissage ici: ${ctaUrl}\n`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <h1 style="margin:0 0 12px;">On reprend ?</h1>
      <p style="margin:0 0 16px;">Ça fait ${days} jours depuis ta dernière session. Un petit run aujourd'hui ?</p>
      <p style="margin:0 0 16px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#3b1f4a;color:white;text-decoration:none;">
          Reprendre
        </a>
      </p>
      <p style="margin:24px 0 0;color:#6b6471;font-size:12px;">Lien direct: ${ctaUrl}</p>
    </div>
  `.trim();
  return { subject, html, text };
}

export function importReadyEmail(params: { jobId: string; title?: string }): EmailTemplate {
  const { siteUrl } = base();
  const sceneTitle = params.title || "Ta scène";
  const subject = `${sceneTitle} est prête à valider`;
  const ctaUrl = `${siteUrl}/imports/${params.jobId}/preview`;
  const text = `Ton import "${sceneTitle}" est prêt ! Valide-le ici: ${ctaUrl}\n`;
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <h1 style="margin:0 0 12px;">Ton import est prêt !</h1>
      <p style="margin:0 0 16px;">
        <strong>${sceneTitle}</strong> a été traité avec succès et attend ta validation.
      </p>
      <p style="margin:0 0 16px;">
        Clique ci-dessous pour vérifier le contenu extrait, ajuster si nécessaire, et valider la création de ta scène.
      </p>
      <p style="margin:0 0 16px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:10px 14px;border-radius:10px;background:#ff6b6b;color:white;text-decoration:none;">
          Valider mon import
        </a>
      </p>
      <p style="margin:24px 0 0;color:#6b6471;font-size:12px;">Lien direct: ${ctaUrl}</p>
    </div>
  `.trim();
  return { subject, html, text };
}
