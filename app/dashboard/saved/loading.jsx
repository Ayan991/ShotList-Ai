function SkeletonCard() {
  return (
    <div className="animate-pulse rounded border border-line bg-surface p-5">
      <div className="h-3 w-24 rounded bg-line" />
      <div className="mt-4 h-7 w-48 rounded bg-line" />
      <div className="mt-2 h-4 w-32 rounded bg-line" />
      <div className="mt-5 flex gap-2">
        <div className="h-8 w-20 rounded bg-line" />
        <div className="h-8 w-20 rounded bg-line" />
      </div>
    </div>
  );
}

export default function LoadingSavedWeddingsPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">Saved Weddings</p>
          <h1 className="mt-3 font-serif text-4xl text-text md:text-5xl">Past wedding plans.</h1>
        </div>
      </div>
      <div className="grid gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
