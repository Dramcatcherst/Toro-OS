import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Room 360 route has a meaningful loading state", async () => {
  const source = await readFile("src/app/toro/habitaciones/[key]/loading.tsx", "utf8");
  assert.match(source, /Cargando ficha 360/i);
  assert.match(source, /animate-pulse/);
});
