# Dream Organizer — Copilot instructions

Purpose: concise guidance for AI coding agents to be productive in this repo (quick starts, architecture, conventions, and where to make safe changes).

Quick start (dev):
- Run the combined startup: `powershell -ExecutionPolicy Bypass -File start-servers.ps1` (or use the VS Code task **Start Dream Organizer**). This starts Next.js (port 3000) and the local Stable Diffusion server (port 3001) in the Python venv `sd_env`.
- Alternatively: `npm run dev` (frontend) + `sd_env\Scripts\Activate.ps1` then `python sd_server.py` (backend). Use `npm run check-env` to verify required env vars.

Core architecture (high level):
- Frontend: `app/` (Next.js 16 app router, pages are server/client components). Key hooks: `hooks/useDreams.ts` handles dream state and generation flows.
- API surface: `app/api/*/route.ts` (server routes). Examples: `app/api/generate-image/route.ts` (OpenAI image flow), `app/api/analyze-dream` (prompt splitting), `app/api/sync-user`.
- Image generation: local Python SD server `sd_server.py` (endpoints: `GET /api/sd-status`, `POST /api/sd-generate`) or OpenAI-based routes. `SD_MODEL_ID` env var selects model (default `nitrosocke/Arcane-Diffusion`).

### Key Data Flow (compact)
- UI (Dream Editor) → `app/api/analyze-dream` (prompt splitting) → `app/api/generate-image` (per-panel generation) → image stored in Supabase + panel saved in `panels` table → UI updates via `useDreams`.

Developer workflows & common commands
- Start everything: `start-servers.ps1` or VS Code task **Start Dream Organizer** (starts Next.js and Python SD server in `sd_env`).
- Servers individually: `npm run dev` (frontend), `sd_env\Scripts\Activate.ps1` then `python sd_server.py` (backend).
- Validate env: `npm run check-env`.
- Tests: `npm test` (Jest); e2e: `npm run cypress:open` or `npm run cypress:run`.
- Lint: `npm run lint`.

Stable Diffusion server (exact)
- Health: `GET http://localhost:3001/api/sd-status` → { ready: boolean, progress, model }
- Generate: `POST http://localhost:3001/api/sd-generate` JSON body: `{ "prompt": "...", "steps": 25, "guidance_scale": 8.0, "width":512, "height":512 }` → returns base64 image data.
- Notes: SD_MODEL_ID env var overrides model; startup can take minutes; OOM fallback reduces size/steps.

Where to change things (examples)
- DB columns/queries: `lib/supabase.ts` and add a SQL migration (see `supabase-schema.sql`).
- Generation flows & rate limits: `app/api/generate-image/route.ts` and `lib/rate-limiter.ts` (preserve rate-limit headers and abuse blocks).
- UI/state: `hooks/useDreams.ts` for orchestration and optimistic updates.
- Upload/storage: `lib/supabase-storage.ts` (how images are stored & URLs are built).

Conventions & important rules
- Keep business logic in hooks/APIs (not in UI components). Use `useDreams` as the default integration point.
- Always include `user_id` in Supabase queries (RLS enforced).
- Use PascalCase for components and descriptive hook names (e.g., `useDreams`).
- Avoid breaking RLS, rate-limiter, or Sentry error patterns when adding routes.

Debugging & pitfalls
- SD: check `sd_server.py` stdout; model load errors and OOM fallbacks are logged.
- API: `app/api/*` routes use Clerk auth (`auth()`) and should return proper NextResponse JSON with status codes.
- External limits: OpenAI 429s and Supabase upload size constraints (keep images under ~5MB when possible).

If you want, I can add a short FAQ with actionable fixes (e.g., "what to change when prompts produce low-quality images"), or drop in a few code snippets for rate-limiter or migration examples — which would be most helpful?
