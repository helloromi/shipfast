"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";

import { ScoreEvolutionChart } from "@/components/stats/score-evolution-chart";
import { Toast } from "@/components/ui/toast";
import { t } from "@/locales/fr";

type Role = "student" | "teacher";

const STUDENT_STEPS = [
  {
    id: 1,
    title: "Apprends tes textes simplement",
    body: "Tes répliques sont masquées : révèle-les une à une, récite, et note-toi. Essaie tout de suite ↓",
    visual: "interactive",
  },
  {
    id: 2,
    title: "Suis ta progression",
    body: "La page Statistiques te montre ton avancement, tes séances et ton évolution pour ne rien perdre.",
    visual: "stats",
  },
  {
    id: 3,
    title: "Importe n'importe quel texte",
    body: "Prends une photo de ton script ou uploade un PDF : on s'occupe du reste pour créer ta scène.",
    visual: "import",
  },
] as const;

const TEACHER_STEPS = [
  {
    id: 1,
    title: "Importez vos textes, créez votre classe",
    body: "Photo ou PDF : la pièce est découpée automatiquement. Vos élèves rejoignent la classe avec un simple code — sans abonnement supplémentaire pour eux.",
    visual: "teacher-class",
  },
  {
    id: 2,
    title: "Distribuez les rôles, annotez pour tous",
    body: "Attribuez à chaque élève sa scène et son personnage. Vos indications de jeu apparaissent directement sur le texte de chacun.",
    visual: "teacher-casting",
  },
  {
    id: 3,
    title: "Préparez le spectacle, jusqu'aux coulisses",
    body: "Mise en scène, costumes, décors, accessoires, technique : tout est centralisé et visible par la troupe.",
    visual: "teacher-show",
  },
] as const;

// Court extrait de dialogue pour la démo étape 1
const DEMO_LINES = [
  { character: "Marie", text: "Tu as passé une bonne soirée ?" },
  { character: "Paul", text: "Oui, merci. Et toi, ce projet de pièce avance ?" },
  { character: "Marie", text: "On répète la scène 2 demain. Tu pourrais me faire répéter ?" },
  { character: "Paul", text: "Avec plaisir. On commence par tes répliques ?" },
] as const;

const SCORE_OPTIONS = [
  { value: 0, emoji: t.learn.scores.rate.emoji, label: t.learn.scores.rate.label, color: "bg-[#e11d48] text-white hover:bg-[#c4153c]" },
  { value: 3, emoji: t.learn.scores.hesitant.emoji, label: t.learn.scores.hesitant.label, color: "bg-[#f59e0b] text-white hover:bg-[#d88405]" },
  { value: 7, emoji: t.learn.scores.bon.emoji, label: t.learn.scores.bon.label, color: "bg-[#f4c95d] text-[#1c1b1f] hover:bg-[#e6b947]" },
  { value: 10, emoji: t.learn.scores.parfait.emoji, label: t.learn.scores.parfait.label, color: "bg-[#2cb67d] text-white hover:bg-[#239b6a]" },
] as const;

const USER_LINE_INDICES: Record<"Marie" | "Paul", number[]> = {
  Marie: [0, 2],
  Paul: [1, 3],
};

const TOAST_ENREGISTRE = "C'est bien enregistré !";
const AUTO_NEXT_DELAY_MS = 1200;

