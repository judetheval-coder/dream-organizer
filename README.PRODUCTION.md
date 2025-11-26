# Production Checklist & Automations

This guide helps you finish setup for launching Dream Machine with a custom domain.

1. Purchase domain: `lucidlaboratories.net` (or your chosen domain).
2. Add domain to Vercel project settings (Settings > Domains).
3. Add DNS records as instructed by Vercel to point to Vercel.
4. Update environment variables in Vercel for production (Settings > Environment Variables):
   - NEXT_PUBLIC_APP_URL=https://lucidlaboratories.net
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   - CLERK_SECRET_KEY=sk_live_...
   - NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase>.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   - SUPABASE_SERVICE_KEY=sbp_...
   - STRIPE_SECRET_KEY=sk_live_...
   - STRIPE_WEBHOOK_SECRET=whsec_...
   - NEXT_PUBLIC_POSTHOG_KEY=ph_...
   - NEXT_PUBLIC_SENTRY_DSN=https://...
   - OPENAI_API_KEY=sk-...

5. Clerk setup:
   - In Clerk Dashboard, add `lucidlaboratories.net` as an allowed domain.
   - Add relevant redirect URLs in Clerk (if needed).

6. Stripe setup:
   - Add `https://lucidlaboratories.net/dashboard?tab=Subscription&success=true` and `https://lucidlaboratories.net/dashboard?tab=Subscription&canceled=true` to allowed redirect URLs.
   - Add your webhook endpoint in Stripe to `https://lucidlaboratories.net/api/webhooks/stripe` and set the `STRIPE_WEBHOOK_SECRET` in Vercel.

7. Supabase setup:
   - Ensure RLS policies allow your app's service role to perform required operations.
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and keys match the project.

## Automated scripts

- `scripts/set-vercel-envs.sh` — run `./scripts/set-vercel-envs.sh <project-name>` after setting environment variables in shell. Requires `vercel` CLI and login.

### Deploy with Vercel CLI

If you prefer to deploy from your machine (for example, to test a production deploy), install the Vercel CLI and run:

```bash
npx vercel login
npx vercel --prod
```

You can also use the CLI to add environment variables (see `scripts/set-vercel-envs.sh`) or to inspect your project settings.

### GitHub Actions - Production Deploy

We added a `deploy.yml` workflow that deploys to Vercel after the `CI` workflow completes successfully. The action uses the following GitHub secrets (set in the GitHub repo Settings > Secrets):

- `VERCEL_TOKEN` - Personal access token from Vercel
- `VERCEL_ORG_ID` - Vercel organization id
- `VERCEL_PROJECT_ID` - Vercel project id

Set these secrets and the `deploy.yml` workflow will deploy main to production automatically when CI passes.

## Sentry

- Add `NEXT_PUBLIC_SENTRY_DSN` (client) and `SENTRY_AUTH_TOKEN` to Vercel.
- Configure Sentry releases to upload sourcemaps: `sentry-cli releases new` + `sentry-cli releases files <release> upload-sourcemaps .next`.

## PostHog

- Set `NEXT_PUBLIC_POSTHOG_KEY` environment variable.

## Cypress

- E2E tests are included in `cypress/e2e`. Run them locally with:

```bash
npx cypress open
# or
npx cypress run
```

## 8. Post-deployment QA:
   - Test signup/login via Clerk
   - Test create dream → panel generation (AI) flow
   - Test checkout flow (Stripe) with live keys
   - Test webhook handling (Stripe webhooks) and subscription sync
   - Test analytics tracking and Sentry error reporting

9. Legal & marketing checklist:
   - Update privacy policy and terms (domain-specific contact email updated)
   - Add social images or OG images
   - Add email capture launch page

10. Go live and monitor: monitor Sentry and analytics, react to any issues.

Good luck! If you want, I can help with any steps that require code changes or configuration updates.