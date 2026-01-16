export const login = {
  sectionLabel: "Connexion",
  title: "Connexion simple",
  description: "Connexion simple via email.",
  form: {
    label: "Email",
    placeholder: "toi@exemple.com",
    button: {
      envoyer: "Recevoir le lien",
      envoi: "Envoi...",
    },
    success: {
      message: "Lien envoyé. Vérifie ta boîte mail.",
      toast: "Lien de connexion envoyé.",
    },
    error: {
      toast: "Impossible d’envoyer le lien. Réessaie.",
    },
  },
};
