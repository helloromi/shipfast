export const account = {
  title: "Mon compte",
  subscriptions: {
    title: "Mes abonnements",
    noSubscriptions: "Vous n'avez aucun abonnement actif.",
    manageButton: "Gérer mes abonnements",
    status: {
      active: "Actif",
      canceled: "Annulé",
      past_due: "En retard",
      trialing: "Essai",
      incomplete: "Incomplet",
      incomplete_expired: "Essai expiré",
      unpaid: "Impayé",
    },
    renewsAt: "Renouvelle le",
    cancelsAt: "Annule le",
    canceled: "Annulé",
  },
  deleteAccount: {
    title: "Supprimer mon compte",
    description:
      "La suppression de votre compte est définitive et irréversible. Toutes vos données seront supprimées conformément au RGPD.",
    warning: "Attention : Cette action est irréversible.",
    confirmText: "Je confirme vouloir supprimer mon compte",
    button: "Supprimer mon compte",
    error: {
      hasActiveSubscriptions:
        "Impossible de supprimer le compte. Veuillez d'abord annuler tous vos abonnements actifs.",
      generic: "Une erreur est survenue lors de la suppression du compte.",
    },
    success: "Votre compte a été supprimé avec succès.",
    cancelButton: "Annuler",
  },
};
