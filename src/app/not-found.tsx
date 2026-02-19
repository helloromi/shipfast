import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Erreur 404
        </p>
        <h1 className="font-display text-4xl font-semibold text-[#1c1b1f]">
          Page introuvable
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#524b5a]">
          Cette page n'existe pas ou a été déplacée. Si tu as suivi un lien, il est peut-être obsolète.
        </p>
      </div>
      <Link
        href="/home"
        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px] hover:shadow-lg"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
