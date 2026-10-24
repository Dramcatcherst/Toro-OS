import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const css = readFileSync(new URL("./portal.module.css", import.meta.url), "utf8");
const guard = css.split("/* Final future-surface guard:")[1] ?? "";

it("keeps the future visual overrides after legacy portal utilities", () => {
  expect(guard).toContain(".card h3 { color:#f7fbff; }");
  expect(guard).toContain(".headerMenu summary { border-color:#4fa9d9aa;");
  expect(guard).toContain(".utilityRail :is(button,a):nth-child(2)");
  expect(guard).toContain(".favoritesPanel .favoriteCard:nth-child(3n+2)");
  expect(guard).toContain("@media (max-width:400px)");
});

it("keeps owner-attention and people copy legible on their future surfaces", () => {
  expect(guard).toContain(".pendingPanel { color-scheme:dark; color:#fff8eb;");
  expect(guard).toContain(".pendingPanel > .criticalNote { color:#ffd2bd; }");
  expect(guard).toContain(".peoplePanel .panelBody, .peoplePanel .panelNote, .peoplePanel .subtleDisclosure { color:#c8e6e0; }");
});

it("shows the full canonical logo without scaling or cropping", () => {
  expect(guard).toContain(".brandMark img { object-fit:contain; transform:none; }");
});

it("keeps visible auxiliary copy at twelve pixels or larger", () => {
  expect(guard).toContain(".brandName > span, .workspaceTitle > span, .toolMetadata > span, .toolPending, .headerUtilities .clock { font-size:12px; }");
  expect(guard).not.toContain(".headerUtilities .clock { font-size:11px; }");
});
