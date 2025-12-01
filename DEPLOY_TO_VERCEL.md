# Vercel Deployment Checklist for Dream Organizer

This checklist covers required environment variables, recommended build settings, and common gotchas for deploying the Dream Organizer app to Vercel.

## Environment Variables (required)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk Publishable (frontend). Example: pk_test_...
- `CLERK_SECRET_KEY` - Clerk secret key (backend server side).
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public anon key
- `OPENAI_API_KEY` - OpenAI API key for prompt-enhancement features
- `NEXT_PUBLIC_SENTRY_DSN` (optional) - Sentry client DSN

## Optional / Staging Variables
- `SD_SERVER_URL` - If using remote Stable Diffusion server; otherwise, local SD server cannot run on Vercel.
- `SD_MODEL_ID` - Default SD model (if using external/premium generation)
- `NEXT_PUBLIC_VERCEL_ENV` - Overrides or tests in code (not mandatory)

## Build & Output Settings
- Build command: `npm run build`
- Install command: `npm ci` (recommended)
- Output directory: Vercel auto-detects Next.js projects
- Framework Preset: `Next.js` (Vercel auto-detects)
- Node.js version (if you need a specific one): set `engines.node` in `package.json` or configure in Vercel project settings

## Integrations & Worker/Edge Notes
- Python-based Stable Diffusion server must run externally (Vercel doesn't support GPU or long-running Python processes). Use Replicate, a hosted SD endpoint, or configure a cloud server.
- If using SD server locally in dev, set `SD_SERVER_URL` to `http://localhost:3001` for local runs only; in production use hosted endpoints.

## Vercel-specific notes & config

- The repo includes a development proxy in `next.config.js` that forwards `/sd` to your local SD server. This proxy is now automatically only enabled during development if `SD_SERVER_URL` includes `localhost`.
- Avoid setting `SD_SERVER_URL` to `http://localhost:3001` in production — set it to a hosted SD service URL (Replicate or a self-hosted endpoint) instead.
- Prefer using `REPLICATE_API_TOKEN` and the included `app/api/generate-image-replicate` route for hosted SD generation, or `OPENAI_API_KEY` for DALL-E if you want hosted generation without self-hosted SD.

### Quick replication example (recommended for Vercel)

1. Set `REPLICATE_API_TOKEN` in your Vercel project's Environment Variables.
2. Make sure `REPLICATE_API_TOKEN` is present in `.env.local` for local testing (optional).
3. On Vercel, set `NEXT_PUBLIC_APP_URL` to your Vercel project domain (e.g., `https://dream-organizer.vercel.app`).
4. Do not attempt to run the Python SD server on Vercel — instead host it in a cloud VM or use Replicate.


## Security & Secrets
- Use Vercel project settings to store environment variables securely (do not commit to Git).
- Enable required webhooks (e.g. Stripe webhook URL) and configure the server route in `app/api/webhooks/stripe/route.ts`.

## Routing & Edge
- If your `next.config.js` uses custom `experimental.proxy` flags, note that this setting may be invalid in modern Next.js; follow warnings and update to supported `middleware` or `proxy` config as needed.

## Pre-deploy Checklist (manual)
1. Add the above environment variables to the Vercel project settings (Production and Preview as needed).
2. Run `npm ci` and `npm run build` locally to catch any missing build-time env vars or build errors.
3. Confirm that public pages (public dreams) are accessible and protected pages work with Clerk (Clerk will work in production if keys & domains match in Clerk dashboard).
4. Confirm that SD generation is configured — Vercel cannot run GPU-accelerated SD locally, use a hosted/hybrid approach.

## Post-Deploy / Testing
- Run a test login flow using Clerk and verify SSO & RLS access on Supabase (if using RLS policies).
- Generate a demo dream using the public API routes and confirm the SD generation endpoint responds (if using hosted SD).
- Check Sentry (if enabled) and PostHog/analytics for data.


---
For help configuring Vercel or the SD server, I can open `next.config.js` and add recommended Vercel-friendly settings, and propose a config for using Replicate or Hugging Face hosted SD in production.
