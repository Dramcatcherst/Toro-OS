export const CASEBOOK_CATEGORIES = {
  all: "Todo", entities: "Personas y sociedades", assets: "Bienes",
  banking: "Bancos", tax: "Fiscal y CCSS", evidence: "Evidencia", tasks: "Pendientes",
} as const;
export const CASEBOOK_STATUSES = {
  pending: "Pendiente", partial: "Parcial", blocked: "Bloqueado", verified: "Verificado", unknown: "Desconocido",
} as const;
export type CasebookCategory = keyof typeof CASEBOOK_CATEGORIES;
export type CasebookStatus = keyof typeof CASEBOOK_STATUSES;
export type CasebookAmount = { minor: number | null; currency: "CRC" | "USD"; nature: string };
export type CasebookRecord = {
  id: string; category: Exclude<CasebookCategory, "all">; kind: string; title: string;
  entityId: string; entityLabel: string; period: string | null; status: CasebookStatus;
  reference: string; observed: string; summary: string; limitation: string;
  nextAction: string; source: string; relations: readonly string[]; amount: CasebookAmount | null;
};
export type CasebookState = {
  query: string; category: CasebookCategory; entity: string; period: string;
  status: CasebookStatus | "all"; selectedId: string | null; detailOpen: boolean;
};
export type CasebookAction =
  | { type: "query" | "entity" | "period"; value: string }
  | { type: "category"; value: CasebookCategory }
  | { type: "status"; value: CasebookStatus | "all" }
  | { type: "select"; id: string }
  | { type: "back" | "reset" };

export function createCasebookState(): CasebookState {
  return { query: "", category: "all", entity: "all", period: "all", status: "all", selectedId: null, detailOpen: false };
}

export function casebookReducer(state: CasebookState, action: CasebookAction): CasebookState {
  switch (action.type) {
    case "reset": return createCasebookState();
    case "select": return { ...state, selectedId: action.id, detailOpen: true };
    case "back": return { ...state, detailOpen: false };
    default: return { ...state, [action.type]: action.value, selectedId: null, detailOpen: false };
  }
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function filterCasebookRecords(records: readonly CasebookRecord[], state: CasebookState): CasebookRecord[] {
  const query = normalize(state.query);
  return records.filter(row =>
    (state.category === "all" || row.category === state.category) &&
    (state.entity === "all" || row.entityId === state.entity) &&
    (state.period === "all" || (row.period ?? "unknown") === state.period) &&
    (state.status === "all" || row.status === state.status) &&
    (!query || normalize([row.title, row.kind, row.entityLabel, row.reference, row.summary, row.nextAction, row.source].join(" ")).includes(query)),
  );
}

export function selectedCasebookRecord(records: readonly CasebookRecord[], state: CasebookState): CasebookRecord | null {
  const visible = filterCasebookRecords(records, state);
  return visible.find(row => row.id === state.selectedId) ?? visible[0] ?? null;
}

export function formatCasebookAmount(amount: CasebookAmount | null): string {
  if (!amount) return "No aplica";
  if (amount.minor === null) return `${amount.currency} · monto desconocido · ${amount.nature}`;
  const value = (amount.minor / 100).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${amount.currency} ${value} · ${amount.nature}`;
}
