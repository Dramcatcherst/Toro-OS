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
