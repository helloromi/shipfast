/**
 * Accord en nombre pour les compteurs affichés ("1 élève", "2 élèves").
 *
 * La règle française n'est pas celle de l'anglais : le singulier couvre 0 *et* 1
 * ("0 élève", "1 élève"), là où l'anglais dirait "0 students". D'où le `n < 2`
 * plutôt qu'un `n === 1`.
 */

export type PluralForms = { one: string; other: string };

/** Forme accordée seule, sans le nombre. */
export function plural(count: number, forms: PluralForms): string {
  return count < 2 ? forms.one : forms.other;
}

/** Compteur complet, nombre inclus : `countLabel(1, ...)` → "1 élève". */
export function countLabel(count: number, forms: PluralForms): string {
  return `${count} ${plural(count, forms)}`;
}
