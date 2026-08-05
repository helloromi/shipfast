import { permanentRedirect } from "next/navigation";

/**
 * L'accueil vit désormais sur `/` (cf. src/app/page.tsx). Cette route reste servie
 * parce qu'elle a été indexée et liée : `/landing` figurait au sitemap avec une
 * priorité de 0.9, et Search Console lui attribue des impressions.
 *
 * 308 et non 307 : la cible est définitive et ne dépend d'aucune session, donc le
 * signal accumulé doit être transféré à `/` plutôt que réparti entre deux URLs.
 * (La redirection vers `/home` dans page.tsx, elle, dépend de la session et garde
 * pour cette raison un 307 — cf. le commentaire là-bas.)
 *
 * Sur Next 16.0.10, permanentRedirect() appelé depuis generateMetadata ne produit pas
 * un vrai statut HTTP ; depuis le composant de page, si — c'est le même constat que
 * sur les routes /scenes, et il est vérifié ici au build.
 */
export default function LandingRedirect() {
  permanentRedirect("/");
}
