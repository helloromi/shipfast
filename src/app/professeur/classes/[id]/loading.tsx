export default function TeacherClassLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 py-6">
      <div className="h-5 w-40 animate-pulse rounded-full bg-[#3b1f4a14]" />
      <div className="card flex animate-pulse flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-56 rounded-full bg-[#3b1f4a14]" />
          <div className="h-4 w-72 rounded-full bg-[#3b1f4a14]" />
        </div>
        <div className="h-24 w-64 rounded-2xl bg-[#3b1f4a0d]" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-9 w-28 animate-pulse rounded-full bg-[#3b1f4a14]" />
        ))}
      </div>
      <div className="card h-48 animate-pulse p-5" />
      <div className="card h-64 animate-pulse p-5" />
    </div>
  );
}
