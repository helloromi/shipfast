import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Côté-Cour",
  description: "Politique de confidentialité et protection des données personnelles",
};

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-6 shadow-sm shadow-[#3b1f4a14]">
      <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
        {number}. {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-[#524b5a]">
        {children}
      </div>
    </section>
  );
}

function Item({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-[#3b1f4a]" aria-hidden="true" />
      <p>
        {label && <span className="font-semibold text-[#1c1b1f]">{label} : </span>}
        {children}
      </p>
    </div>
  );
}

export default function ConfidentialitePage() {
  const contact = process.env.RESEND_FROM || "contact@cote-cour.studio";

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      {/* En-tête */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Légal
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Politique de Confidentialité
        </h1>
        <p className="text-sm text-[#7a7184]">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>

      <Section number="1" title="Collecte des Données">
        <p>Côté-Cour collecte et traite les données personnelles suivantes :</p>
        <div className="flex flex-col gap-2">
          <Item label="Données d'authentification">adresse email (via Supabase Auth)</Item>
          <Item label="Données de profil">informations de compte, préférences d'utilisation</Item>
          <Item label="Données d'utilisation">scènes importées, sessions d'apprentissage, scores de maîtrise</Item>
          <Item label="Données de paiement">informations de facturation via Stripe (gérées par Stripe, nous ne stockons pas les numéros de carte)</Item>
        </div>
      </Section>

      <Section number="2" title="Utilisation des Données">
        <p>Nous utilisons vos données pour :</p>
        <div className="flex flex-col gap-2">
          <Item>Fournir et améliorer nos services</Item>
          <Item>Gérer votre compte et vos abonnements</Item>
          <Item>Traiter vos paiements</Item>
          <Item>Vous envoyer des communications importantes (confirmations, notifications)</Item>
          <Item>Analyser l'utilisation du service pour l'améliorer</Item>
        </div>
      </Section>

      <Section number="3" title="Traitement par des Tiers">
        <p>Nous utilisons les services suivants qui peuvent traiter vos données :</p>
        <div className="flex flex-col gap-2">
          <Item label="Supabase">hébergement de la base de données et authentification</Item>
          <Item label="Stripe">traitement des paiements (conformément à leur politique de confidentialité)</Item>
          <Item label="Resend">envoi d'emails transactionnels</Item>
          <Item label="OpenAI">traitement du texte pour l'extraction et l'analyse des scènes (uniquement avec votre consentement explicite)</Item>
        </div>
        <div className="rounded-xl border border-[#f4c95d] bg-[#fffbeb] px-4 py-3">
          <span className="font-semibold text-[#3b1f4a]">Consentement IA : </span>
          Lors de l'import de scènes, nous vous demandons explicitement votre consentement avant d'envoyer du contenu à OpenAI pour le traitement. Vous pouvez refuser ce traitement, mais certaines fonctionnalités d'extraction automatique ne seront pas disponibles.
        </div>
      </Section>

      <Section number="4" title="Conservation des Données">
        <p>
          Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment.
        </p>
      </Section>

      <Section number="5" title="Vos Droits (RGPD)">
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <div className="flex flex-col gap-2">
          <Item label="Droit d'accès">Vous pouvez demander une copie de vos données personnelles</Item>
          <Item label="Droit de rectification">Vous pouvez corriger vos données incorrectes</Item>
          <Item label="Droit à l'effacement">Vous pouvez demander la suppression de vos données</Item>
          <Item label="Droit à la portabilité">Vous pouvez exporter vos données dans un format structuré</Item>
          <Item label="Droit d'opposition">Vous pouvez vous opposer au traitement de vos données</Item>
        </div>
        <p>
          Pour exercer ces droits, contactez-nous à{" "}
          <a
            href={`mailto:${contact}`}
            className="font-semibold text-[#3b1f4a] underline underline-offset-4 hover:text-[#ff6b6b]"
          >
            {contact}
          </a>
          {" "}ou utilisez la fonctionnalité de suppression de compte dans les paramètres.
        </p>
      </Section>

      <Section number="6" title="Sécurité">
        <p>
          Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la perte ou la destruction. Cependant, aucun système n'est totalement sécurisé, et nous ne pouvons garantir une sécurité absolue.
        </p>
      </Section>

      <Section number="7" title="Cookies et Technologies Similaires">
        <p>
          Nous utilisons des cookies et des technologies similaires pour l'authentification et le fonctionnement du service. Ces cookies sont essentiels au fonctionnement de l'application.
        </p>
      </Section>

      <Section number="8" title="Modifications">
        <p>
          Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications importantes vous seront communiquées par email ou via une notification dans l'application.
        </p>
      </Section>

      <Section number="9" title="Contact">
        <p>
          Pour toute question concernant cette politique de confidentialité ou le traitement de vos données, contactez-nous à{" "}
          <a
            href={`mailto:${contact}`}
            className="font-semibold text-[#3b1f4a] underline underline-offset-4 hover:text-[#ff6b6b]"
          >
            {contact}
          </a>
          .
        </p>
      </Section>

      <div className="text-center text-sm text-[#7a7184]">
        <Link href="/" className="font-semibold text-[#3b1f4a] underline underline-offset-4 hover:text-[#ff6b6b]">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
