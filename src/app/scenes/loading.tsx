export default function ScenesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-48 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-80 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-32 animate-pulse rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="h-5 w-32 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-6 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="mb-2 h-4 w-40 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}




