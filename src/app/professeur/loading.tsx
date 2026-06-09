export default function TeacherDashboardLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-36 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-9 w-64 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-full bg-[#3b1f4a14]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="card flex h-40 animate-pulse flex-col gap-3 p-5">
            <div className="h-6 w-40 rounded-full bg-[#3b1f4a14]" />
            <div className="h-4 w-full rounded-full bg-[#3b1f4a14]" />
            <div className="mt-auto flex gap-2">
              <div className="h-6 w-20 rounded-full bg-[#3b1f4a14]" />
              <div className="h-6 w-20 rounded-full bg-[#3b1f4a14]" />
            </div>
          </div>
        ))}
      </div>
      <div className="card h-64 animate-pulse p-6" />
    </div>
  );
}
