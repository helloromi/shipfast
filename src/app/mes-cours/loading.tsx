export default function StudentClassesLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-6">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-28 animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-9 w-72 max-w-full animate-pulse rounded-full bg-[#3b1f4a14]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-full bg-[#3b1f4a14]" />
      </div>
      <div className="card flex animate-pulse flex-col gap-5 p-6">
        <div className="h-7 w-52 rounded-full bg-[#3b1f4a14]" />
        <div className="h-20 rounded-2xl bg-[#3b1f4a0d]" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-16 rounded-2xl bg-[#3b1f4a0d]" />
          ))}
        </div>
      </div>
    </div>
  );
}
