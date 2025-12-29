import OpenAI from "openai";

export interface ParsedScene {
  title: string;
  author?: string;
  characters: string[];
  lines: {
    characterName: string;
    text: string;
    order: number;
  }[];
}

export interface ParseResult {
  success: boolean;
  data?: ParsedScene;
  error?: string;
}

/**
 * Parse le texte extrait d'une scène de théâtre/script en utilisant OpenAI
 */
export async function parseTextWithAI(text: string): Promise<ParseResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "OPENAI_API_KEY n'est pas configurée. Veuillez ajouter cette variable d'environnement.",
    };
  }

  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: "Le texte à parser est vide.",
    };
  }

  try {
    const openai = new OpenAI({
      apiKey,
    });

    const prompt = `Tu es un expert en analyse de textes de théâtre et de scripts. Analyse le texte suivant et extrais les informations structurées.

Le texte peut être un extrait de scène de théâtre, un script, ou un dialogue. Identifie :
1. Le titre de la scène (ou un titre approprié si absent)
2. L'auteur (si mentionné)
3. Les personnages (noms des personnages qui parlent)
4. Les répliques de chaque personnage dans l'ordre

Format attendu : dialogue de théâtre avec noms de personnages, ou format script.

Retourne UNIQUEMENT un JSON valide avec cette structure exacte :
{
  "title": "titre de la scène",
  "author": "nom de l'auteur ou null",
  "characters": ["Personnage 1", "Personnage 2", ...],
  "lines": [
    {
      "characterName": "Personnage 1",
      "text": "texte de la réplique",
      "order": 1
    },
    {
      "characterName": "Personnage 2",
      "text": "texte de la réplique",
      "order": 2
    }
  ]
}

Règles importantes :
- Le champ "title" est obligatoire (invente un titre si nécessaire)
- Le champ "author" peut être null si non trouvé
- "characters" doit être un tableau de tous les personnages uniques qui parlent
- "lines" doit contenir toutes les répliques dans l'ordre d'apparition
- Chaque réplique doit avoir un "order" unique et séquentiel (1, 2, 3...)
- Le "characterName" de chaque ligne doit correspondre à un nom dans "characters"
- Si le texte ne contient pas de dialogue clair, essaie de détecter les patterns courants (noms en majuscules, deux-points, etc.)

Texte à analyser :

${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Utiliser gpt-4o-mini pour un meilleur rapport qualité/prix
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en analyse de textes de théâtre. Tu retournes uniquement du JSON valide, sans texte supplémentaire.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Température basse pour plus de cohérence
      response_format: { type: "json_object" }, // Forcer le format JSON
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: "Aucune réponse de l'API OpenAI",
      };
    }

    // Parser le JSON retourné
    let parsedData: any;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      return {
        success: false,
        error: "La réponse de l'IA n'est pas un JSON valide",
      };
    }

    // Valider la structure
    if (!parsedData.title || typeof parsedData.title !== "string") {
      return {
        success: false,
        error: "Le titre est manquant ou invalide dans la réponse de l'IA",
      };
    }

    if (!Array.isArray(parsedData.characters)) {
      return {
        success: false,
        error: "Les personnages doivent être un tableau",
      };
    }

    if (!Array.isArray(parsedData.lines)) {
      return {
        success: false,
        error: "Les répliques doivent être un tableau",
      };
    }

    // Valider et nettoyer les lignes
    const validLines = parsedData.lines
      .filter((line: any) => {
        return (
          line &&
          typeof line.characterName === "string" &&
          typeof line.text === "string" &&
          typeof line.order === "number" &&
          line.text.trim().length > 0
        );
      })
      .map((line: any, index: number) => ({
        characterName: line.characterName.trim(),
        text: line.text.trim(),
        order: index + 1, // Réordonner pour garantir la séquence
      }));

    if (validLines.length === 0) {
      return {
        success: false,
        error: "Aucune réplique valide n'a été trouvée dans le texte",
      };
    }

    // S'assurer que tous les personnages des lignes sont dans la liste des personnages
    const characterNames = new Set(parsedData.characters.map((c: string) => c.trim()));
    const linesCharacterNames = new Set(validLines.map((l) => l.characterName));

    // Ajouter les personnages manquants
    linesCharacterNames.forEach((name) => {
      if (!characterNames.has(name)) {
        characterNames.add(name);
      }
    });

    const result: ParsedScene = {
      title: parsedData.title.trim(),
      author: parsedData.author && typeof parsedData.author === "string" ? parsedData.author.trim() : undefined,
      characters: Array.from(characterNames).filter((name) => name.length > 0),
      lines: validLines,
    };

    // Validation finale
    if (result.characters.length === 0) {
      return {
        success: false,
        error: "Aucun personnage n'a été identifié",
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Erreur lors du parsing IA:", error);

    // Gérer les erreurs spécifiques d'OpenAI
    if (error.status === 401) {
      return {
        success: false,
        error: "Clé API OpenAI invalide",
      };
    }

    if (error.status === 429) {
      return {
        success: false,
        error: "Limite de taux OpenAI atteinte. Réessayez plus tard.",
      };
    }

    return {
      success: false,
      error: `Erreur lors du parsing : ${error.message || "Erreur inconnue"}`,
    };
  }
}

