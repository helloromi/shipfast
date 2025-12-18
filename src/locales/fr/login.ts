export const login = {
  sectionLabel: "Connexion",
  title: "Reçois un lien magique",
  description: "Authentification simple via email. Une fois connecté, tu seras redirigé vers la bibliothèque.",
  form: {
    label: "Email pour recevoir le lien magique",
    placeholder: "jeunedemoiselle@cherchepiecemortelle.com",
    button: {
      envoyer: "Envoyer le lien",
      envoi: "Envoi...",
    },
    success: {
      message: "Lien envoyé ! Vérifie ta boîte mail.",
      toast: "Lien envoyé ! Vérifie ta boîte mail.",
    },
    error: {
      toast: "Échec de l'envoi du lien",
    },
  },
  retour: "Retour à la bibliothèque",
};
