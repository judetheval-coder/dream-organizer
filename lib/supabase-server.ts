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
export async function syncUserToSupabase(userId: string, email: string): Promise<{ demoCreated?: boolean } | void> {
  const admin = getClient()
  
  // Check if user exists already
  const { data: existingUser } = await admin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

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

  // If the user is newly created and demo onboarding is enabled, create a sample dream
  const demoCreated = false
  if (!existingUser && process.env.ENABLE_DEMO_DREAM) {
    try {
      const demoText = process.env.DEMO_DREAM_TEXT || 'I was on a mountaintop that felt like the inside of a crystal.'
      const { data: dreamData, error: dreamError } = await admin
        .from('dreams')
        .insert({ user_id: userId, text: demoText, style: 'Fantasy', mood: 'Dreamy' })
        .select()
        .single()

      if (dreamError) {
        console.error('Error creating demo dream:', dreamError)
      } else if (dreamData) {
        // Create a couple of example panels
        const panels = [
          { dream_id: dreamData.id, description: 'A crystal mountain under the moon', style: 'Watercolor', mood: 'Ethereal', scene_number: 0 },
          { dream_id: dreamData.id, description: 'A small, glowing doorway', style: 'Watercolor', mood: 'Ethereal', scene_number: 1 },
        ]
        const { error: panelError } = await admin.from('panels').insert(panels)
        if (panelError) console.error('Error creating demo panels:', panelError)
      }
    } catch (e) {
      console.error('Failed to create demo onboarding content:', e)
    }
  }
  return demoCreated ? { demoCreated: true } : undefined
}
 
// Fetch a published dream (for public page rendering)
export async function getPublicDreamById(dreamId: string) {
  const admin = getClient()

  const { data, error } = await admin
    .from('published_dreams')
    .select(`
      *,
      dreams (
        id,
        text,
        style,
        mood,
        created_at,
        panels (id, description, image_url)
      ),
      users (id, email)
    `)
    .eq('dream_id', dreamId)
    .limit(1)
    .single()

  if (error) {
    console.error('getPublicDreamById error:', error)
    return null
  }

  return data
}
