/**
 * Scènes du catalogue retirées définitivement : elles répondent 410 Gone.
 *
 * Deux périmètres, une même raison — l'URL UUID a été indexée et ne réapparaîtra
 * jamais, 410 accélère sa sortie d'index par rapport à 404 :
 *
 *  1. Les lignes `scenes` rattachées à une œuvre `is_public_domain=false` ET
 *     `is_private=false`, c'est-à-dire les entrées de CATALOGUE d'une œuvre sous
 *     droits, qui n'auraient jamais dû être publiques.
 *  2. Les doublons de contenu supprimés en base le 30/07/2026
 *     (supabase/seed/dedupe-scenes.ts).
 *
 * Ne JAMAIS y mettre une scène `is_private=true` : ce sont les copies perso des
 * utilisateurs (`source_scene_id` non nul), elles vivent sur la même route
 * /scenes/[identifiant] et sont activement utilisées. Les 4 copies Building
 * (82a9c9d8, bc222815, 7e0a0d0f, b4894b9f) totalisent 121 sessions et doivent
 * continuer de répondre 200 pour leur propriétaire.
 *
 * Liste figée volontairement (pas de requête en middleware) : une pierre tombale
 * est permanente par nature, et le middleware doit rester sans I/O. Pour la
 * régénérer si une œuvre sous droits venait à être seedée par erreur :
 *
 *   select s.id, w.title
 *   from scenes s join works w on w.id = s.work_id
 *   where w.is_public_domain = false and s.is_private = false;
 */
export const goneSceneIds: ReadonlySet<string> = new Set([
  // ── Œuvres sous droits, jamais republiables ──
  // Building — Léonore Confino
  "b376a875-17bb-4ac9-b88f-762700ea191f",
  "c96a91da-fd22-4427-956c-ff96965e396b",
  // En attendant Godot — Samuel Beckett
  "acfbdf5f-f809-4bb2-b325-0f34c6a16805",

  // ── Doublons de contenu supprimés le 30/07/2026 ──
  // Deux générations de seed se chevauchaient (titres en chiffres arabes vs romains) :
  // ces entrées portaient le texte d'une scène déjà présente sous un autre slug. Les
  // URLs slug correspondantes, elles, sont redirigées en 308 vers la scène conservée
  // (cf. legacy-scene-redirects.ts) : seul l'accès par UUID répond 410.
  // Phèdre, acte I sc. 3 (63 répl.) → conservée : acte-i-scene-iii (65 répl.)
  "160f68d5-2560-4549-8627-172caf172bcc",
  // Le Médecin malgré lui, acte I sc. 1 (extrait de 12 répl.) → conservée : acte-i-scene-i (51 répl.)
  "93441a8d-ce64-40f1-9f16-3690f0e4fd30",
  // Trois scènes à work_id nul, texte identique au Médecin acte I sc. 1. Elles
  // n'avaient pas de slug : l'UUID était leur seule URL, d'où le 410 sans 308.
  "db9f670e-59b7-4895-b20e-0906ea648a6c",
  "964f24d6-03d7-46ba-94ee-8f40fa9fc63f",
  "b9d01f8e-6999-4e9a-b3d4-3e4b31f48e3e",
]);