function Step1Interactive() {
  const [selectedCharacter, setSelectedCharacter] = useState<"Marie" | "Paul" | null>(null);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const userLineIndices = selectedCharacter ? USER_LINE_INDICES[selectedCharacter] : [];
  const currentDemoIndex = userLineIndices[lineIndex];
  const currentLine = currentDemoIndex != null ? DEMO_LINES[currentDemoIndex] : null;
  const hasNextLine = lineIndex < userLineIndices.length - 1;

  const handleSelectCharacter = (c: "Marie" | "Paul") => {
    setSelectedCharacter(c);
    setPracticeStarted(false);
    setLineIndex(0);
    setRevealed(false);
    setScore(null);
  };

  const goToNextLine = () => {
    setLineIndex((i) => i + 1);
    setRevealed(false);
    setScore(null);
  };

  const handleScore = (value: number) => {
    setScore(value);
    setToast({ message: TOAST_ENREGISTRE, variant: "success" });
    if (hasNextLine) {
      setTimeout(goToNextLine, AUTO_NEXT_DELAY_MS);
    }
  };

  return (
    <div className="card p-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8a8093]">
        Choisis ton personnage
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["Marie", "Paul"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleSelectCharacter(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedCharacter === c
                ? "bg-[#ff6b6b] text-white shadow-md shadow-[#ff6b6b40]"
                : "bg-[#f3eee4] text-[#5d5468] hover:bg-[#ece5d6]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!selectedCharacter && (
        <p className="text-sm text-[#8a8093]">↑ Commence par choisir qui tu joues.</p>
      )}

      {/* Phase 1 : texte complet visible, puis "Commencer" */}
      {selectedCharacter && !practiceStarted && (
        <>
          <div className="flex flex-col gap-2">
            {DEMO_LINES.map((line, i) => {
              const isMyLine = line.character === selectedCharacter;
              return (
                <div
                  key={i}
                  className={`rounded-xl border px-4 py-3 ${
                    isMyLine ? "border-[#f4c95d66] bg-[#f4c95d1f]" : "border-[#efe9dd] bg-white/90"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#8a8093]">
                    {line.character}{isMyLine ? " — Ta réplique" : ""}
                  </div>
                  <p className="mt-1 text-sm text-[#211a26]">« {line.text} »</p>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setPracticeStarted(true)}
            className="btn-primary mt-4 w-full"
          >
            Commencer l’exercice
          </button>
        </>
      )}

      {/* Phase 2 : répliques masquées puis révélées une par une */}
      {selectedCharacter && practiceStarted && (
        <div className="flex flex-col gap-2">
          {DEMO_LINES.map((line, i) => {
            const isMyLine = line.character === selectedCharacter;
            const userLineIdx = isMyLine ? userLineIndices.indexOf(i) : -1;
            const isDone = isMyLine && userLineIdx >= 0 && userLineIdx < lineIndex;
            const isCurrent = isMyLine && userLineIdx === lineIndex;
            const isFuture = isMyLine && userLineIdx > lineIndex;

            if (!isMyLine) {
              return (
                <div key={i} className="rounded-xl border border-[#efe9dd] bg-white/90 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#8a8093]">
                    {line.character}
                  </div>
                  <p className="mt-1 text-sm text-[#211a26]">« {line.text} »</p>
                </div>
              );
            }

            if (isDone || (isCurrent && revealed && score !== null)) {
              return (
                <div key={i} className="rounded-xl border border-[#d9f2e4] bg-[#d9f2e418] px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#1c6b4f]">
                      {line.character} — Ta réplique
                    </span>
                    <span className="text-xs font-medium text-[#1c6b4f]">✓ Notée</span>
                  </div>
                  <p className="mt-1 text-sm text-[#211a26]">« {line.text} »</p>
                </div>
              );
            }

            if (isFuture) {
              return (
                <div key={i} className="rounded-xl border border-[#efe9dd] bg-[#f8f6f3] px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#8a8093]">
                    {line.character} — Ta réplique
                  </div>
                  <p className="mt-1 select-none text-sm text-[#5d5468]">••••••••</p>
                </div>
              );
            }

            // isCurrent : masqué ou révélé pas encore noté
            return (
              <div key={i} className="rounded-xl border-2 border-[#f4c95d66] bg-[#f4c95d1f] px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#3b1f4a]">
                  {line.character} — Ta réplique
                </div>
                {!revealed ? (
                  <>
                    <p className="mb-3 mt-2 select-none text-sm text-[#5d5468]">••••••••</p>
                    <button
                      type="button"
                      onClick={() => setRevealed(true)}
                      className="rounded-lg bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e75a5a]"
                    >
                      Révéler ma réplique
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-medium text-[#211a26]">« {currentLine?.text} »</p>
                    <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wider text-[#8a8093]">
                      Noter ta réplique
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SCORE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleScore(opt.value)}
                          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${opt.color} ${
                            score === opt.value ? "ring-2 ring-[#3b1f4a] ring-offset-2" : ""
                          }`}
                        >
                          {opt.emoji} {opt.label}
                        </button>
                      ))}
                    </div>
                    {hasNextLine && (
                      <button
                        type="button"
                        onClick={goToNextLine}
                        className="mt-3 text-sm font-semibold text-[#3b1f4a] hover:underline"
                      >
                        Réplique suivante →
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
      {typeof document !== "undefined" &&
        toast &&
        createPortal(
          <Toast
            message={toast.message}
            variant={toast.variant}
            duration={2000}
            onClose={() => setToast(null)}
          />,
          document.body
        )}
    </div>
  );
}

const FAKE_STATS_DATA = [
  { date: "2025-01-01", value: 4.2, label: "Lun" },
  { date: "2025-01-02", value: 5.5, label: "Mar" },
  { date: "2025-01-03", value: 6, label: "Mer" },
  { date: "2025-01-04", value: 7.2, label: "Jeu" },
  { date: "2025-01-05", value: 7.8, label: "Ven" },
  { date: "2025-01-06", value: 8.5, label: "Sam" },
  { date: "2025-01-07", value: 8.2, label: "Dim" },
];

function Step2StatsVisual() {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-[#3b1f4a]">
        Évolution de ta note
      </h3>
      <ScoreEvolutionChart data={FAKE_STATS_DATA} />
    </div>
  );
}

function ImportPicto() {
  return (
    <div className="card flex flex-col items-center gap-4 p-8">
      <div className="rounded-full bg-[#f4c95d33] p-5">
        <svg className="h-10 w-10 text-[#3b1f4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <p className="text-center text-sm text-[#5d5468]">
        Glisse une photo ou un PDF ici — la scène est créée automatiquement.
      </p>
    </div>
  );
}

/* --- Visuels professeur (maquettes statiques) --- */

function TeacherClassVisual() {
  return (
    <div className="card flex flex-col gap-3 p-6">
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-[#d8cfc0] bg-[#f9f6f0] px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a8093]">
            Code d&apos;invitation
          </p>
          <p className="font-display text-xl font-semibold tracking-[0.25em] text-[#3b1f4a]">4F7A2B9C</p>
        </div>
        <span className="rounded-full bg-[#3b1f4a] px-3 py-1 text-xs font-semibold text-white">Copier</span>
      </div>
      {[
        { name: "Léa", status: "A rejoint", ok: true },
        { name: "Adam", status: "A rejoint", ok: true },
        { name: "Inès", status: "En attente", ok: false },
      ].map((m) => (
        <div key={m.name} className="flex items-center justify-between rounded-xl border border-[#efe9dd] bg-white/90 px-4 py-2.5">
          <span className="text-sm font-semibold text-[#211a26]">{m.name}</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              m.ok ? "bg-[#2cb67d24] text-[#1c6b4f]" : "bg-[#f4c95d3d] text-[#7a5c12]"
            }`}
          >
            {m.ok ? "✓ " : ""}{m.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function TeacherCastingVisual() {
  return (
    <div className="card flex flex-col gap-3 p-6">
      {[
        { who: "Léa", role: "Juliette", scene: "Acte II — Scène 3" },
        { who: "Adam", role: "Roméo", scene: "Acte II — Scène 3" },
      ].map((a) => (
        <div key={a.who} className="rounded-xl border border-[#efe9dd] bg-white/90 px-4 py-3">
          <p className="text-sm">
            <span className="font-semibold text-[#211a26]">{a.who}</span>{" "}
            <span className="text-[#8a8093]">joue</span>{" "}
            <span className="font-semibold text-[#3b1f4a]">{a.role}</span>
          </p>
          <p className="text-xs text-[#8a8093]">{a.scene}</p>
        </div>
      ))}
      <div className="rounded-xl border-l-4 border-[#f4c95d] bg-[#fdf8ec] px-3 py-2">
        <p className="text-xs font-medium text-[#7a5c12]">
          ✎ Note du prof : « L&apos;amour m&apos;a prêté ses ailes… » — presque chuchoté, dos au public
        </p>
      </div>
    </div>
  );
}

function TeacherShowVisual() {
  return (
    <div className="card grid gap-3 p-6 sm:grid-cols-2">
      {[
        { cat: "🎬 Mise en scène", item: "Entrée côté jardin, noir salle", status: "Prêt", ok: true },
        { cat: "👗 Costumes", item: "Robe rouge pour Juliette", status: "En cours", ok: false },
        { cat: "🏛 Décors", item: "Balcon — module bois 2m", status: "À faire", ok: false },
        { cat: "💡 Technique", item: "Poursuite sur le monologue", status: "Prêt", ok: true },
      ].map((n) => (
        <div key={n.item} className="rounded-xl border border-[#efe9dd] bg-white/90 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a8093]">{n.cat}</p>
          <p className="mt-0.5 text-sm font-medium text-[#211a26]">{n.item}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
              n.ok ? "bg-[#2cb67d24] text-[#1c6b4f]" : "bg-[#f4c95d3d] text-[#7a5c12]"
            }`}
          >
            {n.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* --- Choix du rôle --- */

function RoleChooser({ onChoose, saving }: { onChoose: (role: Role) => void; saving: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        disabled={saving}
        onClick={() => onChoose("student")}
        className="card card-hover group flex flex-col items-start gap-3 p-6 text-left"
      >
        <span className="text-3xl" aria-hidden>🎭</span>
        <span className="font-display text-xl font-semibold text-[#3b1f4a]">
          Je suis comédien·ne
        </span>
        <span className="text-sm leading-relaxed text-[#5d5468]">
          J&apos;apprends mes textes pour mes cours, mes répétitions ou mes auditions.
        </span>
        <span className="mt-auto text-sm font-bold text-[#ff6b6b] transition group-hover:translate-x-1">
          C&apos;est parti →
        </span>
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={() => onChoose("teacher")}
        className="card card-hover group relative flex flex-col items-start gap-3 overflow-hidden p-6 text-left"
      >
        <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Nouveau
        </span>
        <span className="text-3xl" aria-hidden>🎬</span>
        <span className="font-display text-xl font-semibold text-[#3b1f4a]">
          Je suis professeur
        </span>
        <span className="text-sm leading-relaxed text-[#5d5468]">
          Je dirige un cours ou une troupe : je distribue les textes, j&apos;annote et je prépare le spectacle.
        </span>
        <span className="mt-auto text-sm font-bold text-[#ff6b6b] transition group-hover:translate-x-1">
          Découvrir l&apos;espace prof →
        </span>
      </button>
    </div>
  );
}

export default function OnboardingPageClient() {
  const [role, setRole] = useState<Role | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [step, setStep] = useState(1);

  const chooseRole = async (r: Role) => {
    setSavingRole(true);
    // Best-effort : le rôle est enregistré sur le profil, l'onboarding continue même si l'appel échoue.
    try {
      await fetch("/api/profile/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: r }),
      });
    } catch {
      // ignoré
    }
    setSavingRole(false);
    setRole(r);
    setStep(1);
  };

  const steps = role === "teacher" ? TEACHER_STEPS : STUDENT_STEPS;
  const current = steps[step - 1];
  const isLastStep = step === steps.length;

  if (!role) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
        <div className="flex flex-col gap-3 text-center">
          <p className="chip mx-auto">Bienvenue</p>
          <h1 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
            Qui es-tu sur scène ?
          </h1>
          <p className="text-sm leading-relaxed text-[#5d5468]">
            Dis-nous comment tu vas utiliser Côté-Cour — tu pourras changer plus tard.
          </p>
        </div>
        <RoleChooser onChoose={chooseRole} saving={savingRole} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 pb-32">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setRole(null)}
            className="w-fit text-xs font-semibold text-[#8a8093] underline-offset-4 hover:text-[#3b1f4a] hover:underline"
          >
            ← Changer de profil
          </button>
          <p className="chip w-fit">
            {role === "teacher" ? "Espace professeur" : "Bienvenue"} · {step}/{steps.length}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
            {current.title}
          </h1>
          <p className="text-sm leading-relaxed text-[#5d5468]">{current.body}</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              aria-current={step === s.id}
              className={`h-2 flex-1 rounded-full transition ${
                step >= s.id ? "bg-[#ff6b6b]" : "bg-[#e7e0d4]"
              } ${step === s.id ? "ring-2 ring-[#ff6b6b40] ring-offset-1" : ""}`}
              aria-label={`Étape ${s.id}`}
            />
          ))}
        </div>

        {/* Visuel de l'étape */}
        {current.visual === "interactive" && <Step1Interactive />}
        {current.visual === "stats" && <Step2StatsVisual />}
        {current.visual === "import" && <ImportPicto />}
        {current.visual === "teacher-class" && <TeacherClassVisual />}
        {current.visual === "teacher-casting" && <TeacherCastingVisual />}
        {current.visual === "teacher-show" && <TeacherShowVisual />}

        {/* Navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-sm font-semibold text-[#5d5468] hover:text-[#3b1f4a]"
              >
                ← Précédent
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <button type="button" onClick={() => setStep(step + 1)} className="btn-primary !min-h-[48px] !px-7">
                Suivant
              </button>
            ) : (
              <Link href="/subscribe" className="btn-primary !min-h-[48px] !px-7">
                Découvrir les plans
              </Link>
            )}
          </div>
        </div>

        {/* Garantie - dernière étape */}
        {isLastStep && (
          <div className="flex flex-col gap-2 text-xs text-[#8a8093]">
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="font-semibold">Garantie satisfait ou remboursé sous 14 jours</span>
            </p>
            <p>Tu pourras annuler à tout moment depuis &quot;Mon compte&quot;.</p>
            {role === "teacher" && (
              <p>
                Un seul abonnement suffit pour toute la classe : tes élèves n&apos;ont rien à payer.
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA sticky mobile - dernière étape */}
      {isLastStep && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e7e0d4] bg-white/95 p-4 shadow-lg backdrop-blur-sm md:hidden">
          <div className="mx-auto max-w-3xl">
            <Link href="/subscribe" className="btn-primary !min-h-[52px] w-full">
              Découvrir les plans
            </Link>
            <p className="mt-2 text-center text-xs font-semibold text-green-600">
              ✓ Garantie satisfait ou remboursé sous 14 jours
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
