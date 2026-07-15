"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { t } from "@/locales/fr";

export function CreateClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/teacher/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok || !data?.class?.id) {
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    router.push(`/professeur/classes/${data.class.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
      <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
        {t.teacher.dashboard.createTitle}
      </h2>
      <div>
        <label htmlFor="class-name" className="label">
          {t.teacher.dashboard.nameLabel}
        </label>
        <input
          id="class-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.teacher.dashboard.namePlaceholder}
          className="input"
          required
        />
      </div>
      <div>
        <label htmlFor="class-description" className="label">
          {t.teacher.dashboard.descriptionLabel}
        </label>
        <input
          id="class-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.teacher.dashboard.descriptionPlaceholder}
          className="input"
          aria-describedby="class-description-hint"
        />
        <p id="class-description-hint" className="hint">
          {t.teacher.dashboard.descriptionHint}
        </p>
      </div>
      {error && <p className="text-sm font-semibold text-[#e11d48]">{error}</p>}
      <button type="submit" disabled={loading || !name.trim()} className="btn-primary self-start">
        {loading ? "…" : t.teacher.dashboard.createButton}
      </button>
    </form>
  );
}
