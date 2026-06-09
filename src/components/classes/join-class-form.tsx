"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { t } from "@/locales/fr";

export function JoinClassForm({ initialCode }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/class/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Une erreur est survenue.");
      return;
    }

    setSuccess(`${t.teacher.student.joinSuccess} « ${data.className} » !`);
    setTimeout(() => {
      router.push("/mes-cours");
      router.refresh();
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t.teacher.student.codePlaceholder}
          className="input flex-1 font-mono tracking-[0.25em] uppercase"
          maxLength={12}
          aria-label={t.teacher.student.codePlaceholder}
        />
        <button type="submit" disabled={loading || !code.trim()} className="btn-primary">
          {loading ? "…" : t.teacher.student.joinButton}
        </button>
      </div>
      {error && <p className="text-sm font-semibold text-[#e11d48]">{error}</p>}
      {success && <p className="text-sm font-semibold text-[#1c6b4f]">✓ {success}</p>}
    </form>
  );
}
