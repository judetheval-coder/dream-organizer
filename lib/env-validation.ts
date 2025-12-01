/**
 * Environment variable validation
 * Run on app startup to catch missing configuration early
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
]

const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_SENTRY_DSN',
  'SD_SERVER_URL',
  'SD_MODEL_ID',
  'REPLICATE_API_TOKEN',
    'SUPPORT_EMAIL',
]

let validated = false

export function validateEnvironment() {
  if (validated) {
    return
  }
  const missing: string[] = []
  const warnings: string[] = []

  // Check required vars
  REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  })

  // Additional required variables for production
  const extraRequired = ['NEXT_PUBLIC_APP_URL', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
  extraRequired.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  })

  // Validate NEXT_PUBLIC_APP_URL formatting
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl) {
    try {
      // will throw if invalid
      new URL(appUrl)
    } catch {
      missing.push('NEXT_PUBLIC_APP_URL (invalid URL)')
    }
  }

  // Check optional vars
  OPTIONAL_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  })

  // Ensure optional demo onboarding flag exists (recommended)
  if (!process.env.ENABLE_DEMO_DREAM) {
    warnings.push('ENABLE_DEMO_DREAM')
  }

  // Report errors
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:')
    missing.forEach((v) => console.error(`   - ${v}`))
    console.error('📄 Copy .env.example to .env.local and fill in the values')

    // In hosted environments like Vercel, avoid hard failing builds by default.
    // Set STRICT_ENV=true to enforce throwing on missing envs.
    const shouldThrow = process.env.STRICT_ENV === 'true'
    if (shouldThrow) {
      throw new Error(`Missing env vars: ${missing.join(', ')}`)
    } else {
      console.warn('Proceeding without throwing due to STRICT_ENV not enabled. This may limit functionality in production.')
    }
  }

  // Warn about optional
  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:')
    warnings.forEach((v) => console.warn(`   - ${v}`))
  }

  // All environment variables validated
  validated = true
}
