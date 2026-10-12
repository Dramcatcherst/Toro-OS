import type { CanonicalBrainReadSlice } from "@/features/brain/canonical-read";

/** Project evidence already authorized by the canonical reader; no original-document resolver. */
export function portalProjectFocus(slice: CanonicalBrainReadSlice, label: string) {
  return {
    capability: "projects.status",
    label,
    coverage: `Cobertura parcial: ${slice.projects.length} proyectos en el lote (tope 25); total organizacional desconocido.`,
    items: slice.projects.map(project => ({
      title: project.label,
      meta: [project.status, project.priority].filter(Boolean).join(" · "),
      detail: project.needsRevalidation ? "Requiere revalidación." : undefined,
      evidence: {
        source: "operations.projects · Supabase / TORO",
        reportedSource: project.sourceSystem ?? "No informada",
        observedAt: project.updatedAt,
        readAt: slice.generatedAt,
      },
    })),
  };
}
