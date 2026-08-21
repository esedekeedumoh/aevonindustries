/**
 * Phusion Passenger startup file (cPanel "Setup Node.js App").
 *
 * The production build (`npm run build`) emits a Nitro node-server bundle at
 * dist/server/index.mjs. It is ESM, so it is loaded with a dynamic import.
 * Passenger provides the port through process.env.PORT.
 */
import("./dist/server/index.mjs").catch((error) => {
  console.error("[aevon] Failed to start server:", error);
  process.exit(1);
});
