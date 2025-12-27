'use client'

import { Suspense, useMemo, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { analytics } from '@/lib/analytics'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { colors, gradients } from '@/lib/design'
import { enhanceDreamStory, analyzeDreams } from '@/lib/gpt-helpers'
import WelcomeScreen from '@/components/WelcomeScreen'
import Footer from '@/components/Footer'
import UpgradePrompt from '@/components/UpgradePrompt'
import { DreamCreationModal } from '@/components/sections/DreamCreationModal'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DASHBOARD_TABS, type DashboardTab } from '@/components/sections/DashboardSidebar'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { ActionBar } from '@/components/dashboard/ActionBar'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { PanelShowcase } from '@/components/dashboard/PanelShowcase'
import { ComicPageShowcase } from '@/components/dashboard/ComicPageShowcase'
import { DreamList } from '@/components/dashboard/DreamList'
import { DreamPanelsGallery } from '@/components/dashboard/DreamPanelsGallery'
import { InsightsPreview } from '@/components/dashboard/InsightsPreview'
import Card from '@/components/ui/Card'
import ErrorBanner from '@/components/ui/ErrorBanner'
import EmptyState from '@/components/EmptyState'
import DreamDictionary from '@/components/DreamDictionary'
import GlobalPatterns from '@/components/GlobalPatterns'
import PublicGallery from '@/components/PublicGallery'
import DreamGroups from '@/components/DreamGroups'
import GiftSubscriptions from '@/components/GiftSubscriptions'
import EventsContest from '@/components/EventsContest'
import ReferralSystem from '@/components/ReferralSystem'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'
import { OnboardingTour, useOnboardingTour } from '@/components/OnboardingTour'
import { useDreams } from '@/hooks/useDreams'
import { useToast } from '@/contexts/ToastContext'
import { canCreateDream, getTierName, getTierFeatures, SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import type { DreamRecord } from '@/components/dashboard/DreamList'
import type { DreamWithPanels, Panel } from '@/lib/supabase'

// ============================================
// LEADERBOARD SECTION
// ============================================
interface LeaderboardUser {
  user_id: string
  dream_count: number
  total_likes: number
  total_shares: number
  total_views: number
}

function LeaderboardSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`)
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }
    if (rank === 2) return { emoji: '🥈', bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)' }
    if (rank === 3) return { emoji: '🥉', bg: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)' }
    return { emoji: `#${rank}`, bg: colors.surface }
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex justify-center gap-3">
        {(['all', 'month', 'week'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className="px-5 py-2 rounded-lg font-semibold transition-all hover:scale-105"
            style={{
              background: timeframe === period
                ? `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`
                : colors.surface,
              color: timeframe === period ? 'white' : colors.textSecondary,
              border: `1px solid ${colors.border}`
            }}
          >
            {period === 'all' ? '🏆 All Time' : period === 'month' ? '📅 This Month' : '📆 This Week'}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-4xl mb-3">⏳</div>
            <p style={{ color: colors.textMuted }}>Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Be the First!
            </h3>
            <p style={{ color: colors.textMuted }}>Create dreams to appear on the leaderboard</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {leaderboard.map((user, index) => {
              const rank = getRankDisplay(index + 1)
              return (
                <div
                  key={user.user_id}
                  className="p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  {/* Rank Badge */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{
                      background: typeof rank.bg === 'string' && rank.bg.includes('gradient') ? rank.bg : rank.bg,
                      color: index < 3 ? '#000' : colors.textPrimary
                    }}
                  >
                    {rank.emoji}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: colors.textPrimary }}>
                      Dreamer {user.user_id.substring(0, 8)}...
                    </div>
                    <div className="text-sm" style={{ color: colors.textMuted }}>
                      {user.dream_count} dreams created
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: colors.pink }}>
                        {user.total_likes || 0}
                      </div>
                      <div style={{ color: colors.textMuted }}>❤️ Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: colors.cyan }}>
                        {user.total_views || 0}
                      </div>
                      <div style={{ color: colors.textMuted }}>👁️ Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: colors.purple }}>
                        {user.total_shares || 0}
                      </div>
                      <div style={{ color: colors.textMuted }}>🔗 Shares</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

