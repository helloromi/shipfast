import type { Scene } from "@/types/scenes";

/**
 * Comment nommer une scène à l'écran et dans les métadonnées.
 *
 * Une scène du catalogue porte deux noms : sa COORDONNÉE (« Acte IV, Scène III »),
 * exacte et que personne ne tape, et parfois son NOM D'USAGE (« Le récit de
 * Rodrigue »), qui est ce qu'on cherche. Quand les deux existent, le nom d'usage passe
 * devant et la coordonnée devient un sous-titre — jamais l'inverse, et jamais l'un sans
 * l'autre : « monologue hermione acte 5 scène 1 » montre que les deux intentions se
 * combinent dans une même requête.
 *
 * Source unique du calcul : le <title>, le H1 et le JSON-LD doivent nommer la scène
 * pareil, sinon on envoie trois noms différents pour une même page.
 */
export type SceneDisplayName = {
  /** Ce qui va en H1 et en tête de <title>. */
  heading: string;
  /** La coordonnée, seulement quand elle n'est PAS déjà le heading. */
  coordinate: string | null;
};

export function sceneDisplayName(scene: Pick<Scene, "title" | "nickname">): SceneDisplayName {
  const nickname = scene.nickname?.trim() || null;
  if (!nickname) return { heading: scene.title, coordinate: null };

  // 5 des 20 titres nommés portent déjà le nom d'usage entre parenthèses
  // (« Acte I, scène 4 (la tirade du nez) ») : sans ce retrait, la page afficherait
  // deux fois le même nom. Une parenthèse de didascalie (« (Une rue) ») disparaît
  // aussi, ce qui est le comportement voulu : elle n'a rien à faire dans un titre.
  const coordinate = scene.title.replace(/\s*\([^)]*\)\s*$/, "").trim();

  return { heading: nickname, coordinate: coordinate || null };
}
