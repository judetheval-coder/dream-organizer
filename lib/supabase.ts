import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Dream = {
  id: string
  user_id: string
  text: string
  style: string
  mood: string
  created_at: string
}

export type Panel = {
  id: string
  dream_id: string
  description: string
  image_url: string | null
  scene_number: number
  created_at: string
}

// Helper functions
export async function getUserDreams(userId: string) {
  const { data, error } = await supabase
    .from('dreams')
    .select(`
      *,
      panels (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createDream(userId: string, dreamData: {
  text: string
  style: string
  mood: string
}) {
  const { data, error } = await supabase
    .from('dreams')
    .insert([{
      user_id: userId,
      text: dreamData.text,
      style: dreamData.style,
      mood: dreamData.mood
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createPanels(dreamId: string, panels: Array<{
  description: string
  scene_number: number
  image_url?: string
}>) {
  const { data, error } = await supabase
    .from('panels')
    .insert(
      panels.map(p => ({
        dream_id: dreamId,
        description: p.description,
        scene_number: p.scene_number,
        image_url: p.image_url || null
      }))
    )
    .select()

  if (error) throw error
  return data
}

export async function updatePanelImage(panelId: string, imageUrl: string) {
  const { error } = await supabase
    .from('panels')
    .update({ image_url: imageUrl })
    .eq('id', panelId)

  if (error) throw error
}

export async function deleteDream(dreamId: string, userId: string) {
  const { error } = await supabase
    .from('dreams')
    .delete()
    .eq('id', dreamId)
    .eq('user_id', userId)

  if (error) throw error
}
