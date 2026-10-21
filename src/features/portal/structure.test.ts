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
