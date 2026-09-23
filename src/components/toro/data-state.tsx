"use client";

export type DataStateVariant = "loading" | "empty" | "stale" | "forbidden" | "error";

type DataStateProps = {
  variant: DataStateVariant;
  source?: string;
  freshness?: string;
  detail?: string;
  onRetry?: () => void;
};

const copy: Record<DataStateVariant, { title: string; detail: string }> = {
  loading: {
    title: "Cargando información…",
    detail: "Estamos consultando las fuentes gobernadas de TORO.",
  },
  empty: {
    title: "No hay información para mostrar.",
    detail: "No encontramos elementos activos para esta sección.",
  },
  stale: {
    title: "Información desactualizada.",
    detail: "Puedes verla como referencia, pero confirma la fuente antes de tomar una decisión.",
  },
  forbidden: {
    title: "No tienes acceso a esta información.",
    detail: "Solicita acceso a Gerencia si lo necesitas para tu trabajo.",
  },
  error: {
    title: "No pudimos cargar esta información.",
    detail: "TORO no mostrará datos parciales como si fueran actuales.",
  },
};

export function DataState({ variant, source, freshness, detail, onRetry }: DataStateProps) {
  const state = copy[variant];
  const canRetry = variant === "error" || variant === "stale";

  return (
    <div role={variant === "error" ? "alert" : "status"} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <p className="font-medium text-neutral-900">{state.title}</p>
      <p className="mt-1 text-sm leading-6 text-neutral-600">{detail ?? state.detail}</p>
      {variant === "stale" ? (
        <dl className="mt-3 grid gap-1 text-xs text-neutral-500">
          <div className="flex gap-1"><dt className="font-medium">Fuente:</dt><dd>{source ?? "No informada"}</dd></div>
          <div className="flex gap-1"><dt className="font-medium">Actualización:</dt><dd>{freshness ?? "No disponible"}</dd></div>
        </dl>
      ) : null}
      {canRetry && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-11 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900"
        >
          Intentar de nuevo
        </button>
      ) : null}
    </div>
  );
}
