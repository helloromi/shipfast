-- Nettoyage du résidu de scrape Wikisource dans `lines.text`.
--
-- Découvert le 05/08/2026 en vérifiant les noms d'usage des scènes célèbres. Quatre
-- défauts distincts, tous issus du balisage de la source et tous visibles en public —
-- sur la page scène ET dans les flashcards, donc appris par cœur par les utilisateurs.
--
-- A. NUMÉROS DE VERS. La numérotation tous les 5 vers de Wikisource, tantôt collée au
--    mot suivant (`1665Lorsqu'ignorant encor…`), tantôt suivie d'une espace
--    (`485 La solide vertu…`), en début de texte ou en milieu de réplique.
--    517 répliques : Horace 339, Le Misanthrope 172, Le Cid 6.
--    Vérification faite avant d'écrire : les 518 nombres extraits de ces œuvres sont
--    TOUS des multiples de 5, de 5 à 1805. Aucun n'est un nombre du texte. Les trois
--    œuvres sont nommées explicitement ci-dessous — ailleurs, un nombre isolé pourrait
--    être légitime, on n'y touche pas.
--
-- B. APPELS DE NOTE. Les renvois `[2]`, `[5]` laissés dans le corps du texte
--    (`Vous en pleurez[5], Camille[6] ?`). 7 répliques : Horace 4, Le Cid 3.
--
-- C. DIDASCALIES À PARENTHÈSES DOUBLES. `((À Roxane.))` au lieu de `(À Roxane.)`.
--    362 répliques sur 13 œuvres, dont 329 pour le seul Cyrano — l'œuvre la plus vue du
--    site. Vérifié avant correction : rien dans le code n'interprète `((…))` comme un
--    marqueur (les didascalies passent par un personnage nommé « Didascalie », cf.
--    src/app/imports/[jobId]/preview/page.tsx), donc la double parenthèse est bien
--    rendue telle quelle à l'écran.
--
-- D. NOTES D'ÉDITEUR SERVIES COMME RÉPLIQUES. Deux lignes d'appareil critique stockées
--    dans `lines` et attribuées à un personnage, donc affichées comme du dialogue et
--    proposées en flashcard. Les deux sont la DERNIÈRE ligne de leur scène et ne
--    contiennent aucun texte de la pièce — d'où la suppression plutôt qu'un nettoyage.
--    Aucune donnée utilisateur n'en dépend (0 ligne dans user_line_feedback,
--    user_line_highlights et user_line_notes — vérifié avant).
--
-- CE QUE CETTE MIGRATION NE FAIT PAS, volontairement :
--
--   - Les 5 répliques à préfixe parasite (`SaJe pris sur cet oracle`, `SoÔ combien
--     d'actions`, `QuPuisque vous refusez`, `EtVous les préviendrez`, `Qu'on
--     chercheVous vouliez`). Les réparer suppose de reconstituer le texte juste, donc
--     de le collationner sur l'édition source. Inventer du texte serait pire que le
--     laisser visible.
--   - La scène le-malade-imaginaire/acte-i-scene-vii (premier intermède). Les notes y
--     sont FUSIONNÉES avec du dialogue réel dans la même réplique (« Il paraît que
--     Molière les a ajoutés après la première représentation de cette pièce. Ah ! vous
--     ne me trompez pas ! »). Aucune règle mécanique ne sépare les deux : cette scène
--     demande un re-sourcing.
--
-- Les triggers de 20260731130000 propagent ces UPDATE/DELETE sur `scenes.updated_at`,
-- donc le `lastmod` du sitemap bougera pour les scènes touchées. C'est voulu : leur
-- contenu change réellement.

-- A + B — bornés aux trois œuvres où le défaut a été constaté et mesuré.
update public.lines l
set text = btrim(
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(l.text, '(^|[[:space:]])[0-9]{1,4}(?=[[:alpha:]])', '\1', 'g'),
        '(^|[[:space:]])[0-9]{1,4}[[:space:]]+', '\1', 'g'),
      '\[[0-9]{1,3}\]', '', 'g'),
    '[[:space:]]{2,}', ' ', 'g')
)
from public.scenes s
join public.works w on w.id = s.work_id
where s.id = l.scene_id
  and s.is_private = false
  and w.is_public_domain
  and w.slug in ('horace', 'le-misanthrope', 'le-cid')
  and (
    l.text ~ '(^|[[:space:]])[0-9]{1,4}([[:alpha:]]|[[:space:]]|$)'
    or l.text ~ '\[[0-9]{1,3}\]'
  );

-- C — catalogue public entier, mais jamais les scènes privées : on ne réécrit pas le
-- texte importé par un utilisateur, même pour le corriger.
update public.lines l
set text = btrim(
  regexp_replace(
    regexp_replace(l.text, '\(\(([^()]*)\)\)', '(\1)', 'g'),
    '[[:space:]]{2,}', ' ', 'g')
)
from public.scenes s
join public.works w on w.id = s.work_id
where s.id = l.scene_id
  and s.is_private = false
  and w.is_public_domain
  and l.text ~ '\(\([^()]*\)\)';

-- D — les deux lignes d'appareil critique, désignées par leur position exacte.
delete from public.lines l
using public.scenes s, public.works w
where s.id = l.scene_id
  and w.id = s.work_id
  and s.is_private = false
  and (
    (w.slug = 'le-cid' and s.slug = 'acte-iii-scene-vi' and l."order" = 26)
    or (w.slug = 'le-medecin-malgre-lui' and s.slug = 'acte-i-scene-6' and l."order" = 109)
  )
  -- Garde-fou : on ne supprime que si le texte est bien celui qu'on a constaté.
  -- Si un re-seed a décalé les `order`, la migration ne supprime rien plutôt que de
  -- supprimer une vraie réplique.
  and l.text ~ '(tome [IVX]+|pag\.|Mercure de France)';
