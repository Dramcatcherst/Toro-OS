export default function ToroHotelLoading() {
  return (
    <div className="space-y-4 pb-24 md:space-y-6 md:pb-8" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="h-9 w-36 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-neutral-100" />
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
        ))}
      </div>
      <span className="sr-only">Cargando habitaciones de TORO.</span>
    </div>
  );
}
