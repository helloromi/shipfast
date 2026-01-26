import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité - Côté-Cour",
  description: "Politique de confidentialité et protection des données personnelles",
};

export default function ConfidentialitePage() {
  return (
    <div className="prose prose-lg max-w-none">
      <h1>Politique de Confidentialité</h1>
      <p className="text-sm text-gray-600">Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}</p>

      <section>
        <h2>1. Collecte des Données</h2>
        <p>
          Côté-Cour collecte et traite les données personnelles suivantes :
        </p>
        <ul>
          <li>
            <strong>Données d'authentification</strong> : adresse email (via Supabase Auth)
          </li>
          <li>
            <strong>Données de profil</strong> : informations de compte, préférences d'utilisation
          </li>
          <li>
            <strong>Données d'utilisation</strong> : scènes importées, sessions d'apprentissage, scores de maîtrise
          </li>
          <li>
            <strong>Données de paiement</strong> : informations de facturation via Stripe (gérées par Stripe, nous ne stockons pas les numéros de carte)
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Utilisation des Données</h2>
        <p>Nous utilisons vos données pour :</p>
        <ul>
          <li>Fournir et améliorer nos services</li>
          <li>Gérer votre compte et vos abonnements</li>
          <li>Traiter vos paiements</li>
          <li>Vous envoyer des communications importantes (confirmations, notifications)</li>
          <li>Analyser l'utilisation du service pour l'améliorer</li>
        </ul>
      </section>

      <section>
        <h2>3. Traitement par des Tiers</h2>
        <p>Nous utilisons les services suivants qui peuvent traiter vos données :</p>
        <ul>
          <li>
            <strong>Supabase</strong> : hébergement de la base de données et authentification
          </li>
          <li>
            <strong>Stripe</strong> : traitement des paiements (conformément à leur politique de confidentialité)
          </li>
          <li>
            <strong>Resend</strong> : envoi d'emails transactionnels
          </li>
          <li>
            <strong>OpenAI</strong> : traitement du texte pour l'extraction et l'analyse des scènes (uniquement avec votre consentement explicite)
          </li>
        </ul>
        <p>
          <strong>Consentement IA</strong> : Lors de l'import de scènes, nous vous demandons explicitement votre consentement avant d'envoyer du contenu à OpenAI pour le traitement. Vous pouvez refuser ce traitement, mais certaines fonctionnalités d'extraction automatique ne seront pas disponibles.
        </p>
      </section>

      <section>
        <h2>4. Conservation des Données</h2>
        <p>
          Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment.
        </p>
      </section>

      <section>
        <h2>5. Vos Droits (RGPD)</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>
            <strong>Droit d'accès</strong> : Vous pouvez demander une copie de vos données personnelles
          </li>
          <li>
            <strong>Droit de rectification</strong> : Vous pouvez corriger vos données incorrectes
          </li>
          <li>
            <strong>Droit à l'effacement</strong> : Vous pouvez demander la suppression de vos données
          </li>
          <li>
            <strong>Droit à la portabilité</strong> : Vous pouvez exporter vos données dans un format structuré
          </li>
          <li>
            <strong>Droit d'opposition</strong> : Vous pouvez vous opposer au traitement de vos données
          </li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{" "}
          <a href={`mailto:${process.env.RESEND_FROM || "contact@cote-cour.studio"}`}>
            {process.env.RESEND_FROM || "contact@cote-cour.studio"}
          </a>
          {" "}ou utilisez la fonctionnalité de suppression de compte dans les paramètres.
        </p>
      </section>

      <section>
        <h2>6. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la perte ou la destruction. Cependant, aucun système n'est totalement sécurisé, et nous ne pouvons garantir une sécurité absolue.
        </p>
      </section>

      <section>
        <h2>7. Cookies et Technologies Similaires</h2>
        <p>
          Nous utilisons des cookies et des technologies similaires pour l'authentification et le fonctionnement du service. Ces cookies sont essentiels au fonctionnement de l'application.
        </p>
      </section>

      <section>
        <h2>8. Modifications</h2>
        <p>
          Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications importantes vous seront communiquées par email ou via une notification dans l'application.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Pour toute question concernant cette politique de confidentialité ou le traitement de vos données, contactez-nous à{" "}
          <a href={`mailto:${process.env.RESEND_FROM || "contact@cote-cour.studio"}`}>
            {process.env.RESEND_FROM || "contact@cote-cour.studio"}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
