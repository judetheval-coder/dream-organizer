import '@testing-library/jest-dom'

// Provide default env vars for tests to avoid requiring real services
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:9999'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anonkey'

// Provide a default global fetch mock for tests
global.fetch = global.fetch || (jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({}), text: async () => '' })) as any)
