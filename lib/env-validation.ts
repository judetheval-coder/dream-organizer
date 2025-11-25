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

  // Check optional vars
  OPTIONAL_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  })

  // Report errors
  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:')
    missing.forEach((v) => console.error(`   - ${v}`))
    console.error('📄 Copy .env.example to .env.local and fill in the values')
    
    // Only throw in production or when explicitly checking
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing env vars: ${missing.join(', ')}`)
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
