"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { t } from "@/locales/fr";
import type {
  ClassDetail,
  ShowNoteCategory,
  ShowNoteStatus,
} from "@/types/teacher";

type LibraryScene = { id: string; title: string; author: string | null };

type Props = {
  detail: ClassDetail;
  libraryScenes: LibraryScene[];
};

type Tab = "students" | "texts" | "casting" | "show";

const CATEGORY_ORDER: ShowNoteCategory[] = [
  "mise_en_scene",
  "costumes",
  "decors",
  "accessoires",
  "technique",
  "autre",
];

const NEXT_STATUS: Record<ShowNoteStatus, ShowNoteStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const STATUS_STYLE: Record<ShowNoteStatus, string> = {
  todo: "bg-[#f3eee4] text-[#5d5468]",
  in_progress: "bg-[#f4c95d3d] text-[#7a5c12]",
  done: "bg-[#2cb67d24] text-[#1c6b4f]",
};

async function api(path: string, method: string, body?: unknown): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.ok) return { ok: true };
  const data = await res.json().catch(() => null);
  return { ok: false, error: data?.error ?? "Une erreur est survenue." };
}

export function ClassDetailClient({ detail, libraryScenes }: Props) {
  const router = useRouter();
  const { klass, members, scenes, assignments, showNotes } = detail;

  const [tab, setTab] = useState<Tab>("students");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? null);
      return;
    }
    router.refresh();
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(klass.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignoré : l'utilisateur peut copier manuellement
    }
  };

  const memberName = (memberId: string | null) => {
    if (!memberId) return null;
    const m = members.find((m) => m.id === memberId);
    return m ? m.display_name || m.email : null;
  };

  const sceneTitle = (sceneId: string | null) => {
    if (!sceneId) return null;
    return scenes.find((s) => s.id === sceneId)?.title ?? null;
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "students", label: t.teacher.class.tabs.students, count: members.length },
    { id: "texts", label: t.teacher.class.tabs.texts, count: scenes.length },
    { id: "casting", label: t.teacher.class.tabs.casting, count: assignments.length },
    { id: "show", label: t.teacher.class.tabs.show, count: showNotes.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête de classe */}
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold text-[#211a26]">{klass.name}</h1>
          {klass.description && <p className="text-sm text-[#5d5468]">{klass.description}</p>}
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-[#d8cfc0] bg-[#f9f6f0] px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8a8093]">
            {t.teacher.class.inviteCode}
          </span>
          <div className="flex items-center gap-3">
            <code className="font-display text-2xl font-semibold tracking-[0.2em] text-[#3b1f4a]">
              {klass.invite_code}
            </code>
            <button type="button" onClick={copyCode} className="btn-secondary !min-h-[34px] !px-3 !py-1 text-xs">
              {copied ? t.teacher.class.copied : t.teacher.class.copyCode}
            </button>
          </div>
          <p className="max-w-[260px] text-xs text-[#8a8093]">
            {t.teacher.class.inviteHint} <span className="font-semibold">cote-cour.fr/rejoindre</span>
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-[#3b1f4a] text-white shadow-sm"
                : "bg-white text-[#5d5468] ring-1 ring-[#e7e0d4] hover:text-[#3b1f4a]"
            }`}
          >
            {item.label}
            {typeof item.count === "number" && (
              <span className={`ml-2 text-xs ${tab === item.id ? "text-[#f4c95d]" : "text-[#8a8093]"}`}>
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-[#e11d4815] px-4 py-3 text-sm font-semibold text-[#e11d48]">{error}</p>
      )}

      {/* --- Élèves --- */}
      {tab === "students" && (
        <div className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const email = (form.elements.namedItem("email") as HTMLInputElement).value;
              const displayName = (form.elements.namedItem("displayName") as HTMLInputElement).value;
              run(() =>
                api(`/api/teacher/classes/${klass.id}/members`, "POST", { email, displayName })
              ).then(() => form.reset());
            }}
            className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label className="label" htmlFor="member-email">{t.teacher.students.addTitle}</label>
              <input
                id="member-email"
                name="email"
                type="email"
                required
                placeholder={t.teacher.students.emailPlaceholder}
                className="input"
              />
            </div>
            <div className="flex-1">
              <input
                name="displayName"
                type="text"
                placeholder={t.teacher.students.namePlaceholder}
                className="input"
                aria-label={t.teacher.students.namePlaceholder}
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary">
              {t.teacher.students.addButton}
            </button>
          </form>

          {members.length === 0 ? (
            <p className="card p-6 text-sm text-[#5d5468]">{t.teacher.students.empty}</p>
          ) : (
            <ul className="card divide-y divide-[#efe9dd] p-2">
              {members.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#211a26]">
                      {m.display_name || m.email}
                    </span>
                    {m.display_name && <span className="text-xs text-[#8a8093]">{m.email}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {m.joined_at ? (
                      <span className="rounded-full bg-[#2cb67d24] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                        ✓ {t.teacher.students.joined}
                      </span>
                    ) : (
                      <span
                        className="rounded-full bg-[#f4c95d3d] px-3 py-1 text-xs font-semibold text-[#7a5c12]"
                        title={`${m.display_name || m.email} ${t.teacher.students.pendingHint}`}
                      >
                        {t.teacher.students.pending}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!confirm(t.teacher.students.removeConfirm)) return;
                        run(() =>
                          api(`/api/teacher/classes/${klass.id}/members?memberId=${m.id}`, "DELETE")
                        );
                      }}
                      className="text-xs font-semibold text-[#8a8093] underline-offset-4 hover:text-[#e11d48] hover:underline"
                    >
                      {t.teacher.students.remove}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* --- Textes --- */}
      {tab === "texts" && (
        <div className="flex flex-col gap-4">
          <div className="card flex flex-col gap-3 p-5">
            <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
              {t.teacher.texts.addTitle}
            </h2>
            <p className="text-sm text-[#5d5468]">{t.teacher.texts.addHint}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <AttachSceneSelect
                libraryScenes={libraryScenes.filter((s) => !scenes.some((cs) => cs.id === s.id))}
                disabled={busy}
                onAttach={(sceneId) =>
                  run(() => api(`/api/teacher/classes/${klass.id}/scenes`, "POST", { sceneId }))
                }
              />
              <Link href="/scenes/import" className="btn-secondary whitespace-nowrap">
                {t.teacher.texts.importCta}
              </Link>
            </div>
          </div>

          {scenes.length === 0 ? (
            <p className="card p-6 text-sm text-[#5d5468]">{t.teacher.texts.empty}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {scenes.map((s) => (
                <div key={s.id} className="card flex flex-col gap-3 p-5">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#211a26]">{s.title}</h3>
                    <p className="text-xs text-[#8a8093]">
                      {s.author || t.common.labels.auteurInconnu} · {s.lineCount}{" "}
                      {t.teacher.texts.lines} · {s.characters.length} {t.teacher.texts.characters}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <Link
                      href={`/professeur/classes/${klass.id}/textes/${s.id}`}
                      className="btn-primary !min-h-[36px] !px-4 !py-1.5 text-xs"
                    >
                      {t.teacher.texts.annotate}
                    </Link>
                    <Link
                      href={`/scenes/${s.id}`}
                      className="btn-secondary !min-h-[36px] !px-4 !py-1.5 text-xs"
                    >
                      {t.common.buttons.details}
                    </Link>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!confirm(t.teacher.texts.detachConfirm)) return;
                        run(() =>
                          api(`/api/teacher/classes/${klass.id}/scenes?sceneId=${s.id}`, "DELETE")
                        );
                      }}
                      className="ml-auto text-xs font-semibold text-[#8a8093] underline-offset-4 hover:text-[#e11d48] hover:underline"
                    >
                      {t.teacher.texts.detach}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Distribution --- */}
      {tab === "casting" && (
        <CastingTab
          klassId={klass.id}
          members={members}
          scenes={scenes}
          assignments={assignments}
          busy={busy}
          run={run}
          memberName={memberName}
        />
      )}

      {/* --- Spectacle --- */}
      {tab === "show" && (
        <ShowTab
          detail={detail}
          busy={busy}
          run={run}
          memberName={memberName}
          sceneTitle={sceneTitle}
        />
      )}

      {/* Danger zone */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (!confirm(t.teacher.class.deleteConfirm)) return;
            run(() => api(`/api/teacher/classes/${klass.id}`, "DELETE")).then(() => {
              router.push("/professeur");
            });
          }}
          className="text-xs font-semibold text-[#8a8093] underline-offset-4 hover:text-[#e11d48] hover:underline"
        >
          {t.teacher.class.deleteClass}
        </button>
      </div>
    </div>
  );
}

function AttachSceneSelect({
  libraryScenes,
  disabled,
  onAttach,
}: {
  libraryScenes: LibraryScene[];
  disabled: boolean;
  onAttach: (sceneId: string) => void;
}) {
  const [selected, setSelected] = useState("");

  return (
    <div className="flex flex-1 gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="input flex-1"
        aria-label={t.teacher.texts.selectPlaceholder}
      >
        <option value="">{t.teacher.texts.selectPlaceholder}</option>
        {libraryScenes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
            {s.author ? ` — ${s.author}` : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={disabled || !selected}
        onClick={() => {
          onAttach(selected);
          setSelected("");
        }}
        className="btn-primary"
      >
        {t.teacher.texts.attachButton}
      </button>
    </div>
  );
}

function CastingTab({
  klassId,
  members,
  scenes,
  assignments,
  busy,
  run,
  memberName,
}: {
  klassId: string;
  members: ClassDetail["members"];
  scenes: ClassDetail["scenes"];
  assignments: ClassDetail["assignments"];
  busy: boolean;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>) => Promise<void>;
  memberName: (memberId: string | null) => string | null;
}) {
  const [memberId, setMemberId] = useState("");
  const [sceneId, setSceneId] = useState("");
  const [characterId, setCharacterId] = useState("");
  const [note, setNote] = useState("");

  const selectedScene = scenes.find((s) => s.id === sceneId);

  const bySceneAssignments = useMemo(() => {
    const groups = new Map<string, typeof assignments>();
    for (const a of assignments) {
      const list = groups.get(a.scene_id) ?? [];
      list.push(a);
      groups.set(a.scene_id, list);
    }
    return groups;
  }, [assignments]);

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!memberId || !sceneId) return;
          run(() =>
            api(`/api/teacher/classes/${klassId}/assignments`, "POST", {
              memberId,
              sceneId,
              characterId: characterId || null,
              note: note || null,
            })
          ).then(() => {
            setCharacterId("");
            setNote("");
          });
        }}
        className="card flex flex-col gap-3 p-5"
      >
        <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
          {t.teacher.casting.assignTitle}
        </h2>
        <p className="text-sm text-[#5d5468]">{t.teacher.casting.subtitle}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="assign-member">{t.teacher.casting.studentLabel}</label>
            <select
              id="assign-member"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="input"
              required
            >
              <option value="">—</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name || m.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="assign-scene">{t.teacher.casting.textLabel}</label>
            <select
              id="assign-scene"
              value={sceneId}
              onChange={(e) => {
                setSceneId(e.target.value);
                setCharacterId("");
              }}
              className="input"
              required
            >
              <option value="">—</option>
              {scenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="assign-character">{t.teacher.casting.characterLabel}</label>
            <select
              id="assign-character"
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="input"
              disabled={!selectedScene}
            >
              <option value="">{t.teacher.casting.noCharacter}</option>
              {(selectedScene?.characters ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="assign-note">{t.teacher.casting.noteLabel}</label>
          <input
            id="assign-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.teacher.casting.notePlaceholder}
            className="input"
          />
        </div>
        <button type="submit" disabled={busy || !memberId || !sceneId} className="btn-primary self-start">
          {t.teacher.casting.assignButton}
        </button>
      </form>

      {assignments.length === 0 ? (
        <p className="card p-6 text-sm text-[#5d5468]">{t.teacher.casting.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {scenes
            .filter((s) => bySceneAssignments.has(s.id))
            .map((s) => (
              <div key={s.id} className="card p-5">
                <h3 className="font-display text-lg font-semibold text-[#211a26]">{s.title}</h3>
                <ul className="mt-3 divide-y divide-[#efe9dd]">
                  {(bySceneAssignments.get(s.id) ?? []).map((a) => {
                    const character = s.characters.find((c) => c.id === a.character_id);
                    return (
                      <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-semibold text-[#211a26]">
                            {memberName(a.member_id) ?? "—"}
                          </span>
                          <span className="text-xs text-[#8a8093]">
                            {t.teacher.casting.playsRole}{" "}
                            <span className="font-semibold text-[#3b1f4a]">
                              {character?.name ?? t.teacher.casting.wholeText}
                            </span>
                          </span>
                          {a.note && (
                            <span className="text-xs italic text-[#5d5468]">« {a.note} »</span>
                          )}
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (!confirm(t.teacher.casting.unassignConfirm)) return;
                            run(() =>
                              api(
                                `/api/teacher/classes/${klassId}/assignments?assignmentId=${a.id}`,
                                "DELETE"
                              )
                            );
                          }}
                          className="text-xs font-semibold text-[#8a8093] underline-offset-4 hover:text-[#e11d48] hover:underline"
                        >
                          {t.teacher.casting.unassign}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function ShowTab({
  detail,
  busy,
  run,
  memberName,
  sceneTitle,
}: {
  detail: ClassDetail;
  busy: boolean;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>) => Promise<void>;
  memberName: (memberId: string | null) => string | null;
  sceneTitle: (sceneId: string | null) => string | null;
}) {
  const { klass, members, scenes, showNotes } = detail;

  const [showTitle, setShowTitle] = useState(klass.show_title ?? "");
  const [showDate, setShowDate] = useState(klass.show_date ?? "");
  const [showVenue, setShowVenue] = useState(klass.show_venue ?? "");

  const [category, setCategory] = useState<ShowNoteCategory>("mise_en_scene");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteSceneId, setNoteSceneId] = useState("");
  const [noteMemberId, setNoteMemberId] = useState("");

  return (
    <div className="flex flex-col gap-4">
      {/* Infos spectacle */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() =>
            api(`/api/teacher/classes/${klass.id}`, "PATCH", {
              show_title: showTitle,
              show_date: showDate || null,
              show_venue: showVenue,
            })
          );
        }}
        className="card flex flex-col gap-3 p-5"
      >
        <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
          {t.teacher.show.infoTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="show-title">{t.teacher.show.showTitleLabel}</label>
            <input
              id="show-title"
              type="text"
              value={showTitle}
              onChange={(e) => setShowTitle(e.target.value)}
              placeholder={t.teacher.show.showTitlePlaceholder}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="show-date">{t.teacher.show.showDateLabel}</label>
            <input
              id="show-date"
              type="date"
              value={showDate}
              onChange={(e) => setShowDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="show-venue">{t.teacher.show.showVenueLabel}</label>
            <input
              id="show-venue"
              type="text"
              value={showVenue}
              onChange={(e) => setShowVenue(e.target.value)}
              placeholder={t.teacher.show.showVenuePlaceholder}
              className="input"
            />
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-secondary self-start">
          {t.teacher.show.saveInfo}
        </button>
      </form>

      {/* Ajout d'un élément */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          run(() =>
            api("/api/teacher/show-notes", "POST", {
              classId: klass.id,
              category,
              title,
              content: content || null,
              sceneId: noteSceneId || null,
              memberId: noteMemberId || null,
            })
          ).then(() => {
            setTitle("");
            setContent("");
            setNoteSceneId("");
            setNoteMemberId("");
          });
        }}
        className="card flex flex-col gap-3 p-5"
      >
        <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
          {t.teacher.show.addTitle}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="note-category">{t.teacher.show.categoryLabel}</label>
            <select
              id="note-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ShowNoteCategory)}
              className="input"
            >
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {t.teacher.show.categories[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="note-title">{t.teacher.show.titleLabel}</label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.teacher.show.titlePlaceholder}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="note-scene">{t.teacher.show.sceneLabel}</label>
            <select
              id="note-scene"
              value={noteSceneId}
              onChange={(e) => setNoteSceneId(e.target.value)}
              className="input"
            >
              <option value="">{t.teacher.show.allScenes}</option>
              {scenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="note-member">{t.teacher.show.memberLabel}</label>
            <select
              id="note-member"
              value={noteMemberId}
              onChange={(e) => setNoteMemberId(e.target.value)}
              className="input"
            >
              <option value="">{t.teacher.show.allClass}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name || m.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="note-content">{t.teacher.show.contentLabel}</label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.teacher.show.contentPlaceholder}
            className="input min-h-[70px]"
          />
        </div>
        <button type="submit" disabled={busy || !title.trim()} className="btn-primary self-start">
          {t.teacher.show.addButton}
        </button>
      </form>

      {/* Tableau par catégorie */}
      <div className="grid gap-4 lg:grid-cols-2">
        {CATEGORY_ORDER.map((cat) => {
          const notes = showNotes.filter((n) => n.category === cat);
          if (notes.length === 0) return null;
          return (
            <div key={cat} className="card p-5">
              <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
                {t.teacher.show.categories[cat]}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="flex flex-col gap-1 rounded-xl border border-[#efe9dd] bg-white/70 px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-[#211a26]">{n.title}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(() =>
                              api("/api/teacher/show-notes", "PATCH", {
                                id: n.id,
                                status: NEXT_STATUS[n.status],
                              })
                            )
                          }
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[n.status]}`}
                          title="Changer le statut"
                        >
                          {t.teacher.show.statuses[n.status]}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (!confirm(t.teacher.show.deleteConfirm)) return;
                            run(() => api(`/api/teacher/show-notes?id=${n.id}`, "DELETE"));
                          }}
                          className="text-xs text-[#8a8093] hover:text-[#e11d48]"
                          aria-label="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {n.content && <p className="text-xs text-[#5d5468]">{n.content}</p>}
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#8a8093]">
                      {sceneTitle(n.scene_id) && <span>🎭 {sceneTitle(n.scene_id)}</span>}
                      {memberName(n.member_id) && <span>👤 {memberName(n.member_id)}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {showNotes.length === 0 && (
          <p className="card p-6 text-sm text-[#5d5468] lg:col-span-2">{t.teacher.show.empty}</p>
        )}
      </div>
    </div>
  );
}
