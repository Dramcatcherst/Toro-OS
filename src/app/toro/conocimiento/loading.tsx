export default function ToroKnowledgeLoading() {
  return (
    <div className="space-y-4 pb-24 md:space-y-6 md:pb-8" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <div className="h-3 w-44 animate-pulse rounded bg-neutral-200" />
        <div className="h-9 w-56 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-neutral-100" />
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
        ))}
      </div>
      <span className="sr-only">Cargando conocimiento gobernado de TORO.</span>
    </div>
  );
}