// ============================================
// MAIN DASHBOARD
// ============================================

const TAB_QUERY_KEY = 'tab'
const DEFAULT_TAB: DashboardTab = DASHBOARD_TABS[0].key

type LocalPanel = {
  id: number
  description: string
  style: string
  mood: string
  image?: string
}

type ComicPageState = {
  scenes: string[]
  image: string
  isGenerating: boolean
  dreamId: string | null
}

type DreamWithOptionalDate = DreamWithPanels & { date?: string | null }

function DashboardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabKeySet = useMemo(() => new Set(DASHBOARD_TABS.map(({ key }) => key)), [])
  const { user, isLoaded } = useUser()
  const isAdmin = user?.publicMetadata?.role === 'admin'
  const {
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
    demoCreated,
  } = useDreams()
  const { showToast } = useToast()
  useEffect(() => {
    // Detect subscription success/cancel after Stripe redirect
    const tab = searchParams.get('tab')
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    if (tab === 'Subscription' && success === 'true') {
      analytics.events.subscriptionUpgraded({ plan: 'unknown', price: 0 })
      showToast('Subscription successful! Thank you.', 'success')
    }
    if (tab === 'Subscription' && canceled === 'true') {
      analytics.track('checkout_canceled', {})
      showToast('Subscription canceled. You were not charged.', 'info')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (isLoaded && user) {
      analytics.identify(user.id, { email: user.emailAddresses?.[0]?.emailAddress, name: user.firstName })
      analytics.track('user_loaded', { userId: user.id })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user])

  useEffect(() => {
    if (demoCreated) {
      showToast("Welcome! We created a demo dream for you — check the dashboard.", 'success')
    }
  }, [demoCreated])

  // Keyboard shortcuts help
  const keyboardHelp = useKeyboardShortcutsHelp()

  // Onboarding tour
  const onboarding = useOnboardingTour()

  // Trigger tour via ?tour=1 (e.g., Sidebar "Start Tour" link)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const tourFlag = searchParams.get('tour')
    if (tourFlag === '1') {
      onboarding.startTour()
      // optional: remove query param so reloading doesn't re-trigger
      // history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams?.toString()])

  // Draft auto-save: Restore from localStorage on init
  const [dreamText, setDreamText] = useState(() => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem('visnoctis-draft-text') || ''
  })
  const [style, setStyle] = useState(() => {
    if (typeof window === 'undefined') return 'Anime'
    return window.localStorage.getItem('visnoctis-draft-style') || 'Anime'
  })
  const [mood, setMood] = useState(() => {
    if (typeof window === 'undefined') return 'Dreamy'
    return window.localStorage.getItem('visnoctis-draft-mood') || 'Dreamy'
  })
  const [panels, setPanels] = useState<LocalPanel[]>([])
  const [enhancing, setEnhancing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [hasDraftRestored, setHasDraftRestored] = useState(false)
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !window.localStorage.getItem('has-visited')
  })
  const [lastCreatedDreamId, setLastCreatedDreamId] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [comicPage, setComicPage] = useState<ComicPageState>({
    scenes: [],
    image: '',
    isGenerating: false,
    dreamId: null
  })

  // Auto-save draft to localStorage whenever dream content changes
  useEffect(() => {
    if (dreamText.trim()) {
      window.localStorage.setItem('visnoctis-draft-text', dreamText)
      window.localStorage.setItem('visnoctis-draft-style', style)
      window.localStorage.setItem('visnoctis-draft-mood', mood)
    }
  }, [dreamText, style, mood])

  // Show notification when draft is restored
  useEffect(() => {
    if (!hasDraftRestored && dreamText.trim()) {
      setHasDraftRestored(true)
      showToast('📝 Draft restored from your last session', 'info')
    }
  }, [hasDraftRestored, dreamText, showToast])

  // Clear draft after successful creation
  const clearDraft = () => {
    window.localStorage.removeItem('visnoctis-draft-text')
    window.localStorage.removeItem('visnoctis-draft-style')
    window.localStorage.removeItem('visnoctis-draft-mood')
  }

  const hasDreams = dreams.length > 0

  const currentTab = useMemo(() => {
    const tabParam = searchParams.get(TAB_QUERY_KEY)
    if (tabParam && tabKeySet.has(tabParam as DashboardTab)) {
      return tabParam as DashboardTab
    }
    return DEFAULT_TAB
  }, [searchParams, tabKeySet])

  const updateTabInUrl = useCallback((tab: DashboardTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(TAB_QUERY_KEY, tab)
    router.replace(`/dashboard?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

  const handleTabChange = (tab: DashboardTab) => {
    if (tab === currentTab) return
    updateTabInUrl(tab)
  }

  const getDreamTimestamp = (dream: DreamWithOptionalDate) => dream?.created_at || dream?.date || null

  const normalizedDreamsForList: DreamRecord[] = useMemo(
    () =>
      dreams.map(dream => ({
        id: dream.id,
        text: dream.text,
        created_at: dream.created_at,
        date: (dream as { date?: string }).date,
        style: dream.style,
        mood: dream.mood,
        panels: dream.panels?.map(panel => ({
          id: panel.id,
          image_url: panel.image_url ?? undefined,
        })),
      })),
    [dreams]
  )

  const dreamsWithPanels = useMemo(
    () =>
      dreams
        .filter(
          (dream): dream is DreamWithPanels & { panels: Panel[] } => Array.isArray(dream.panels) && dream.panels.length > 0
        )
        .map(dream => ({
          id: dream.id,
          text: dream.text,
          panels: dream.panels.map(panel => ({
            id: panel.id,
            image_url: panel.image_url,
            description: panel.description,
          })),
          created_at: dream.created_at,
          date: (dream as { date?: string }).date,
        })),
    [dreams]
  )

  const stats = useMemo(() => {
    const totalPanels = dreams.reduce((acc, dream) => acc + (dream.panels?.length || 0), 0)
    const activeScenes = currentGeneratingIndex >= 0 ? panels.length - currentGeneratingIndex : 0
    const tierLimit = SUBSCRIPTION_TIERS[userTier]?.limits?.dreamsPerMonth ?? 0

    return [
      { id: 'total', label: 'Total Dreams', value: dreams.length, icon: '💭', caption: 'All time' },
      { id: 'panels', label: 'Panels Generated', value: totalPanels, icon: '🎨', caption: 'Gallery' },
      { id: 'active', label: 'Scenes In Queue', value: Math.max(activeScenes, 0), icon: '⚡️', caption: 'Live' },
      { id: 'limit', label: 'Monthly Limit', value: tierLimit === -1 ? '∞' : tierLimit, icon: '💎', caption: getTierName(userTier) },
    ]
  }, [dreams, panels, currentGeneratingIndex, userTier])

  const activityItems = useMemo(
    () =>
      dreams.slice(0, 5).map((dream, idx: number) => ({
        id: dream.id || `${idx}`,
        text: dream.text.length > 120 ? `${dream.text.slice(0, 120)}…` : dream.text,
        timestamp: getDreamTimestamp(dream) || new Date().toISOString(),
      })),
    [dreams]
  )

  // Use GPT to intelligently break down dream into cinematic scenes
  const breakdownDreamIntoScenes = async (text: string): Promise<string[]> => {
    const trimmed = text.trim()

    // Fixed at 6 panels for optimal comic page layout and story flow
    // This provides enough scenes for a narrative without overwhelming the viewer
    const maxPanels = 6

    try {
      // Try GPT-powered breakdown for rich scene descriptions
      const response = await fetch('/api/breakdown-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText: trimmed, maxPanels })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.scenes && Array.isArray(data.scenes) && data.scenes.length > 0) {
          return data.scenes
        }
      }
    } catch (error) {
      console.warn('[breakdownDreamIntoScenes] GPT breakdown failed, using fallback:', error)
    }

    // Fallback: simple sentence-based splitting
    return simpleFallbackBreakdown(trimmed, maxPanels)
  }

  // Simple fallback scene breakdown without GPT
  const simpleFallbackBreakdown = (text: string, maxPanels: number): string[] => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const scenes: string[] = []
    const perPanel = Math.max(1, Math.ceil(sentences.length / maxPanels))

    for (let i = 0; i < maxPanels && i * perPanel < sentences.length; i++) {
      const start = i * perPanel
      const end = Math.min(start + perPanel, sentences.length)
      const chunk = sentences.slice(start, end).join(' ').trim()
      if (chunk) {
        scenes.push(chunk)
      }
    }

    // Ensure minimum 4 panels
    while (scenes.length < 4) {
      scenes.push(scenes[scenes.length - 1] || text.slice(0, 200))
    }

    return scenes
  }

  const handleCreate = async () => {
    if (!dreamText.trim() || !user) {
      return
    }

    if (!canCreateDream(userTier, dreams.length, isAdmin)) {
      setShowUpgrade(true)
      return
    }

    const currentDreamText = dreamText
    const currentStyle = 'Comic'
    const currentMood = 'Dynamic'

    // Show loading state while GPT breaks down the dream
    setComicPage({
      scenes: [],
      image: '',
      isGenerating: true,
      dreamId: null
    })
    setDreamText('')
    clearDraft()
    setShowCreateModal(false)
    showToast('Analyzing your dream for optimal scenes...', 'info')

    // Use GPT to intelligently break down dream into cinematic scenes
    const sceneDescriptions = await breakdownDreamIntoScenes(currentDreamText)

    // Update with the scenes
    setComicPage({
      scenes: sceneDescriptions,
      image: '',
      isGenerating: true,
      dreamId: null
    })

    // Clear old panels state
    setPanels([])
    setCurrentGeneratingIndex(-1)

    try {
      const createdDream = await saveDream({
        text: currentDreamText,
        style: currentStyle,
        mood: currentMood,
        panels: sceneDescriptions.map((scene, i) => ({
          description: scene,
          scene_number: i,
          image_url: undefined,
        })),
      })
      setLastCreatedDreamId(createdDream.id)
      setComicPage(prev => ({ ...prev, dreamId: createdDream.id }))
      showToast(`Creating ${sceneDescriptions.length}-panel comic...`, 'success')
      analytics.events.dreamCreated({ style: currentStyle, mood: currentMood, panelCount: sceneDescriptions.length })
    } catch (err) {
      console.error('Error saving dream:', err)
      showToast('Failed to create dream', 'error')
    }
  }

  const handleComicImagesReady = useCallback(async (images: string[]) => {
    setComicPage(prev => ({
      ...prev,
      image: images[0] || '', // Store first image as reference
      isGenerating: false
    }))

    // Save each panel image to the database
    const targetDreamId = comicPage.dreamId || lastCreatedDreamId || dreams[0]?.id
    const currentDream = dreams.find(dream => dream.id === targetDreamId) || dreams[0]

    if (currentDream?.panels && user) {
      try {
        // Update each panel with its corresponding image
        for (let i = 0; i < images.length; i++) {
          const panel = currentDream.panels[i]
          if (panel && images[i]) {
            await updatePanel(panel.id, images[i], currentDream.id, i)
          }
        }
        showToast('✨ Comic page generated!', 'success')
        updateTabInUrl('My Dreams')
        refreshDreams()
      } catch (err) {
        console.error('Error saving comic panels:', err)
      }
    } else {
      showToast('✨ Comic page generated!', 'success')
    }
  }, [comicPage.dreamId, lastCreatedDreamId, dreams, user, updatePanel, showToast, refreshDreams, updateTabInUrl])

  const handlePanelImageReady = useCallback(async (panelId: number, imageUrl: string) => {
    setPanels(prevPanels => prevPanels.map(panel =>
      panel.id === panelId ? { ...panel, image: imageUrl } : panel
    ))

    const targetDreamId = lastCreatedDreamId || dreams[0]?.id
    const currentDream = dreams.find(dream => dream.id === targetDreamId) || dreams[0]

    if (currentDream?.panels && user) {
      const panelIndex = panels.findIndex(panel => panel.id === panelId)
      const supabasePanel = currentDream.panels.find(panel => panel.scene_number === panelIndex)

      if (supabasePanel) {
        try {
          await updatePanel(supabasePanel.id, imageUrl, currentDream.id, panelIndex)
          analytics.events.panelGenerated({ style: currentDream?.style ?? 'unknown', sceneNumber: panelIndex })
        } catch (err) {
          console.error('Error updating panel image:', err)
        }
      }
    }

    // Check if this is the last panel
    setCurrentGeneratingIndex(prevIndex => {
      const isLastPanel = prevIndex >= panels.length - 1
      if (isLastPanel) {
        // All panels generated - switch to My Dreams tab and show success
        updateTabInUrl('My Dreams')
        showToast('✨ Dream complete! All panels generated.', 'success')
        refreshDreams()
        return -1
      }
      return prevIndex + 1
    })
  }, [dreams, lastCreatedDreamId, panels, refreshDreams, showToast, updatePanel, user])

  const handlePanelReorder = useCallback(async (reorderedPanels: LocalPanel[]) => {
    // Update local state immediately
    setPanels(reorderedPanels)

    // Persist to database
    const targetDreamId = lastCreatedDreamId || dreams[0]?.id
    if (targetDreamId) {
      try {
        const panelOrder = reorderedPanels.map((panel, index) => ({
          id: panel.id,
          sceneNumber: index
        }))

        const res = await fetch('/api/panels/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dreamId: targetDreamId, panels: panelOrder })
        })

        if (!res.ok) {
          console.error('Failed to persist panel order')
        }
      } catch (err) {
        console.error('Error reordering panels:', err)
      }
    }
  }, [lastCreatedDreamId, dreams])

  const handleEnhance = async () => {
    if (!dreamText.trim()) return
    setEnhancing(true)
    try {
      const enhanced = await enhanceDreamStory(dreamText)
      setDreamText(enhanced)
    } catch (err) {
      console.error('Enhancement failed:', err)
    }
    setEnhancing(false)
  }

  const handleAnalyze = async () => {
    if (!dreams.length) return
    setAnalyzing(true)
    setAnalysisError(null)
    try {
      const analysisPayload = dreams.map(dream => {
        const panelDescriptions = dream.panels?.map(panel => panel.description).filter(Boolean) ?? []
        const description = panelDescriptions.length ? panelDescriptions.join(' ') : dream.text || 'Untitled dream'

        return {
          description,
          text: dream.text ?? '',
          date: getDreamTimestamp(dream) ?? undefined,
        }
      })

      const result = await analyzeDreams(analysisPayload, false)
      setInsights(result)
    } catch (err) {
      console.error('Analysis failed:', err)
      setAnalysisError('Please try again in a moment.')
    }
    setAnalyzing(false)
  }

  if (showWelcome) {
    return (
      <div style={{ background: gradients.page }} className="min-h-screen">
        <WelcomeScreen
          onGetStarted={() => {
            localStorage.setItem('has-visited', 'true')
            setShowWelcome(false)
            // Begin the interactive tour after the welcome flow
            onboarding.startTour()
          }}
        />
      </div>
    )
  }

  return (
    <>
      <DashboardLayout currentTab={currentTab} onTabChange={handleTabChange}>
        {error && (
          <ErrorBanner title="We couldn't load your dreams" onRetry={refreshDreams}>
            {error}
          </ErrorBanner>
        )}

        <div key={currentTab} className="animate-fadeInUp">
          {currentTab === 'Dashboard' && (
            <>
              <section aria-labelledby="stats-heading" className="space-y-6">
                <h3 id="stats-heading" className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Overview
                </h3>
                <StatsOverview stats={stats} loading={loading} />
                <ActionBar
                  onCreate={() => setShowCreateModal(true)}
                  onAnalyze={handleAnalyze}
                  disableAnalysis={!hasDreams || analyzing}
                  analyzing={analyzing}
                  onShowShortcuts={keyboardHelp.open}
                  onStartTour={onboarding.startTour}
                />
              </section>

              <section className="grid gap-6 lg:grid-cols-[2fr,1fr]" aria-label="Activity and Insights">
                <ActivityFeed items={activityItems} loading={loading} />
                <InsightsPreview
                  insights={insights}
                  analyzing={analyzing}
                  onAnalyze={handleAnalyze}
                  hasDreams={hasDreams}
                  error={analysisError}
                />
              </section>

              {comicPage.scenes.length > 0 && (
                <section aria-label="Current comic generation">
                  <ComicPageShowcase
                    scenes={comicPage.scenes}
                    onImagesReady={handleComicImagesReady}
                    dreamId={comicPage.dreamId || undefined}
                    isGenerating={comicPage.isGenerating}
                  />
                </section>
              )}

              {comicPage.scenes.length === 0 && !hasDreams && (
                <Card>
                  <EmptyState
                    icon="💤"
                    title="Ready for your first dream?"
                    description="Use the New Dream button to start your first comic."
                    action={{ label: 'Create dream', onClick: () => setShowCreateModal(true) }}
                  />
                </Card>
              )}
            </>
          )}

          {currentTab === 'My Dreams' && (
            <DreamList
              dreams={normalizedDreamsForList}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMoreDreams}
              onRemove={async (dreamId) => {
                try {
                  await removeDream(dreamId)
                  showToast('Dream deleted successfully', 'success')
                } catch (err) {
                  console.error('Error deleting dream:', err)
                  showToast('Failed to delete dream', 'error')
                }
              }}
            />
          )}

          {currentTab === 'Comics' && (
            <div className="space-y-8">
              {comicPage.scenes.length > 0 && (
                <ComicPageShowcase
                  scenes={comicPage.scenes}
                  onImagesReady={handleComicImagesReady}
                  dreamId={comicPage.dreamId || undefined}
                  isGenerating={comicPage.isGenerating}
                />
              )}
              {comicPage.scenes.length === 0 && !dreamsWithPanels.length && (
                <Card>
                  <EmptyState
                    icon="📚"
                    title="No comic pages yet"
                    description="Generate a new dream on the Dashboard to create your first Marvel-style comic."
                    action={{ label: 'Start a dream', onClick: () => setShowCreateModal(true) }}
                  />
                </Card>
              )}
              <DreamPanelsGallery dreams={dreamsWithPanels} />
            </div>
          )}

          {currentTab === 'Insights' && (
            <InsightsPreview
              insights={insights}
              analyzing={analyzing}
              onAnalyze={handleAnalyze}
              hasDreams={hasDreams}
              error={analysisError}
            />
          )}

          {currentTab === 'Subscription' && isLoaded && (
            <div className="max-w-6xl w-full space-y-8">
              <div
                className="rounded-xl p-8"
                style={{
                  background: colors.surface,
                  border: `2px solid ${colors.cyan}`,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div
                    className="rounded-xl p-8 relative transition-all duration-300"
                    style={{
                      background: colors.backgroundDark,
                      border: `1px solid ${colors.surface}`,
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 px-4 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold tracking-wider"
                      style={{
                        background: colors.cyan,
                        color: colors.background,
                      }}
                    >
                      CURRENT
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: colors.textMuted }}>
                      Starter
                    </p>
                    <p className="text-4xl font-black mb-2" style={{ color: colors.purple }}>
                      {getTierName(userTier)}
                    </p>
                    <p className="text-xl font-bold mb-6" style={{ color: colors.cyan }}>
                      {SUBSCRIPTION_TIERS[userTier].price === 0 ? 'Free' : `$${SUBSCRIPTION_TIERS[userTier].price.toFixed(2)}`}<span className="text-sm font-normal text-gray-400">/mo</span>
                    </p>
                    <div className="space-y-4">
                      {getTierFeatures(userTier).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="rounded-full p-1" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                            <span style={{ color: colors.cyan, fontSize: '12px' }}>✓</span>
                          </div>
                          <span style={{ color: colors.textMuted }} className="text-sm font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {userTier !== 'pro' && (
                    <div
                      className="rounded-xl p-8 relative transform scale-105 z-10 transition-all duration-300"
                      style={{
                        background: `linear-gradient(145deg, ${colors.backgroundDark}, #2a1b3d)`,
                        border: `2px solid ${colors.purple}`,
                        boxShadow: `0 0 30px rgba(139, 92, 246, 0.2)`,
                      }}
                    >
                      <div
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-1 rounded-full text-xs font-bold tracking-wider animate-pulse shadow-lg"
                        style={{
                          background: colors.purple,
                          color: 'white',
                        }}
                      >
                        MOST POPULAR
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: colors.purple }}>
                        Professional
                      </p>
                      <p className="text-4xl font-black mb-2 text-white">
                        Pro
                      </p>
                      <p className="text-xl font-bold mb-6" style={{ color: colors.cyan }}>
                        $9.99<span className="text-sm font-normal text-gray-400">/mo</span>
                      </p>
                      <div className="space-y-4 mb-8">
                        {getTierFeatures('pro').map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="rounded-full p-1" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
                              <span style={{ color: colors.purple, fontSize: '12px' }}>✓</span>
                            </div>
                            <span style={{ color: 'white' }} className="text-sm font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowUpgrade(true)}
                        className="w-full py-3 rounded-xl font-bold transition-all hover:brightness-110 shadow-lg"
                        style={{
                          background: gradients.button,
                          color: colors.white,
                        }}
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  )}

                  {userTier !== 'premium' && (
                    <div
                      className="rounded-xl p-8 relative transition-all duration-300"
                      style={{
                        background: colors.backgroundDark,
                        border: `1px solid ${colors.cyan}`,
                      }}
                    >
                      <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: colors.cyan }}>
                        Ultimate
                      </p>
                      <p className="text-4xl font-black mb-2" style={{ color: colors.cyan }}>
                        Premium
                      </p>
                      <p className="text-xl font-bold mb-6" style={{ color: colors.cyan }}>
                        $19.99<span className="text-sm font-normal text-gray-400">/mo</span>
                      </p>
                      <div className="space-y-4 mb-8">
                        {getTierFeatures('premium').map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="rounded-full p-1" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                              <span style={{ color: colors.cyan, fontSize: '12px' }}>✓</span>
                            </div>
                            <span style={{ color: colors.textMuted }} className="text-sm font-medium">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowUpgrade(true)}
                        className="w-full py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
                        style={{
                          background: colors.cyan,
                          color: colors.background,
                        }}
                      >
                        Get Premium
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* GiftSubscriptions moved here */}
              <div className="mt-8">
                <GiftSubscriptions />
              </div>
            </div>
          )}

          {currentTab === 'Settings' && isLoaded && (
            <div className="max-w-4xl w-full space-y-6">
              <div
                className="rounded-xl p-8"
                style={{
                  background: colors.surface,
                  border: `2px solid ${colors.purple}`,
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    Account
                  </h2>
                  <SignOutButton>
                    <button
                      className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                      style={{
                        background: '#dc2626',
                        color: 'white',
                      }}
                    >
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                      Email Address
                    </p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>
                      {user?.emailAddresses[0]?.emailAddress || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                      Name
                    </p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>
                      {user?.firstName || 'User'} {user?.lastName || ''}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                      Member Since
                    </p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: colors.textMuted }}>
                      Total Dreams
                    </p>
                    <p className="text-lg" style={{ color: colors.textPrimary }}>
                      {dreams.length}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-8"
                style={{
                  background: colors.surface,
                  border: `2px solid ${colors.purple}`,
                }}
              >
                <h2 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                  Preferences
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
                      Theme
                    </label>
                    <div
                      className="p-3 rounded-lg flex items-center justify-between"
                      style={{
                        background: colors.backgroundDark,
                        color: colors.textMuted,
                      }}
                    >
                      <span>Dark Purple & Cyan (Fixed)</span>
                      <span className="text-xs px-2 py-1 rounded bg-purple-900 text-purple-200">Active</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
                      Default AI Style
                    </label>
                    <select
                      className="w-full p-3 rounded-lg"
                      style={{
                        background: colors.backgroundDark,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.surface}`,
                      }}
                      defaultValue="Anime"
                    >
                      <option>Anime</option>
                      <option>Watercolor</option>
                      <option>Oil Painting</option>
                      <option>Abstract</option>
                      <option>Realistic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-4" style={{ color: colors.textPrimary }}>
                      Notifications
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: colors.backgroundDark }}>
                        <span style={{ color: colors.textMuted }}>Weekly Dream Digest</span>
                        <div className="w-10 h-6 rounded-full relative cursor-pointer transition-colors" style={{ background: colors.purple }}>
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: colors.backgroundDark }}>
                        <span style={{ color: colors.textMuted }}>New Feature Updates</span>
                        <div className="w-10 h-6 rounded-full relative cursor-pointer transition-colors" style={{ background: colors.purple }}>
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-4" style={{ color: colors.textPrimary }}>
                      Data & Privacy
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: colors.backgroundDark }}>
                        <span style={{ color: colors.textMuted }}>Public Profile Visibility</span>
                        <div className="w-10 h-6 rounded-full relative cursor-pointer transition-colors" style={{ background: '#374151' }}>
                          <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (dreams.length === 0) {
                            showToast('No dreams to export', 'info')
                            return
                          }
                          const exportData = {
                            exportedAt: new Date().toISOString(),
                            totalCount: dreams.length,
                            dreams: dreams.map(d => ({
                              id: d.id,
                              text: d.text,
                              style: d.style,
                              mood: d.mood,
                              createdAt: d.created_at,
                              panels: d.panels?.map(p => ({ description: p.description, imageUrl: p.image_url })) || []
                            }))
                          }
                          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'dream-organizer-export.json'
                          a.click()
                          URL.revokeObjectURL(url)
                          showToast('Dream data exported!', 'success')
                        }}
                        className="w-full p-3 rounded-lg text-left transition-colors hover:bg-opacity-80"
                        style={{
                          background: colors.backgroundDark,
                          color: colors.cyan,
                        }}
                      >
                        📥 Download My Data (JSON)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-8"
                style={{
                  background: colors.surface,
                  border: `2px solid #dc2626`,
                }}
              >
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#dc2626' }}>
                  Danger Zone
                </h2>

                <button
                  onClick={() => {
                    localStorage.clear()
                    setPanels([])
                    setLastCreatedDreamId(null)
                  }}
                  className="px-4 py-2 rounded-lg font-semibold cursor-pointer hover:scale-105 transition-all"
                  style={{
                    background: '#dc2626',
                    color: 'white',
                    border: `1px solid #dc2626`,
                  }}
                >
                  Clear All Data
                </button>
              </div>
            </div>
          )}

          {currentTab === 'Dictionary' && (
            <DreamDictionary
              dreamText={dreams.length > 0 ? dreams[0].text : ''}
            />
          )}

          {currentTab === 'Patterns' && (
            <GlobalPatterns
              userDreams={dreams.map(d => d.text)}
            />
          )}

          {currentTab === 'Gallery' && (
            <PublicGallery />
          )}

          {currentTab === 'Groups' && (
            <DreamGroups />
          )}

          {currentTab === 'Events' && (
            <EventsContest />
          )}

          {currentTab === 'Leaderboard' && (
            <LeaderboardSection />
          )}

          {currentTab === 'Referrals' && (
            <ReferralSystem />
          )}

          {currentTab === 'Badges' && (
            <BadgeShowcase />
          )}


        </div>

        <Footer />
      </DashboardLayout>

      <DreamCreationModal
        isOpen={showCreateModal}
        dreamText={dreamText}
        enhancing={enhancing}
        onClose={() => setShowCreateModal(false)}
        onDreamTextChange={setDreamText}
        onEnhance={handleEnhance}
        onCreate={handleCreate}
      />

      {showUpgrade && (
        <UpgradePrompt
          currentTier={userTier}
          onClose={() => setShowUpgrade(false)}
        />
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={keyboardHelp.isOpen}
        onClose={keyboardHelp.close}
      />

      {/* Onboarding Tour */}
      {onboarding.showTour && (
        <OnboardingTour
          onComplete={onboarding.completeTour}
          currentStep={onboarding.currentStep}
          onStepChange={onboarding.goToStep}
        />
      )}
    </>
  )
}







export default function DashboardPage() {
  return (
    <Suspense
      fallback={(
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: gradients.page }}
        >
          <span className="text-white/70">Loading dashboard…</span>
        </div>
      )}
    >
      <DashboardPageContent />
    </Suspense>
  )
}









