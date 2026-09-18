export default function Room360Loading() {
  return (
    <div role="status" className="space-y-4 pb-24 md:pb-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="h-3 w-28 animate-pulse rounded bg-neutral-200" />
        <div className="mt-3 h-8 w-64 max-w-full animate-pulse rounded bg-neutral-200" />
        <p className="mt-4 text-sm text-neutral-500">Cargando ficha gobernada de la habitación…</p>
      </div>
    </div>
  );
}
