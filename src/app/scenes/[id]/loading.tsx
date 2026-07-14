export default function SceneDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-8 w-64 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-4 w-40 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-[#3b1f4a14]" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-5 w-32 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-10 w-28 animate-pulse rounded-full border border-[#e7e1d9] bg-white/70"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-[#e7e1d9] bg-white/80 p-4 shadow-sm">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-xl px-3 py-2">
            <div className="h-3 w-20 animate-pulse rounded-full bg-[#3b1f4a14]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-[#3b1f4a14]" />
          </div>
        ))}
      </div>
    </div>
  );
}




