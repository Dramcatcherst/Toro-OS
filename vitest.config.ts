import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Existing suites model the internal runtime. Public-demo suites explicitly unset/override this.
    env: { TORO_DEPLOYMENT_MODE: "internal" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/test/server-only-shim.ts", import.meta.url)),
    },
  },
});
