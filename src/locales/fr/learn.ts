export const learn = {
  sectionLabel: "Mode apprentissage",
  labels: {
    tuJoues: "Tu joues",
    personnageChoisi: "Personnage choisi",
    mode: "Mode :",
    restantes: "Restantes",
    session: "Session",
    toutes: "Toutes",
    modeEcriture: "Révéler + écrire",
    modeRevelerSeulement: "Révéler seulement",
    taReplique: "Ta réplique",
    repliqueAdverse: "Réplique adverse",
    carte: "carte",
    taVersion: "Ta version",
    original: "Original",
    indiceMode: "Indice :",
    indiceMotSuivant: "mot suivant",
    indiceInitiales: "initiales",
    didascalies: "Didascalies",
    affichees: "affichées",
    masquees: "masquées",
  },
  scores: {
    rate: {
      // NOTE: "❌" (emoji rouge) est peu lisible sur un bouton rouge.
      // On utilise un symbole texte qui hérite de la couleur (blanc sur fond rouge).
      emoji: "✕",
      label: "Raté",
    },
    hesitant: {
      emoji: "⚠️",
      label: "Hésitant",
    },
    bon: {
      emoji: "🙂",
      label: "Bon",
    },
    parfait: {
      emoji: "✅",
      label: "Parfait",
    },
    legend: "✕ Raté · ⚠️ Hésitant · 🙂 Bon · ✅ Parfait",
  },
  buttons: {
    reveler: "Révéler",
    indice: "Indice",
    precedent: "← Précédent",
    suivant: "Suivant →",
    passer: "Passer",
    terminer: "Terminer",
    recommencer: "Recommencer",
    retournerAccueil: "Retourner à l'accueil",
    activerZen: "Activer le mode Zen",
    quitterZen: "Quitter le mode Zen",
    fermer: "Fermer",
    enregistrerScores: "Enregistrer les scores",
  },
  placeholders: {
    ecrisReplique: "Écris ta réplique",
  },
  setup: {
    title: "Démarrer une session",
    description: "Choisis combien de répliques tu veux travailler et ton mode d’entraînement.",
    limitLabel: "Répliques à pratiquer",
    modeLabel: "Mode",
    revealOnlyTitle: "Révéler seulement",
    revealOnlyDesc: "Pas de saisie. Tu révèles puis tu notes la réplique.",
    writeTitle: "Révéler + écrire",
    writeDesc: "Tu écris ta version puis tu révèles et tu notes.",
    cancel: "Annuler",
    start: "Commencer",
  },
  messages: {
    feedbackEnregistre: "Retour enregistré pour cette réplique.",
    feedbackEnregistreToast: "Retour enregistré !",
    sessionTerminee: "Session terminée",
    resumeFeedbacks: "Résumé de ta session :",
    aucuneReplique: "Aucune réplique utilisateur à noter.",
    erreur: "Erreur:",
    attribueScores: "Attribue un score à chaque réplique avant d’enregistrer.",
    noterSessionTitre: "Noter la session",
    noterSessionDesc:
      "Donne un score à chaque réplique (le score n’apparaît qu’à la fin, pour éviter la pression pendant l’effort).",
    enregistrement: "Enregistrement...",
    notees: "notées",
  },
  modes: {
    flashcard: "Flashcard",
    liste: "Liste",
  },
};



