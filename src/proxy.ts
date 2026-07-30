import { NextResponse, type NextRequest } from "next/server";

import { goneSceneIds } from "@/lib/seo/gone-scenes";

/**
 * Next 16.0.10 n'expose aucun moyen de renvoyer un statut arbitraire depuis un
 * Server Component : `notFound()` donne 404, `forbidden()`/`unauthorized()`
 * donnent 403/401, et il n'existe pas de `gone()`. Le 410 doit donc être émis
 * avant la page, c'est-à-dire ici.
 *
 * Aucune I/O ici : simple lookup dans un Set figé (cf. gone-scenes.ts). Tout ce
 * qui n'est pas une pierre tombale traverse sans modification — la résolution
 * de slug et les 308 restent intégralement gérés par
 * /scenes/[identifiant]/page.tsx.
 *
 * Fichier `proxy.ts` et non `middleware.ts` : Next 16 déprécie la convention
 * `middleware` au profit de `proxy` (même API).
 */
export default function proxy(request: NextRequest) {
  const identifiant = request.nextUrl.pathname.split("/")[2];

  if (identifiant && goneSceneIds.has(identifiant)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: {
        "content-type": "text/html; charset=utf-8",
        // Pas de mise en cache : le statut doit rester lisible par Googlebot
        // à chaque passage jusqu'à la désindexation.
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
      },
    });
  }

  return NextResponse.next();
}

const GONE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Scène retirée | Côté-Cour</title>
</head>
<body style="margin:0;background:#F9F7F3;color:#1C1B1F;font-family:system-ui,sans-serif">
<main style="max-width:32rem;margin:0 auto;padding:6rem 1.5rem;text-align:center">
<p style="font-size:.75rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#3b1f4a">Erreur 410</p>
<h1 style="font-size:1.75rem;margin:.5rem 0">Scène retirée</h1>
<p style="font-size:.875rem;line-height:1.6;color:#524b5a">Cette scène n'est plus disponible : elle relève d'une œuvre encore protégée par le droit d'auteur. Le catalogue Côté-Cour ne publie que des textes du domaine public.</p>
<a href="/scenes" style="display:inline-block;margin-top:1.5rem;padding:.75rem 1.5rem;border-radius:9999px;background:linear-gradient(to right,#ff6b6b,#c74884);color:#fff;font-size:.875rem;font-weight:600;text-decoration:none">Parcourir les scènes</a>
</main>
</body>
</html>`;

// Matcher volontairement limité au premier segment sous /scenes : les URLs
// canoniques à 3 segments et le reste du site ne déclenchent jamais ce code.
// Les valeurs de matcher doivent être des littéraux statiques (Next les analyse
// au build), d'où ce motif générique plutôt que la liste d'UUID.
export const config = {
  matcher: ["/scenes/:identifiant"],
};
