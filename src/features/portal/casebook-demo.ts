import type { CasebookRecord } from "./casebook-model";

// Deliberately fictional client-safe examples. This module is never a source of business facts.
const common = {
  observed: "Ejemplo sin consulta real", source: "Ficha ficticia para probar el formato",
  limitation: "No acredita un hecho, saldo, derecho ni obligación real.", amount: null,
} as const;
const person = { entityId: "demo-person", entityLabel: "Persona de ejemplo" };
const company = { entityId: "demo-company", entityLabel: "Sociedad de ejemplo" };

export const CASEBOOK_DEMO_RECORDS: readonly CasebookRecord[] = [
  { ...common, ...person, id: "demo-person", category: "entities", kind: "Persona física", title: "Persona de ejemplo", period: null, status: "pending", reference: "Ejemplo P-01", summary: "Identidad y variantes documentadas se consultarán juntas en el mismo expediente.", nextAction: "Verificar identidad y ámbito permitido antes de leer documentos.", relations: ["Vehículo de ejemplo", "Inmueble de ejemplo"] },
  { ...common, ...company, id: "demo-company", category: "entities", kind: "Persona jurídica", title: "Sociedad de ejemplo", period: "2026", status: "partial", reference: "Ejemplo S-01", summary: "Cargo, participación económica y representación se muestran por separado.", nextAction: "Corroborar cada vínculo con su documento y fecha.", relations: ["Cuenta de ejemplo", "Obligación de ejemplo"] },
  { ...common, ...person, id: "demo-vehicle", category: "assets", kind: "Vehículo", title: "Vehículo de ejemplo", period: "2026", status: "pending", reference: "Ejemplo V-01", summary: "Titularidad observada, posesión e inspección requieren evidencia independiente.", nextAction: "Contrastar registro, traspaso, tributos e inspección.", relations: ["Persona de ejemplo"] },
  { ...common, ...person, id: "demo-property", category: "assets", kind: "Inmueble", title: "Inmueble de ejemplo", period: "2025", status: "partial", reference: "Ejemplo I-01", summary: "El estudio conservará titular, gravámenes, plano y corte de cada fuente.", nextAction: "Completar el estudio y resolver diferencias entre fuentes.", relations: ["Persona de ejemplo"] },
  { ...common, ...company, id: "demo-bank", category: "banking", kind: "Cuenta bancaria", title: "Cuenta de ejemplo", period: "2026", status: "blocked", reference: "Ejemplo B-01 · sin número bancario", summary: "Un estado de cuenta no equivale a conciliación contable ni a saldo actual.", nextAction: "Obtener el original del período antes de aceptar cruces.", relations: ["Sociedad de ejemplo", "Documento de ejemplo"], amount: { minor: 0, currency: "USD", nature: "Diferencia ficticia, no saldo" } },
  { ...common, ...company, id: "demo-tax", category: "tax", kind: "Obligación fiscal", title: "Obligación de ejemplo", period: "2026", status: "unknown", reference: "Ejemplo F-01", summary: "La deuda, el crédito disponible y el derecho de devolución son estados distintos.", nextAction: "Verificar período, naturaleza e importe con soporte oficial.", relations: ["Sociedad de ejemplo"], amount: { minor: null, currency: "CRC", nature: "Obligación de ejemplo" } },
  { ...common, ...company, id: "demo-document", category: "evidence", kind: "Documento", title: "Documento de ejemplo <sin original>", period: "2026", status: "verified", reference: "Ejemplo E-01", summary: "La verificación de este ejemplo ilustra el formato; no valida ningún documento real.", nextAction: "Comprobar custodia y permiso antes de ofrecer una descarga.", relations: ["Cuenta de ejemplo"] },
  { ...common, ...company, id: "demo-task", category: "tasks", kind: "Acción pendiente", title: "Revisión de ejemplo", period: null, status: "pending", reference: "Ejemplo T-01", summary: "La acción conservará responsable, evidencia y vencimiento confirmado o pendiente.", nextAction: "Confirmar responsable y fecha; no generar una alerta con datos supuestos.", relations: ["Sociedad de ejemplo", "Obligación de ejemplo"] },
];
