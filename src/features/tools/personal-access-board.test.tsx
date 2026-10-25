import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  groupPersonalAccessCatalogue, movePersonalAccess, PersonalAccessBoard, personalAccessStorageKey,
  readPersonalAccess, safePersonalAccessUrl, savePersonalAccess, type PersonalAccess,
} from "./personal-access-board";
import type { DirectoryCatalogueItem, ToolCatalogueItem } from "./directory";

vi.mock("next/image", () => ({ default: (props: Record<string, unknown>) => <span data-logo={props.src} /> }));

function memoryStorage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
const first: PersonalAccess = { id: "personal-one", label: "Agenda", url: "https://calendar.example.test/", favorite: true };
const second: PersonalAccess = { id: "personal-two", label: "Portal", url: "/portal", favorite: false };
const base: Omit<DirectoryCatalogueItem, "id" | "name" | "label" | "url" | "project" | "category"> = {
  kind: "directory", purpose: "Consultar reservas y salidas", provider: "Proveedor", state: "registrado",
  lifecycle: "activo", priority: "P1", linkType: "enlace", scope: "Trabajo", homeEligible: false,
};
const catalogue: ToolCatalogueItem[] = [
  { ...base, id: "LINK-901", name: "Reservas", label: "Reservas", url: "https://example.test/reservas", project: "Hotel", category: "Operación" },
  { ...base, id: "LINK-902", name: "Bancos", label: "Bancos", url: "https://example.test/bancos", project: "Hotel", category: "Finanzas" },
  { ...base, id: "LINK-903", name: "Documentos", label: "Documentos", url: null, project: "Proyecto B", category: "Archivo" },
];

describe("personal navigation safety", () => {
  it.each([
    "javascript:alert(1)", "data:text/html,hello", "file:///etc/example", "http://example.test/", "//example.test/",
    "https://user:pass@example.test/", "https://user%40mail.example@example.test/", "https://example.test/?token=value",
    "https://example.test/?password=value", "https://example.test/#auth=value", "https://example.test/#/x?signature=value",
    "https://example.test/?api_key=value", "https://example.test/?apikey=value", "https://example.test/?%74%6f%6b%65%6e=value",
    "https://example.test/?%2574%256f%256b%2565%256e=value", "https://example.test/%00", "https://example.test/%250a",
    "https://example.test/\nnext", "https://example.test/%7f", "https://example.test/%C2%85", "https://example.test/\\other",
    "/api/approvals", "/portal/../api/approvals", "/portal?access_token=value", "/portal#%61uth=value", "/login", "/does-not-exist",
    "https://example.test/?code=value", "https://example.test/credential/value", "https://example.test/%",
    "https://example.test/?session_id=value", "https://example.test/?otp=value", "https://example.test/?api.key=value",
  ])("rejects unsafe or credential-bearing destination %s", destination => {
    expect(safePersonalAccessUrl(destination)).toBeNull();
  });

  it.each(["https://example.test/", "https://example.test/help?period=2026-09#details", "/portal", "/brain", "/my-toro/herramientas#catalogo", "/booking-assist?language=es"]) ("accepts plain navigation %s", destination => {
    expect(safePersonalAccessUrl(destination)).toBe(destination);
  });

  it("enforces the URL length and rejects additional decoding layers", () => {
    expect(safePersonalAccessUrl("https://example.test/" + "x".repeat(2048))).toBeNull();
    const deeplyEncoded = "%" + "25".repeat(10) + "0a";
    expect(safePersonalAccessUrl("https://example.test/" + deeplyEncoded)).toBeNull();
  });
});

