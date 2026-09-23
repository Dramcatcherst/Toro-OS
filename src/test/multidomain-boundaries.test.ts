import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = walk(root).filter((path) => /\.(ts|tsx)$/.test(path));

describe("multidomain privacy boundaries", () => {
  it("never references restricted identity/family registries from client-side modules", () => {
    const violations = sourceFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      const isClientModule = /^\s*["']use client["'];/m.test(source);
      if (!isClientModule) return [];

      const restrictedTokens = ["identity_registry", "family_assets"];
      return restrictedTokens
        .filter((token) => source.includes(token))
        .map((token) => `${relative(root, path)} -> ${token}`);
    });

    expect(violations).toEqual([]);
  });

  it("does not hard-code restricted registries into browser-facing components", () => {
    const componentFiles = sourceFiles.filter((path) =>
      relative(root, path).startsWith(`components${process.platform === "win32" ? "\\" : "/"}`),
    );

    const violations = componentFiles.flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return ["identity_registry", "family_assets"]
        .filter((token) => source.includes(token))
        .map((token) => `${relative(root, path)} -> ${token}`);
    });

    expect(violations).toEqual([]);
  });
});
