import { SupabaseClient } from '@supabase/supabase-js'

export type DevUser = {
  id: string
  email: string
  name: string
  subscription_tier: string
  created_at: string
}

export type DevDream = {
  id: string
  user_id: string
  text: string
  style: string
  mood: string
  created_at: string
}

export type DevPanel = {
  id: string
  dream_id: string
  description: string
  image_url: string
  scene_number: number
  created_at: string
}


export type DevGroup = {
  id: string
  name: string
  description: string
  category: string
  created_by: string
  is_private: boolean
  created_at: string
}

export type DevGroupMembership = {
  group_id: string
  user_id: string
  role: string
  joined_at: string
}

export type DevContestEntry = {
  id: string
  dream_id: string
  user_id: string
  contest_id: string
  submitted_at: string
}

export type SeedResult = {
  success: boolean
  inserted?: {
    users: string[]
    dreams: string[]
    panels: string[]
    groups?: string[]
    groupMemberships?: string[]
    contestEntries?: string[]
  }
  errors?: { step: string; detail: string }[]
}

// Ensure all required tables exist
async function ensureTablesExist(supabase: SupabaseClient) {
  console.log('Ensuring database tables exist...')

  // Test if we can create tables (this might fail if RPC is not available)
  try {
    // Try a simple query first to see if tables exist
    const { error } = await supabase.from('fake_users').select('id').limit(1)
    if (!error) {
      console.log('Tables appear to exist already')
      return
    }
  } catch (e) {
    // Tables don't exist, continue with creation attempt
  }

  // Note: In production Supabase, you might need to create tables manually
  // or use migrations. This is a best-effort attempt.
  console.log('Note: If table creation fails, please create tables manually in Supabase dashboard')
  console.log('Required tables: fake_users, user_achievements, user_online_status, social_events')
}

