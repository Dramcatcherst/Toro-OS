import { defineConfig, mergeConfig } from "vitest/config";
import base from "./vitest.config";

export default mergeConfig(base, defineConfig({
  test: {
    include: ["tests/portal-layout.browser.test.tsx"],
    css: { include: [/portal\.module\.css/], modules: { classNameStrategy: "non-scoped" } },
  },
}));
