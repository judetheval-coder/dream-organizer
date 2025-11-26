import { SupabaseClient } from '@supabase/supabase-js'

export async function seedFakeData(supabase: SupabaseClient) {
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

  // Insert fake data
  try {
    // Insert users
    for (const user of fakeUsers) {
      const { error } = await supabase.from('users').upsert(user, { onConflict: 'id' })
      if (error) console.error('Error inserting user:', error)
    }

    // Insert dreams
    for (const dream of fakeDreams) {
      const { error } = await supabase.from('dreams').upsert(dream, { onConflict: 'id' })
      if (error) console.error('Error inserting dream:', error)
    }

    // Insert panels
    for (const panel of fakePanels) {
      const { error } = await supabase.from('panels').upsert(panel, { onConflict: 'id' })
      if (error) console.error('Error inserting panel:', error)
    }

    console.log('Fake data seeded successfully!')
  } catch (error) {
    console.error('Error seeding fake data:', error)
    throw error
  }
}