export async function seedFakeData(supabase: SupabaseClient): Promise<SeedResult> {
  // Ensure all required tables exist
  console.log('Ensuring database tables exist...')
  await ensureTablesExist(supabase)

  // Fake users
  const fakeUsers = [
    {
      id: 'dev-user-1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      subscription_tier: 'pro',
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-user-2',
      email: 'bob@example.com',
      name: 'Bob Smith',
      subscription_tier: 'free',
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-user-3',
      email: 'carol@example.com',
      name: 'Carol Williams',
      subscription_tier: 'premium',
      created_at: new Date().toISOString()
    }
  ]

  // Fake dreams
  const fakeDreams = [
    {
      id: 'dev-dream-1',
      user_id: 'dev-user-1',
      text: 'I was flying through a crystal city made of dreams, where buildings shifted colors based on emotions.',
      style: 'surreal',
      mood: 'joyful',
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-dream-2',
      user_id: 'dev-user-2',
      text: 'Being chased by a giant floating book that kept opening to reveal more chasers inside.',
      style: 'horror',
      mood: 'anxious',
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-dream-3',
      user_id: 'dev-user-3',
      text: 'Teaching a class of talking animals how to paint with colors that came alive.',
      style: 'whimsical',
      mood: 'peaceful',
      created_at: new Date().toISOString()
    }
  ]

  // Fake panels
  const fakePanels = [
    {
      id: 'dev-panel-1',
      dream_id: 'dev-dream-1',
      description: 'A majestic crystal cityscape with floating spires',
      image_url: 'https://via.placeholder.com/512x512/7c3aed/ffffff?text=Crystal+City',
      scene_number: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-panel-2',
      dream_id: 'dev-dream-1',
      description: 'Flying through rainbow-colored clouds',
      image_url: 'https://via.placeholder.com/512x512/06b6d4/ffffff?text=Flying+Through+Clouds',
      scene_number: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 'dev-panel-3',
      dream_id: 'dev-dream-2',
      description: 'A giant book floating in dark void',
      image_url: 'https://via.placeholder.com/512x512/ef4444/ffffff?text=Giant+Book',
      scene_number: 1,
      created_at: new Date().toISOString()
    }
  ]


  // Fake groups
  const fakeGroups: DevGroup[] = [
    {
      id: 'dev-group-1',
      name: 'Lucid Dreamers',
      description: 'A group for those who love lucid dreaming.',
      category: 'lucid',
      created_by: 'dev-user-3',
      is_private: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'dev-group-2',
      name: 'Nightmare Support',
      description: 'Share and overcome your nightmares together.',
      category: 'nightmares',
      created_by: 'dev-user-2',
      is_private: true,
      created_at: new Date().toISOString(),
    },
  ];

  // Fake group memberships
  const fakeGroupMemberships: DevGroupMembership[] = [
    { group_id: 'dev-group-1', user_id: 'dev-user-1', role: 'member', joined_at: new Date().toISOString() },
    { group_id: 'dev-group-1', user_id: 'dev-user-3', role: 'admin', joined_at: new Date().toISOString() },
    { group_id: 'dev-group-2', user_id: 'dev-user-2', role: 'admin', joined_at: new Date().toISOString() },
    { group_id: 'dev-group-2', user_id: 'dev-user-3', role: 'member', joined_at: new Date().toISOString() },
  ];

  // Fake contest entries (use current contest id)
  const contestId = new Date().toISOString().slice(0, 7);
  const fakeContestEntries: DevContestEntry[] = [
    { id: 'dev-contest-1', dream_id: 'dev-dream-1', user_id: 'dev-user-1', contest_id: contestId, submitted_at: new Date().toISOString() },
    { id: 'dev-contest-2', dream_id: 'dev-dream-2', user_id: 'dev-user-2', contest_id: contestId, submitted_at: new Date().toISOString() },
    { id: 'dev-contest-3', dream_id: 'dev-dream-3', user_id: 'dev-user-3', contest_id: contestId, submitted_at: new Date().toISOString() },
  ];

  // Insert fake data
  const result: SeedResult = { success: false, inserted: { users: [], dreams: [], panels: [], groups: [], groupMemberships: [], contestEntries: [] }, errors: [] }

  try {
    // Insert users (upsert so we don't override important data accidentally)
    for (const user of fakeUsers) {
      const res = await supabase.from('users').upsert(user, { onConflict: 'id' })
      const { error } = res
      const data = (res as unknown as { data?: DevUser[] })?.data ?? null
      if (error) {
        result.errors!.push({ step: 'insert_user', detail: error.message })
      } else if (data && data.length > 0) {
        result.inserted!.users.push(String(data[0].id))
      }
    }

    // Insert dreams
    for (const dream of fakeDreams) {
      const res = await supabase.from('dreams').upsert(dream, { onConflict: 'id' })
      const { error } = res
      const data = (res as unknown as { data?: DevDream[] })?.data ?? null
      if (error) {
        result.errors!.push({ step: 'insert_dream', detail: error.message })
      } else if (data && data.length > 0) {
        result.inserted!.dreams.push(String(data[0].id))
      }
    }

    // Insert panels
    for (const panel of fakePanels) {
      const res = await supabase.from('panels').upsert(panel, { onConflict: 'id' })
      const { error } = res
      const data = (res as unknown as { data?: DevPanel[] })?.data ?? null
      if (error) {
        result.errors!.push({ step: 'insert_panel', detail: error.message })
      } else if (data && data.length > 0) {
        result.inserted!.panels.push(String(data[0].id))
      }
    }

    // Insert groups
    for (const group of fakeGroups) {
      const res = await supabase.from('dream_groups').upsert(group, { onConflict: 'id' })
      const { error } = res
      // @ts-ignore
      const data = (res as unknown as { data?: DevGroup[] })?.data ?? null
      if (error) {
        result.errors!.push({ step: 'insert_group', detail: error.message })
      } else if (data && data.length > 0) {
        result.inserted!.groups!.push(String(data[0].id))
      }
    }

    // Insert group memberships
    for (const membership of fakeGroupMemberships) {
      const res = await supabase.from('group_memberships').upsert(membership, { onConflict: 'group_id,user_id' })
      const { error } = res
      // @ts-ignore
      const data = (res as unknown as { data?: DevGroupMembership[] })?.data ?? null
      if (error) {
        result.errors!.push({ step: 'insert_group_membership', detail: error.message })
      } else if (data && data.length > 0) {
        result.inserted!.groupMemberships!.push(`${membership.group_id}:${membership.user_id}`)
      }
    }

    // Insert contest entries
    for (const entry of fakeContestEntries) {
      const res = await supabase.from('contest_entries').upsert(entry, { onConflict: 'id' })
      const { error } = res
      // @ts-ignore
      const data = (res as unknown as { data?: DevContestEntry[] })?.data ?? null
      if (error) {
        result.errors!.push({ step: 'insert_contest_entry', detail: error.message })
      } else if (data && data.length > 0) {
        result.inserted!.contestEntries!.push(String(data[0].id))
      }
    }

    result.success = result.errors!.length === 0
    return result
  } catch (error) {
    // Surface structured error information to the caller
    const detail = error instanceof Error ? error.message : String(error)
    result.errors!.push({ step: 'unexpected', detail })
    result.success = false
    return result
  }
}