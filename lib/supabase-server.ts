import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Lazy load the client
let supabaseAdmin: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = getSupabaseAdmin()
  }
  return supabaseAdmin
}

// Sync Clerk user to Supabase
export async function syncUserToSupabase(userId: string, email: string) {
  const admin = getClient()
  
  const { error } = await admin
    .from('users')
    .upsert({
      id: userId,
      email: email,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })

  if (error) {
    console.error('Error syncing user to Supabase:', error)
    throw error
  }
}
