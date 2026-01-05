export default function SceneDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-64 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-5 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 w-28 animate-pulse rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-xl px-3 py-2">
            <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}




