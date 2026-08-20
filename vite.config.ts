import { createRequire } from "node:module";
import type { UserConfig } from "vite";

// Shared options used by both the Lovable wrapper (when available) and the
// standalone fallback below.
const tanstackStartOptions = {
  // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
  server: { entry: "server" },
};

const require = createRequire(import.meta.url);

function canResolve(id: string) {
  try {
    require.resolve(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * On Lovable (and any environment where @lovable.dev/vite-tanstack-config is
 * installed) we keep using the wrapper. On a plain Vite/Node host — e.g. cPanel
 * running `npm install && npm run build` — that package may not be resolvable,
 * so we fall back to a standard Vite config with the same core plugins.
 * Output goes to `dist/` in both cases.
 */
export default async function config(env: {
  command: "build" | "serve";
  mode: string;
}): Promise<UserConfig> {
  if (canResolve("@lovable.dev/vite-tanstack-config")) {
    const { defineConfig } = await import("@lovable.dev/vite-tanstack-config");
    const wrapped = defineConfig({ tanstackStart: tanstackStartOptions }) as
      | UserConfig
      | ((env: { command: "build" | "serve"; mode: string }) => UserConfig | Promise<UserConfig>);
    return typeof wrapped === "function" ? await wrapped(env) : wrapped;
  }

  const { tanstackStart } = await import("@tanstack/react-start/plugin/vite");
  const react = (await import("@vitejs/plugin-react")).default;
  const tailwindcss = (await import("@tailwindcss/vite")).default;
  const tsConfigPaths = (await import("vite-tsconfig-paths")).default;

  return {
    server: { host: "::", port: 8080 },
    build: { outDir: "dist" },
    resolve: {
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
    },
    plugins: [
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackStart(tanstackStartOptions),
      react(),
    ],
  };
}
