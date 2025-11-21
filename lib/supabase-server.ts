import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Sync Clerk user to Supabase
export async function syncUserToSupabase(userId: string, email: string) {
  const { error } = await supabaseAdmin
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
