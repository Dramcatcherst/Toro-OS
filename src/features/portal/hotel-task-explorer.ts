import { HOTEL_TASK_DISPLAY_LIMIT, HOTEL_TASK_READ_LIMIT, type HotelTask } from "./hotel-operations";

export type HotelTaskSort = "priority" | "due" | "recent";
export type HotelTaskFilters = {
  query: string; area: string; unassignedOnly: boolean; revalidationOnly: boolean;
  sort: HotelTaskSort; page: number;
};
export const initialHotelTaskFilters: HotelTaskFilters = {
  query: "", area: "", unassignedOnly: false, revalidationOnly: false, sort: "priority", page: 1,
};
export type HotelTaskFilterAction = { type: "reset" } | { type: "page"; page: number }
  | { type: "criteria"; change: Partial<Omit<HotelTaskFilters, "page">> };
export function hotelTaskFiltersReducer(state: HotelTaskFilters, action: HotelTaskFilterAction): HotelTaskFilters {
  if (action.type === "reset") return { ...initialHotelTaskFilters };
  if (action.type === "page") return { ...state, page: action.page };
  return { ...state, ...action.change, page: 1 };
}
const normalized = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("es").trim();
const priorityRank = (value: string) => {
  const key = value.toLowerCase();
  return ["critical", "p0"].includes(key) ? 0 : ["high", "p1", "urgent"].includes(key) ? 1
    : ["medium", "normal", "p2"].includes(key) ? 2 : ["low", "p3"].includes(key) ? 3 : 4;
};
const dueOrder = (a: HotelTask, b: HotelTask) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
const recentOrder = (a: HotelTask, b: HotelTask) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt);

