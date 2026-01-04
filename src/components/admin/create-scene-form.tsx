"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Character = {
  name: string;
};

type Line = {
  characterName: string;
  text: string;
  order: number;
};

export function CreateSceneForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    ownerEmail: "",
    title: "",
    author: "",
    summary: "",
    chapter: "",
  });

  const [characters, setCharacters] = useState<Character[]>([{ name: "" }]);
  const [lines, setLines] = useState<Line[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Préparer les données
      const charactersToSend = characters.filter((c) => c.name.trim() !== "");
      const linesToSend = lines
        .filter((l) => l.text.trim() !== "" && l.characterName.trim() !== "")
        .map((l, idx) => ({ ...l, order: l.order || idx + 1 }));

      const response = await fetch("/api/admin/scenes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ownerEmail: formData.ownerEmail,
          title: formData.title,
          author: formData.author || null,
          summary: formData.summary || null,
          chapter: formData.chapter || null,
          characters: charactersToSend,
          lines: linesToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/scenes");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: "" }]);
  };

  const removeCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const updateCharacter = (index: number, name: string) => {
    const updated = [...characters];
    updated[index] = { name };
    setCharacters(updated);
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        characterName: characters[0]?.name || "",
        text: "",
        order: lines.length + 1,
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof Line, value: string | number) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-[#2cb67d] bg-[#d9f2e4] p-6 text-center">
        <p className="text-sm font-semibold text-[#1c6b4f]">
          Scène créée avec succès ! Redirection...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold text-[#3b1f4a]">
          Créer une scène privée
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3b1f4a]">
            Email de l'utilisateur propriétaire *
          </label>
          <input
            type="email"
            value={formData.ownerEmail}
            onChange={(e) =>
              setFormData({ ...formData, ownerEmail: e.target.value })
            }
            required
            className="rounded-xl border border-[#e7e1d9] bg-white px-4 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3b1f4a]">
            Titre de la scène *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="rounded-xl border border-[#e7e1d9] bg-white px-4 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3b1f4a]">Auteur</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            className="rounded-xl border border-[#e7e1d9] bg-white px-4 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3b1f4a]">Résumé</label>
          <textarea
            value={formData.summary}
            onChange={(e) =>
              setFormData({ ...formData, summary: e.target.value })
            }
            rows={3}
            className="rounded-xl border border-[#e7e1d9] bg-white px-4 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#3b1f4a]">Chapitre</label>
          <input
            type="text"
            value={formData.chapter}
            onChange={(e) =>
              setFormData({ ...formData, chapter: e.target.value })
            }
            className="rounded-xl border border-[#e7e1d9] bg-white px-4 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
            Personnages
          </h3>
          <button
            type="button"
            onClick={addCharacter}
            className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-xs font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
          >
            + Ajouter
          </button>
        </div>

        {characters.map((char, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={char.name}
              onChange={(e) => updateCharacter(index, e.target.value)}
              placeholder="Nom du personnage"
              className="flex-1 rounded-xl border border-[#e7e1d9] bg-white px-4 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
            />
            {characters.length > 1 && (
              <button
                type="button"
                onClick={() => removeCharacter(index)}
                className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#ff6b6b] transition hover:border-[#ff6b6b]"
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
            Répliques
          </h3>
          <button
            type="button"
            onClick={addLine}
            className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-xs font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
          >
            + Ajouter
          </button>
        </div>

        {lines.map((line, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-xl border border-[#e7e1d9] bg-white p-3">
            <div className="flex gap-2">
              <select
                value={line.characterName}
                onChange={(e) =>
                  updateLine(index, "characterName", e.target.value)
                }
                className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
              >
                <option value="">Sélectionner un personnage</option>
                {characters
                  .filter((c) => c.name.trim() !== "")
                  .map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                value={line.order}
                onChange={(e) =>
                  updateLine(index, "order", parseInt(e.target.value, 10))
                }
                placeholder="Ordre"
                min={1}
                className="w-20 rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
              />
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#ff6b6b] transition hover:border-[#ff6b6b]"
              >
                Supprimer
              </button>
            </div>
            <textarea
              value={line.text}
              onChange={(e) => updateLine(index, "text", e.target.value)}
              placeholder="Texte de la réplique"
              rows={2}
              className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
            />
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-[#ff6b6b] bg-[#ff6b6b33] p-3 text-sm text-[#c4153c]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px] disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer la scène"}
      </button>
    </form>
  );
}


