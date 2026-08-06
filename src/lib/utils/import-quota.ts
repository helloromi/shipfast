import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isEntitledToPaidFeatures } from "@/lib/utils/entitlement";

/**
 * Le premier texte importé est offert (règle produit n°2, chantier 1 de DISTRIBUTION.md).
 *
 * Avant ce changement, le paywall de l'import n'existait QUE sur la page
 * `/scenes/import` : les routes `/api/scenes/import` et `/api/scenes/import/commit`
 * ne vérifiaient que l'authentification. N'importe quel inscrit pouvait donc importer
 * sans pass en appelant l'API directement — et brûler du crédit OCR au passage. Le
 * quota ci-dessous est la première application côté serveur de cette règle : il ouvre
 * le premier import ET ferme réellement les suivants.
 */
export const FREE_IMPORT_LIMIT = 1;

/**
 * Plafond de fichiers pour un import gratuit. L'OCR passe par un prestataire tiers et
 * se facture à la page : sans ce plafond, un compte gratuit peut déposer un PDF de
 * deux cents pages. Les comptes ayant un droit payant ne sont pas concernés.
 */
export const FREE_IMPORT_MAX_FILES = 5;

export const IMPORT_QUOTA_EXCEEDED = {
  error:
    "Ton import offert a déjà été utilisé. Le pass débloque les imports suivants.",
  code: "IMPORT_QUOTA_EXCEEDED",
} as const;

export const IMPORT_FILE_CAP_EXCEEDED = {
  error: `Un import offert est limité à ${FREE_IMPORT_MAX_FILES} fichiers. Le pass lève cette limite.`,
  code: "IMPORT_FILE_CAP_EXCEEDED",
} as const;

export type ImportQuota = {
  /** Droit payant actif : pass, admin ou classe. L'import est alors illimité. */
  entitled: boolean;
  /** Textes importés actuellement possédés. */
  used: number;
  /** `null` quand illimité. */
  limit: number | null;
  /** `null` quand illimité. */
  remaining: number | null;
  /** Un import de plus est-il permis ? */
  allowed: boolean;
};

/**
 * Compte les textes importés que l'utilisateur possède aujourd'hui.
 *
 * Une scène importée est privée, lui appartient, et n'a PAS de `source_scene_id`.
 * C'est ce dernier point qui la distingue des copies personnelles de scènes du
 * domaine public créées par `ensurePersonalSceneForCurrentUser` : celles-ci sont
 * privées elles aussi, mais ne doivent évidemment rien consommer — sans quoi lire
 * une scène de Molière épuiserait le quota d'import (règle produit n°1).
 */
export async function countImportedScenes(userId: string): Promise<number> {
  if (!userId) return 0;

  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("scenes")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", userId)
    .eq("is_private", true)
    .is("source_scene_id", null);

  if (error) {
    // En cas d'erreur on renvoie une consommation maximale : mieux vaut proposer le
    // pass à tort que d'ouvrir l'import en grand sur une panne de lecture.
    console.error("[ImportQuota] comptage impossible:", error);
    return FREE_IMPORT_LIMIT;
  }

  return count ?? 0;
}

/**
 * L'état du quota d'import pour un utilisateur.
 *
 * Sémantique retenue : on compte les textes importés **possédés**, pas les imports
 * réalisés depuis toujours. Un utilisateur qui supprime son texte importé récupère
 * donc son import offert. C'est assumé — la promesse est « un texte importé à la
 * fois », ce qui reste vrai, et compter l'historique demanderait de s'appuyer sur
 * `import_jobs`, qui ne couvre pas le chemin d'import synchrone.
 */
export async function getImportQuota(userId: string): Promise<ImportQuota> {
  const entitled = await isEntitledToPaidFeatures(userId);

  if (entitled) {
    return { entitled: true, used: 0, limit: null, remaining: null, allowed: true };
  }

  const used = await countImportedScenes(userId);
  const remaining = Math.max(0, FREE_IMPORT_LIMIT - used);

  return {
    entitled: false,
    used,
    limit: FREE_IMPORT_LIMIT,
    remaining,
    allowed: remaining > 0,
  };
}
