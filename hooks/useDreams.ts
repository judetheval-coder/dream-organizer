'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  supabase,
  getUserDreams,
  createDream,
  createPanels,
  updatePanelImage,
  deleteDream,
  type DreamWithPanels,
  type Panel,
} from '@/lib/supabase'
import { uploadImageFromDataURL, deleteDreamImages } from '@/lib/supabase-storage'
import type { SubscriptionTier } from '@/lib/subscription-tiers'

type PanelInput = {
  description: string
  scene_number: number
  image_url?: string
}

interface SaveDreamInput {
  text: string
  style: string
  mood: string
  panels: PanelInput[]
}

interface UseDreamsResult {
  dreams: DreamWithPanels[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  userTier: SubscriptionTier
  refreshDreams: () => Promise<void>
  saveDream: (dreamData: SaveDreamInput) => Promise<DreamWithPanels>
  updatePanel: (panelId: string, imageDataURL: string, dreamId: string, sceneNumber: number) => Promise<string>
  removeDream: (dreamId: string) => Promise<void>
  loadMoreDreams: () => Promise<void>
}

export function useDreams(): UseDreamsResult {
  const { user } = useUser()
  const [dreams, setDreams] = useState<DreamWithPanels[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<SubscriptionTier>('free')
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const PAGE_SIZE = 10

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

  const fetchDreams = async (reset = false) => {
    if (!user) {
      setLoading(false)
      return
    }
        
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const { dreams: fetchedDreams, nextCursor: newCursor } = await getUserDreams(user.id, {
        limit: PAGE_SIZE,
        cursor: reset ? undefined : cursor ?? undefined,
      })

      setDreams(prev => (reset ? fetchedDreams : [...prev, ...fetchedDreams]))
      setCursor(newCursor || null)
      setHasMore(Boolean(newCursor))

      // Fetch user tier on reset only
      if (reset) {
        const { data: userData } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single()
        
        if (userData) {
          setUserTier(userData.subscription_tier as SubscriptionTier)
        }
      }

      setError(null)
    } catch (err) {
      console.error('Error loading dreams:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dreams')
    } finally {
      if (reset) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  // Load dreams and user tier from Supabase
  useEffect(() => {
    fetchDreams(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const loadMoreDreams = async () => {
    if (!hasMore || loadingMore) return
    await fetchDreams(false)
  }

  const refreshDreams = async () => {
    await fetchDreams(true)
  }

  const saveDream = async (dreamData: SaveDreamInput) => {
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
      setDreams(prev => [newDream, ...prev])

      return newDream
    } catch (err) {
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
      setDreams(prev => prev.map(dream => ({
        ...dream,
        panels: dream.panels?.map((panel: Panel) =>
          panel.id === panelId ? { ...panel, image_url: publicUrl } : panel
        ),
      })))
      
      return publicUrl
    } catch (err) {
      console.error('Error updating panel:', err)
      throw err
    }
  }

  const removeDream = async (dreamId: string) => {
    if (!user) throw new Error('Not authenticated')

    try {
      // Delete images from storage first
      await deleteDreamImages(user.id, dreamId)
      
      // Then delete dream from database
      await deleteDream(dreamId, user.id)
        setDreams(prev => prev.filter(d => d.id !== dreamId))
    } catch (err) {
      console.error('Error deleting dream:', err)
      throw err
    }
  }

  return {
    dreams,
    loading,
    loadingMore,
    hasMore,
    error,
    userTier,
    refreshDreams,
    saveDream,
    updatePanel,
    removeDream,
    loadMoreDreams,
  }
}

