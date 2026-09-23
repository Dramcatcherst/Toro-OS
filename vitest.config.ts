import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./src/test/server-only-shim.ts", import.meta.url)),
    },
  },
});
