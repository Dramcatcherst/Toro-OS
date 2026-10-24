import { expect, it } from "vitest";
import { portalDomains, type PortalModule } from "./model";
import { resolvePortalStructure } from "./structure";

function moduleFixture(): PortalModule[] {
  return portalDomains.map(domain => ({
    ordinal: domain.ordinal,
    label: domain.label,
    description: domain.description,
    status: `status-${domain.ordinal}`,
    note: `note-${domain.ordinal}`,
    href: domain.ordinal % 2 === 0 ? `/module/${domain.ordinal}` : null,
    action: domain.ordinal % 2 === 0 ? `action-${domain.ordinal}` : null,
  }));
}

function flattened(structure: ReturnType<typeof resolvePortalStructure>) {
  return [
    ...structure.today,
    ...structure.families.flatMap(family => family.modules),
    ...structure.map,
    ...structure.system,
    ...structure.unmapped,
  ];
}

it("preserves_all_ordinals_once", () => {
  const result = resolvePortalStructure(moduleFixture());
  const ordinals = flattened(result).map(portalModule => portalModule.ordinal).sort((a, b) => a - b);

  expect(ordinals).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  expect(result.families.map(family => family.key)).toEqual([
    "clients", "operations", "team", "money", "growth", "projects",
  ]);
});

it("preserves_module_identity_and_status", () => {
  const input = moduleFixture();
  const output = flattened(resolvePortalStructure(input));

  for (const portalModule of input) {
    const mapped = output.filter(candidate => candidate.ordinal === portalModule.ordinal);
    expect(mapped).toHaveLength(1);
    expect(mapped[0]).toBe(portalModule);
    expect(mapped[0].status).toBe(`status-${portalModule.ordinal}`);
  }
});

it("empty_input_is_empty", () => {
  expect(resolvePortalStructure([])).toEqual({
    today: [], families: [], map: [], system: [], unmapped: [],
  });
});

it("preserves_unknown_ordinal", () => {
  const unknown: PortalModule = {
    ordinal: 99, label: "Future", description: "Future module", status: "Unknown",
    note: "No inferred capability", href: null, action: null,
  };
  const result = resolvePortalStructure([...moduleFixture(), unknown]);

  expect(result.unmapped).toEqual([unknown]);
  expect(flattened(result).filter(portalModule => portalModule === unknown)).toHaveLength(1);
});

it("does_not_mutate_input", () => {
  const input = moduleFixture();
  const before = input.slice();
  Object.freeze(input);

  resolvePortalStructure(input);

  expect(input).toEqual(before);
  input.forEach((portalModule, index) => expect(portalModule).toBe(before[index]));
});

// Independent expected contract: do not derive this from the implementation.
const expectedFamilies = [
  { key: "clients", label: "Clientes y ventas", ordinals: [4] },
  { key: "operations", label: "Operación y recursos", ordinals: [5, 9] },
  { key: "team", label: "Equipo", ordinals: [6] },
  { key: "money", label: "Dinero y cumplimiento", ordinals: [2, 8] },
  { key: "growth", label: "Contenido y crecimiento", ordinals: [3, 7] },
  { key: "projects", label: "Proyectos", ordinals: [10] },
];

it("preserves_exact_family_members_labels_and_cross_cutting_slots", () => {
  const result = resolvePortalStructure(moduleFixture());

  expect(result.families.map(family => ({
    key: family.key, label: family.label,
    ordinals: family.modules.map(portalModule => portalModule.ordinal),
  }))).toEqual(expectedFamilies);
  expect(result.today.map(portalModule => portalModule.ordinal)).toEqual([1]);
  expect(result.map.map(portalModule => portalModule.ordinal)).toEqual([0]);
  expect(result.system.map(portalModule => portalModule.ordinal)).toEqual([11]);
  expect(result.unmapped).toEqual([]);
});

