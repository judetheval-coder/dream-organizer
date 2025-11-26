#!/usr/bin/env node
const required = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
]

const missing = required.filter(k => !process.env[k])

if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '))
  process.exit(1)
}

console.log('All required environment variables are present.')