# Deploying Aevon Industries

The app is a TanStack Start (SSR) site. The server build target is chosen with the
`NITRO_PRESET` environment variable, so the same codebase deploys to Netlify and Vercel.

## Required environment variables (both hosts)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_PROJECT_ID=...
```

Add any server-only secrets (e.g. service role key, API keys) in the host's
dashboard as well — never commit them.

## Netlify

Configured in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist/client`
- `NITRO_PRESET=netlify`

Just connect the repo; no extra settings needed.

## Vercel

Configured in `vercel.json`:

- Build command: `NITRO_PRESET=vercel npm run build`
- Framework preset: none (do not let Vercel auto-detect Vite)
- No `outputDirectory`: the build emits Build Output API v3 into `.vercel/output`,
  which Vercel picks up automatically. Setting an output directory (even
  `.vercel/output`) makes Vercel look for a nested folder and the build fails with
  "No Output Directory named 'output' found". Leave Project Settings → Output
  Directory empty as well.

Connect the repo, add the env vars, deploy.

## Local production check

```
NITRO_PRESET=vercel npm run build    # or netlify
```