it("preserves_all_4096_subsets_without_inventing_or_losing_modules", () => {
  const source = moduleFixture();
  expect(source.map(portalModule => portalModule.ordinal)).toEqual([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
  ]);

  for (let mask = 0; mask < 4096; mask += 1) {
    const input = source.filter(portalModule => Boolean(mask & (1 << portalModule.ordinal)));
    const result = resolvePortalStructure(input);
    const output = flattened(result);

    expect(output).toHaveLength(input.length);
    expect(new Set(output).size).toBe(input.length);
    input.forEach(portalModule => expect(output.includes(portalModule)).toBe(true));
    expect(result.families.map(family => ({
      key: family.key, ordinals: family.modules.map(portalModule => portalModule.ordinal),
    }))).toEqual(expectedFamilies.flatMap(family => {
      const ordinals = family.ordinals.filter(ordinal => Boolean(mask & (1 << ordinal)));
      return ordinals.length ? [{ key: family.key, ordinals }] : [];
    }));
    expect(result.today.map(portalModule => portalModule.ordinal)).toEqual(mask & 2 ? [1] : []);
    expect(result.map.map(portalModule => portalModule.ordinal)).toEqual(mask & 1 ? [0] : []);
    expect(result.system.map(portalModule => portalModule.ordinal)).toEqual(mask & 2048 ? [11] : []);
    expect(result.unmapped).toEqual([]);
  }
});

it("accepts_frozen_modules_without_mutating_any_field", () => {
  const input = Object.freeze(moduleFixture().map(portalModule => Object.freeze(portalModule)));
  const before = JSON.stringify(input);

  expect(() => resolvePortalStructure(input)).not.toThrow();
  expect(JSON.stringify(input)).toBe(before);
});

it("preserves_multiple_unknown_ordinals_in_received_order", () => {
  const template = moduleFixture()[0];
  const unknown = [99, 101, -1].map(ordinal => ({ ...template, ordinal, href: null, action: null }));
  const result = resolvePortalStructure([unknown[0], moduleFixture()[4], unknown[1], unknown[2]]);

  expect(result.unmapped).toEqual(unknown);
  unknown.forEach(portalModule => {
    expect(flattened(result).filter(candidate => candidate === portalModule)).toHaveLength(1);
  });
});

it("keeps_family_order_stable_and_member_order_from_input", () => {
  const result = resolvePortalStructure(moduleFixture().reverse());

  expect(result.families.map(family => family.key)).toEqual(expectedFamilies.map(family => family.key));
  expect(result.families.find(family => family.key === "operations")?.modules.map(portalModule => portalModule.ordinal)).toEqual([9, 5]);
});

it("does_not_promote_unavailable_modules_or_invent_actions", () => {
  for (const status of ["En preparación", "Bloqueado", "Fuente por verificar"]) {
    const portalModule = Object.freeze({
      ...moduleFixture()[2], status, note: "No disponible para esta cuenta", href: null, action: null,
    });
    const output = flattened(resolvePortalStructure([portalModule]));

    expect(output).toHaveLength(1);
    expect(output[0]).toBe(portalModule);
    expect(output[0]).toMatchObject({ status, note: "No disponible para esta cuenta", href: null, action: null });
  }
});

it("does_not_retain_modules_from_a_previous_call", () => {
  const firstModule = { ...moduleFixture()[6], label: "Equipo del contexto A" };
  const secondModule = { ...moduleFixture()[6], label: "Equipo del contexto B" };
  const first = resolvePortalStructure([firstModule]);
  const second = resolvePortalStructure([secondModule]);

  expect(flattened(first)[0]).toBe(firstModule);
  expect(flattened(second)[0]).toBe(secondModule);
  expect(flattened(second).includes(firstModule)).toBe(false);
  expect(first.families[0]).not.toBe(second.families[0]);
  expect(first.families[0].modules).not.toBe(second.families[0].modules);
  expect(flattened(resolvePortalStructure([]))).toEqual([]);
});