describe("local profile preferences", () => {
  it("persists reloads while isolating both user and organization", () => {
    const storage = memoryStorage();
    expect(savePersonalAccess(storage, "user-a:org-1", [first, second])).toBe(true);
    expect(readPersonalAccess(storage, "user-a:org-1")).toEqual({ links: [first, second], warning: false });
    expect(readPersonalAccess(storage, "user-b:org-1").links).toEqual([]);
    expect(readPersonalAccess(storage, "user-a:org-2").links).toEqual([]);
    expect(personalAccessStorageKey("user:a")).not.toBe(personalAccessStorageKey("user%3Aa"));
  });

  it("rejects malicious stored entries and never writes them back", () => {
    const storage = memoryStorage();
    const invalid = { ...first, url: "https://example.test/?token=secret" };
    storage.setItem(personalAccessStorageKey("scope"), JSON.stringify({ version: 1, links: [first, invalid] }));
    expect(readPersonalAccess(storage, "scope")).toEqual({ links: [first], warning: true });
    const untouched = memoryStorage();
    expect(savePersonalAccess(untouched, "scope", [invalid])).toBe(false);
    expect(untouched.getItem(personalAccessStorageKey("scope"))).toBeNull();
  });

  it("retains safe preferences when the browser refuses a subsequent save", () => {
    const blocked = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("quota"); } };
    expect(readPersonalAccess(blocked, "scope")).toEqual({ links: [], warning: true });
    expect(savePersonalAccess(blocked, "scope", [first])).toBe(false);
  });

  it("validates schema, unique IDs, labels and the 50-item limit", () => {
    const storage = memoryStorage();
    expect(savePersonalAccess(storage, "scope", [first, first])).toBe(false);
    expect(savePersonalAccess(storage, "scope", [{ ...first, label: "x".repeat(81) }])).toBe(false);
    expect(savePersonalAccess(storage, "scope", [{ ...first, label: "Name\u0000" }])).toBe(false);
    expect(savePersonalAccess(storage, "scope", Array.from({ length: 51 }, (_, index) => ({ ...first, id: `personal-${index}` })))).toBe(false);
    storage.setItem(personalAccessStorageKey("scope"), JSON.stringify({ version: 2, links: [first] }));
    expect(readPersonalAccess(storage, "scope")).toEqual({ links: [], warning: true });
  });

  it("persists only the minimal preference fields, dropping arbitrary input properties", () => {
    const storage = memoryStorage();
    const withExtra = { ...first, unexpected: "must not persist" };
    expect(savePersonalAccess(storage, "scope", [withExtra])).toBe(true);
    expect(storage.getItem(personalAccessStorageKey("scope"))).not.toContain("unexpected");
    expect(readPersonalAccess(storage, "scope").links).toEqual([first]);
  });

  it("uses a keyed boundary so changing context resets local drafts and preferences", () => {
    const a = PersonalAccessBoard({ items: [], scopeKey: "user-a:org-a" });
    const b = PersonalAccessBoard({ items: [], scopeKey: "user-a:org-b" });
    expect(a.key).toBe("user-a:org-a");
    expect(b.key).toBe("user-a:org-b");
    expect(a.type).toBe(b.type);
    expect(a.key).not.toBe(b.key);
  });

  it("reorders a copy, preserving every link and respecting bounds", () => {
    const original = [first, second];
    expect(movePersonalAccess(original, second.id, -1)).toEqual([second, first]);
    expect(original).toEqual([first, second]);
    expect(movePersonalAccess(original, first.id, -1)).toBe(original);
    expect(movePersonalAccess(original, second.id, 1)).toBe(original);
  });
});

describe("complete access board", () => {
  it("groups projects and categories without imposing a hidden result cap", () => {
    const many = Array.from({ length: 260 }, (_, index) => ({ ...catalogue[0], id: `LINK-${index + 1000}` }));
    const result = groupPersonalAccessCatalogue(many, "");
    expect(result.count).toBe(260);
    expect(result.groups.flatMap(group => group.categories.flatMap(category => category.links))).toHaveLength(260);
    const grouped = groupPersonalAccessCatalogue(catalogue, "");
    expect(grouped.groups.map(group => [group.project, group.count, group.categories.length])).toEqual([["Hotel", 2, 2], ["Proyecto B", 1, 1]]);
  });

  it("finds accent-insensitive names, source metadata, projects and categories", () => {
    expect(groupPersonalAccessCatalogue(catalogue, "operacion").count).toBe(1);
    expect(groupPersonalAccessCatalogue(catalogue, "Proyecto B").groups[0].categories[0].links[0].id).toBe("LINK-903");
    expect(groupPersonalAccessCatalogue(catalogue, "proveedor").count).toBe(3);
    expect(groupPersonalAccessCatalogue(catalogue, "unmatched").count).toBe(0);
  });

  it("renders native nested disclosures, every catalogue destination, clear local status and only real links", () => {
    const html = renderToStaticMarkup(<PersonalAccessBoard items={catalogue} scopeKey="synthetic:user:org" />);
    expect(html.match(/<details\b/g)).toHaveLength(6);
    expect(html).toContain("Solo en este navegador y perfil");
    expect(html).toContain("no demuestra conexión");
    expect(html).toContain('href="https://example.test/reservas"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Destino pendiente");
    expect(html.match(/data-tool="LINK-/g)).toHaveLength(3);
    expect(html).toContain("Añadir acceso");
    expect(html).not.toMatch(/<iframe|onload=|<script/);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
