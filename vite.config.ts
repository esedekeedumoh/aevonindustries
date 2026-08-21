import { createRequire } from "node:module";

import type { ConfigEnv, UserConfig } from "vite";

const require = createRequire(import.meta.url);

/**
 * The Lovable wrapper config is only available inside the Lovable build
 * environment (it is a devDependency). On a plain Node host — e.g. cPanel Git
 * Version Control + Node.js/Passenger — we fall back to an equivalent stock
 * Vite configuration so `npm run build` works everywhere.
 */
function hasLovableWrapper(): boolean {
  try {
    require.resolve("@lovable.dev/vite-tanstack-config");
    return true;
  } catch {
    return false;
  }
}

async function lovableConfig(env: ConfigEnv): Promise<UserConfig> {
  const { defineConfig } = await import("@lovable.dev/vite-tanstack-config");
  return defineConfig({
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    },
  })(env);
}

async function standaloneConfig(env: ConfigEnv): Promise<UserConfig> {
  const [{ tanstackStart }, react, tailwindcss, tsConfigPaths] = await Promise.all([
    import("@tanstack/react-start/plugin/vite"),
    import("@vitejs/plugin-react").then((m) => m.default),
    import("@tailwindcss/vite").then((m) => m.default),
    import("vite-tsconfig-paths").then((m) => m.default),
  ]);

  const plugins = [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    react(),
  ];

  if (env.command === "build") {
    const { nitro } = await import("nitro/vite");
    // Node output for Passenger / any Node host. Override with NITRO_PRESET.
    plugins.push(
      nitro({
        preset: process.env['NITRO_PRESET'] || "node-server",
        output: { dir: "dist", serverDir: "dist/server", publicDir: "dist/client" },
      }) as never,
    );
  }

  return {
    plugins: plugins as never,
    server: { host: "::", port: 8080 },
  };
}

export default async function config(env: ConfigEnv): Promise<UserConfig> {
  return hasLovableWrapper() ? lovableConfig(env) : standaloneConfig(env);
}
