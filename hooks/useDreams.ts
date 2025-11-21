'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase, getUserDreams, createDream, createPanels, updatePanelImage, deleteDream } from '@/lib/supabase'
import { uploadImageFromDataURL, deleteDreamImages } from '@/lib/supabase-storage'
import type { SubscriptionTier } from '@/lib/subscription-tiers'

export function useDreams() {
  const { user } = useUser()
  const [dreams, setDreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<SubscriptionTier>('free')

  // Sync user to Supabase on first load
  useEffect(() => {
    async function syncUser() {
      if (user) {
        try {
          await fetch('/api/sync-user', { method: 'POST' })
        } catch (err) {
          console.error('Error syncing user:', err)
        }
      }
    }
    syncUser()
  }, [user])

  // Load dreams and user tier from Supabase
  useEffect(() => {
    async function loadDreams() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await getUserDreams(user.id)
        setDreams(data || [])
        
        // Fetch user tier
        const { data: userData } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        
        if (userData) {
          setUserTier(userData.subscription_tier as SubscriptionTier)
        }
        
        setError(null)
      } catch (err: any) {
        console.error('Error loading dreams:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDreams()
  }, [user])

  const saveDream = async (dreamData: {
    text: string
    style: string
    mood: string
    panels: Array<{
      description: string
      scene_number: number
      image_url?: string
    }>
  }) => {
    if (!user) throw new Error('Not authenticated')

    try {
      // Create dream
      const dream = await createDream(user.id, {
        text: dreamData.text,
        style: dreamData.style,
        mood: dreamData.mood
      })

      // Create panels
      const panels = await createPanels(dream.id, dreamData.panels)

      // Update local state
      const newDream = { ...dream, panels }
      setDreams([newDream, ...dreams])

      return newDream
    } catch (err: any) {
      console.error('Error saving dream:', err)
      throw err
    }
  }

  const updatePanel = async (panelId: string, imageDataURL: string, dreamId: string, sceneNumber: number) => {
    if (!user) throw new Error('Not authenticated')
    
    try {
      // Upload image to Supabase Storage
      const publicUrl = await uploadImageFromDataURL(imageDataURL, user.id, dreamId, sceneNumber)
      
      // Update panel with public URL
      await updatePanelImage(panelId, publicUrl)

      // Update local state
      setDreams(dreams.map(dream => ({
        ...dream,
        panels: dream.panels?.map((panel: any) =>
          panel.id === panelId ? { ...panel, image_url: publicUrl } : panel
        )
      })))
      
      return publicUrl
    } catch (err: any) {
      console.error('Error updating panel:', err)
      throw err
    }
  }\n\n  const removeDream = async (dreamId: string) => {
    if (!user) throw new Error('Not authenticated')

    try {
      // Delete images from storage first
      await deleteDreamImages(user.id, dreamId)
      
      // Then delete dream from database
      await deleteDream(dreamId, user.id)
      setDreams(dreams.filter(d => d.id !== dreamId))
    } catch (err: any) {
      console.error('Error deleting dream:', err)
      throw err
    }
  }

  return {
    dreams,
    loading,
    error,
    userTier,
    saveDream,
    updatePanel,
    removeDream
  }
}

