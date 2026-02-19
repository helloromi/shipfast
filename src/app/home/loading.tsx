export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-28 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-8 w-56 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-4 w-80 animate-pulse rounded-full bg-[#3b1f4a14]" />
      </div>

      {/* Stats summary skeleton */}
      <div className="h-24 animate-pulse rounded-2xl border border-[#e7e1d9] bg-white/80 shadow-sm" />

      {/* Scene cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="flex h-44 flex-col gap-3 animate-pulse rounded-2xl border border-[#e7e1d9] bg-white/80 p-5 shadow-md"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="h-5 w-36 rounded-full bg-[#3b1f4a14]" />
              <div className="h-5 w-20 rounded-full bg-[#3b1f4a14]" />
            </div>
            <div className="h-4 w-32 rounded-full bg-[#3b1f4a14]" />
            <div className="h-4 w-full rounded-full bg-[#3b1f4a14]" />
            <div className="mt-auto flex gap-2">
              <div className="h-9 flex-1 rounded-full bg-[#3b1f4a14]" />
              <div className="h-9 w-20 rounded-full bg-[#3b1f4a14]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
