#!/bin/bash
# Helper script to set Vercel environment variables using Vercel CLI
# Requires Vercel CLI and you must be logged in (vercel login)

if [ -z "$1" ]; then
  echo "Usage: ./set-vercel-envs.sh <VERCEL_PROJECT_NAME>"
  exit 1
fi
PROJECT=$1

echo "Setting environment variables for project: $PROJECT"

# Add or update vars
vercel env add NEXT_PUBLIC_APP_URL "$NEXT_PUBLIC_APP_URL" production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" production
vercel env add CLERK_SECRET_KEY "$CLERK_SECRET_KEY" production
vercel env add NEXT_PUBLIC_SUPABASE_URL "$NEXT_PUBLIC_SUPABASE_URL" production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$NEXT_PUBLIC_SUPABASE_ANON_KEY" production
vercel env add SUPABASE_SERVICE_KEY "$SUPABASE_SERVICE_KEY" production
vercel env add STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY" production
vercel env add STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET" production
vercel env add NEXT_PUBLIC_POSTHOG_KEY "$NEXT_PUBLIC_POSTHOG_KEY" production
vercel env add NEXT_PUBLIC_SENTRY_DSN "$NEXT_PUBLIC_SENTRY_DSN" production
vercel env add OPENAI_API_KEY "$OPENAI_API_KEY" production

echo "Environment variables added. Remember to set other preview/staging as needed."
