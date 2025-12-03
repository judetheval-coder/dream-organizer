'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
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
import { analyzeDreams as gptAnalyzeDreams } from '@/lib/gpt-helpers'
import type { SubscriptionTier } from '@/lib/subscription-tiers'

// Simple in-memory cache
const CACHE_TTL = 60 * 1000 // 1 minute
const dreamCache = new Map<string, { data: DreamWithPanels[]; timestamp: number; cursor: string | null }>()

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
  userSynced: boolean
  refreshDreams: () => Promise<void>
  saveDream: (dreamData: SaveDreamInput) => Promise<DreamWithPanels>
  updatePanel: (panelId: string, imageDataURL: string, dreamId: string, sceneNumber: number) => Promise<string>
  removeDream: (dreamId: string) => Promise<void>
  loadMoreDreams: () => Promise<void>
  demoCreated: boolean
  insights: string | null
  analyzing: boolean
  analyzeDreams: (force?: boolean) => Promise<void>
  analysisError: string | null
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
  const [demoCreated, setDemoCreated] = useState(false)
  const [userSynced, setUserSynced] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const fetchIdRef = useRef(0) // Prevent race conditions

  const PAGE_SIZE = 10

  // Check cache validity
  const getCachedDreams = useCallback((userId: string) => {
    const cached = dreamCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached
    }
    return null
  }, [])

  // Update cache
  const updateCache = useCallback((userId: string, data: DreamWithPanels[], newCursor: string | null) => {
    dreamCache.set(userId, { data, timestamp: Date.now(), cursor: newCursor })
  }, [])

  // Invalidate cache
  const invalidateCache = useCallback((userId: string) => {
    dreamCache.delete(userId)
  }, [])

  // Sync user to Supabase on first load
  useEffect(() => {
    async function syncUser() {
      if (user) {
        try {
          const res = await fetch('/api/sync-user', { method: 'POST' })
          try {
            const json = await res.json()
            if (json?.demoCreated) {
              setDemoCreated(true)
            }
          } catch {
            // Not JSON or no demo flag; ignore
          }
          setUserSynced(true)
        } catch (err) {
          console.error('Error syncing user:', err)
          // Still mark as synced so user can attempt to use the app
          setUserSynced(true)
        }
      }
    }
    syncUser()
  }, [user])

  const fetchDreams = async (reset = false, skipCache = false) => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchId = ++fetchIdRef.current

    try {
      // Check cache on initial load
      if (reset && !skipCache) {
        const cached = getCachedDreams(user.id)
        if (cached) {
          setDreams(cached.data)
          setCursor(cached.cursor)
          setHasMore(Boolean(cached.cursor))
          setLoading(false)
          return
        }
      }

      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const { dreams: fetchedDreams, nextCursor: newCursor } = await getUserDreams(user.id, {
        limit: PAGE_SIZE,
        cursor: reset ? undefined : cursor ?? undefined,
      })

      // Prevent race conditions
      if (fetchId !== fetchIdRef.current) return

      const newDreams = reset ? fetchedDreams : [...dreams, ...fetchedDreams]
      setDreams(newDreams)
      setCursor(newCursor || null)
      setHasMore(Boolean(newCursor))

      // Update cache on reset
      if (reset) {
        updateCache(user.id, fetchedDreams, newCursor || null)
      }

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
    await fetchDreams(false, true) // Skip cache for pagination
  }

  const refreshDreams = async () => {
    if (user) invalidateCache(user.id)
    await fetchDreams(true, true) // Skip cache on manual refresh
  }

  const saveDream = async (dreamData: SaveDreamInput) => {
    if (!user) {
      console.error('[saveDream] No authenticated user')
      throw new Error('Not authenticated')
    }

    if (!userSynced) {
      console.log('[saveDream] Waiting for user sync...')
      // Wait briefly for sync to complete
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('[saveDream] Starting save for user:', user.id, 'Data:', {
      textLength: dreamData.text.length,
      style: dreamData.style,
      mood: dreamData.mood,
      panelCount: dreamData.panels.length
    })

    try {
      // Create dream
      console.log('[saveDream] Creating dream record...')
      const dream = await createDream(user.id, {
        text: dreamData.text,
        style: dreamData.style,
        mood: dreamData.mood
      })
      console.log('[saveDream] Dream created with ID:', dream.id)

      // Create panels
      console.log('[saveDream] Creating', dreamData.panels.length, 'panels...')
      const panels = await createPanels(dream.id, dreamData.panels)
      console.log('[saveDream] Panels created:', panels.length)

      // Update local state and invalidate cache
      const newDream = { ...dream, panels }
      setDreams(prev => [newDream, ...prev])
      invalidateCache(user.id)

      console.log('[saveDream] Success! Dream saved and state updated')
      return newDream
    } catch (err) {
      console.error('[saveDream] Error saving dream:', err)
      console.error('[saveDream] Error details:', JSON.stringify(err, null, 2))
      throw err
    }
  }

  const analyzeDreams = async (force: boolean = false) => {
    if (!dreams.length) return
    if (analyzing && !force) return

    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const analysisPayload = dreams.map(dream => {
        const panelDescriptions = dream.panels?.map(panel => panel.description).filter(Boolean) ?? []
        const description = panelDescriptions.length ? panelDescriptions.join(' ') : dream.text || 'Untitled dream'
        return {
          description,
          text: dream.text ?? '',
          date: dream.created_at ?? undefined,
        }
      })

      const result = await gptAnalyzeDreams(analysisPayload, false)
      setInsights(result)
    } catch (err) {
      console.error('Analysis failed:', err)
      setAnalysisError('Please try again in a moment.')
    }
    setAnalyzing(false)
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
      invalidateCache(user.id)
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
    userSynced,
    refreshDreams,
    saveDream,
    updatePanel,
    removeDream,
    loadMoreDreams,
    demoCreated,
    insights,
    analyzing,
    analyzeDreams,
    analysisError,
  }
}

