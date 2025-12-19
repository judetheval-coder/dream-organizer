import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Support both naming conventions for the service role key
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    })
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

export function getClient(): SupabaseClient {
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

// Process a referral when a new user signs up
export async function processReferral(newUserId: string, referralCode: string): Promise<{ success: boolean }> {
  try {
    const admin = getClient()

    // Find the referrer by their referral code
    const { data: referrer, error: findError } = await admin
      .from('referrals')
      .select('user_id')
      .eq('code', referralCode)
      .single()

    if (findError || !referrer) {
      console.log('Referral code not found:', referralCode)
      return { success: false }
    }

    // Don't allow self-referrals
    if (referrer.user_id === newUserId) {
      return { success: false }
    }

    // Check if this user was already referred
    const { data: existing } = await admin
      .from('referral_signups')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single()

    if (existing) {
      return { success: false } // Already referred
    }

    // Record the referral signup
    const { error: insertError } = await admin
      .from('referral_signups')
      .insert({
        referrer_id: referrer.user_id,
        referred_user_id: newUserId,
        referral_code: referralCode,
      })

    if (insertError) {
      console.error('Error recording referral:', insertError)
      return { success: false }
    }

    // Update referral stats (increment successful referrals count)
    // First get current count, then increment
    const { data: referralData } = await admin
      .from('referrals')
      .select('successful_referrals')
      .eq('code', referralCode)
      .single()

    if (referralData) {
      await admin
        .from('referrals')
        .update({
          successful_referrals: (referralData.successful_referrals || 0) + 1
        })
        .eq('code', referralCode)
    }

    return { success: true }
  } catch (error) {
    console.error('Error processing referral:', error)
    return { success: false }
  }
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