export function recordedTaskStatus(value: string): string {
  const labels: Record<string, string> = { blocked: "Bloqueada", planned: "Planificada", pending: "Pendiente",
    in_progress: "En curso", active: "Activa", open: "Abierta", review: "En revisión", needs_review: "Por revisar", unknown: "Por verificar" };
  const key = value.toLowerCase();
  return Object.hasOwn(labels, key) ? labels[key] : "Otro estado registrado";
}
export function recordedTaskPriority(value: string): string {
  return ["Crítica", "Alta", "Media", "Baja", "Por verificar"][priorityRank(value)];
}
function summaryArea(value: string): string {
  // Only recognized department labels enter the clipboard; never free-text fields.
  const labels: Record<string, string> = { recepcion: "Recepción", reception: "Recepción", maintenance: "Mantenimiento", mantenimiento: "Mantenimiento",
    housekeeping: "Aseo", aseo: "Aseo", operations: "Operación", operaciones: "Operación", systems: "Sistemas", sistemas: "Sistemas",
    administration: "Administración", administracion: "Administración", finance: "Finanzas", finanzas: "Finanzas", accounting: "Contabilidad",
    contabilidad: "Contabilidad", projects: "Proyectos", proyectos: "Proyectos", marketing: "Mercadeo", mercadeo: "Mercadeo", people: "Personas", personas: "Personas" };
  const key = normalized(value);
  return Object.hasOwn(labels, key) ? labels[key] : "Otra área registrada";
}
function counts(items: HotelTask[], label: (task: HotelTask) => string): string {
  const groups = new Map<string, number>();
  for (const item of items) { const key = label(item); groups.set(key, (groups.get(key) ?? 0) + 1); }
  return [...groups].sort(([a], [b]) => a.localeCompare(b, "es")).map(([key, count]) => `${key}: ${count}`).join(" · ") || "Sin coincidencias";
}
export function selectHotelTasks(input: readonly HotelTask[], filters: HotelTaskFilters) {
  const eligible = input.slice(0, HOTEL_TASK_READ_LIMIT);
  const terms = normalized(filters.query).split(/\s+/).filter(Boolean);
  const matched = eligible.filter(item => (!filters.area || item.area === filters.area)
    && (!filters.unassignedOnly || !item.owner) && (!filters.revalidationOnly || item.needsRevalidation)
    && terms.every(term => {
      const shortReference = /^([0-9a-f]{4})…([0-9a-f]{8})$/.exec(term);
      return shortReference ? item.canonicalRef.startsWith(shortReference[1]) && item.canonicalRef.endsWith(shortReference[2])
        : normalized([item.title, item.area, item.owner ?? "", item.sourceSystem, item.canonicalRef].join(" ")).includes(term);
    }));
  matched.sort((a, b) => (filters.sort === "recent" ? recentOrder(a, b)
    : filters.sort === "due" ? dueOrder(a, b) || priorityRank(a.priority) - priorityRank(b.priority) || recentOrder(a, b)
    : priorityRank(a.priority) - priorityRank(b.priority) || dueOrder(a, b) || recentOrder(a, b))
    || a.canonicalRef.localeCompare(b.canonicalRef));
  const pageCount = Math.max(1, Math.ceil(matched.length / HOTEL_TASK_DISPLAY_LIMIT));
  const page = Math.min(pageCount, Math.max(1, Number.isFinite(filters.page) ? Math.floor(filters.page) : 1));
  const offset = (page - 1) * HOTEL_TASK_DISPLAY_LIMIT;
  return { items: matched.slice(offset, offset + HOTEL_TASK_DISPLAY_LIMIT), eligibleCount: eligible.length,
    totalMatches: matched.length, pageCount, page, start: matched.length ? offset + 1 : 0, end: Math.min(offset + HOTEL_TASK_DISPLAY_LIMIT, matched.length),
    areas: [...new Set(eligible.map(item => item.area))].sort((a, b) => a.localeCompare(b, "es")),
    summary: { areas: counts(matched, item => summaryArea(item.area)), states: counts(matched, item => recordedTaskStatus(item.status)),
      unassigned: matched.filter(item => !item.owner).length, revalidation: matched.filter(item => item.needsRevalidation).length,
      latestUpdatedAt: matched.reduce<string | null>((latest, item) => !latest || Date.parse(item.updatedAt) > Date.parse(latest) ? item.updatedAt : latest, null) } };
}
export type HotelTaskSelection = ReturnType<typeof selectHotelTasks>;
export function buildHotelTaskSummary(selection: HotelTaskSelection, filters: HotelTaskFilters,
  coverage: { rowsRead: number | null; limitReached: boolean; readAt: string | null }): string {
  const criteria = [filters.query.trim() ? "búsqueda activa (texto omitido)" : "sin búsqueda", filters.area ? "área seleccionada" : "todas las áreas",
    filters.unassignedOnly ? "sin responsable" : "cualquier asignación", filters.revalidationOnly ? "requiere revalidación" : "cualquier revalidación"].join(" · ");
  const sort = { priority: "prioridad registrada", due: "vencimiento registrado", recent: "última modificación" }[filters.sort];
  return ["TORO · revisión de trabajo registrado · borrador, no enviado",
    `Consulta: ${coverage.readAt ?? "corte desconocido"}. La consulta no actualiza la fecha original de los registros.`,
    `${coverage.rowsRead ?? "Desconocidas"} filas consultadas · ${selection.eligibleCount} tareas elegibles · ${selection.totalMatches} coincidencias.`,
    `Cobertura acotada${coverage.limitReached ? " · límite de lectura alcanzado" : ""}. Total del hotel desconocido.`,
    `Filtros: ${criteria}. Orden: ${sort}.`,
    `Página ${selection.page} de ${selection.pageCount} · ${selection.start}–${selection.end} de ${selection.totalMatches} coincidencias.`,
    `Áreas del conjunto filtrado: ${selection.summary.areas}.`, `Estados registrados: ${selection.summary.states}.`,
    `Por revalidar: ${selection.summary.revalidation} · Sin responsable registrado: ${selection.summary.unassigned}.`,
    `Fuente: registros canónicos TORO. Última modificación del conjunto filtrado: ${selection.summary.latestUpdatedAt ?? "desconocida"}.`,
    "Texto y nombres omitidos. Los estados no certifican ejecución física ni vigencia actual.",
    ...selection.items.slice(0, 3).map(item => `Referencia: ${item.canonicalRef.slice(0, 4)}…${item.canonicalRef.slice(-8)} · ${recordedTaskStatus(item.status)}`),
    ...(selection.items.length > 3 ? [`Otras ${selection.items.length - 3} referencias de esta página en el Portal.`] : []),
    "Abrir detalles: https://toro.dreamcatcherhotel.com/portal?tab=operations"].join("\n");
}
export async function copyHotelTaskSummary(summary: string, writer?: (value: string) => Promise<void>): Promise<"copied" | "manual"> {
  if (!writer) return "manual";
  try { await writer(summary); return "copied"; } catch { return "manual"; }
}
