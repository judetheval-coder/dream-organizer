'use client'

import { Suspense, useMemo, useState, useEffect } from 'react'
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
import { useDreams } from '@/hooks/useDreams'
import { useToast } from '@/contexts/ToastContext'
import { canCreateDream, getTierName, getTierFeatures, SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import type { DreamRecord } from '@/components/dashboard/DreamList'
import type { DreamWithPanels, Panel } from '@/lib/supabase'

const TAB_QUERY_KEY = 'tab'
const DEFAULT_TAB: DashboardTab = DASHBOARD_TABS[0].key

type LocalPanel = {
  id: number
  description: string
  style: string
  mood: string
  image?: string
}

type DreamWithOptionalDate = DreamWithPanels & { date?: string | null }

function DashboardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabKeySet = useMemo(() => new Set(DASHBOARD_TABS.map(({ key }) => key)), [])
  const { user, isLoaded } = useUser()
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


  const [dreamText, setDreamText] = useState('')
  const [style, setStyle] = useState('Anime')
  const [mood, setMood] = useState('Dreamy')
  const [panels, setPanels] = useState<LocalPanel[]>([])
  const [enhancing, setEnhancing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }
    return !window.localStorage.getItem('has-visited')
  })
  const [lastCreatedDreamId, setLastCreatedDreamId] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const hasDreams = dreams.length > 0

  const currentTab = useMemo(() => {
    const tabParam = searchParams.get(TAB_QUERY_KEY)
    if (tabParam && tabKeySet.has(tabParam as DashboardTab)) {
      return tabParam as DashboardTab
    }
    return DEFAULT_TAB
  }, [searchParams, tabKeySet])

  const updateTabInUrl = (tab: DashboardTab) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(TAB_QUERY_KEY, tab)
    router.replace(`/dashboard?${params.toString()}`, { scroll: false })
  }

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

  const generateSceneDescriptions = (text: string) => {
    // Smart scene splitting - only split on natural scene breaks
    const trimmed = text.trim()
    const maxPanels = SUBSCRIPTION_TIERS[userTier].limits.panelsPerDream

    // Scene break indicators (in order of priority)
    const sceneBreakPatterns = [
      /\n\n+/g,                           // Double line breaks
      /(?:then |suddenly |next |later |after that |meanwhile )/gi, // Transition words
      /(?:I (?:woke up|found myself|realized|noticed|saw) )/gi,   // POV shifts
    ]

    // First try to split on explicit breaks (double newlines)
    let scenes = trimmed.split(/\n\n+/).map(s => s.trim()).filter(s => s.length > 20)

    // If no natural breaks, check word count to decide
    if (scenes.length <= 1) {
      const wordCount = trimmed.split(/\s+/).length

      // Short dreams (under 80 words) = 1 panel
      // Medium dreams (80-200 words) = 2 panels
      // Long dreams (200+ words) = up to maxPanels
      if (wordCount < 80) {
        return [trimmed]
      } else if (wordCount < 200) {
        // Try to find a natural midpoint using transition words
        const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]
        if (sentences.length >= 2) {
          const mid = Math.ceil(sentences.length / 2)
          return [
            sentences.slice(0, mid).join(' ').trim(),
            sentences.slice(mid).join(' ').trim()
          ]
        }
        return [trimmed]
      } else {
        // Long dream - split into 3-4 panels based on sentences
        const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed]
        const targetPanels = Math.min(Math.ceil(wordCount / 75), maxPanels)
        const perPanel = Math.ceil(sentences.length / targetPanels)

        scenes = []
        for (let i = 0; i < sentences.length; i += perPanel) {
          const chunk = sentences.slice(i, i + perPanel).join(' ').trim()
          if (chunk) scenes.push(chunk)
        }
      }
    }

    return scenes.slice(0, maxPanels)
  }

  const handleCreate = async () => {
    if (!dreamText.trim() || !user) return

    if (!canCreateDream(userTier, dreams.length)) {
      setShowUpgrade(true)
      return
    }

    const currentDreamText = dreamText
    const currentStyle = style
    const currentMood = mood
    const sceneDescriptions = generateSceneDescriptions(dreamText)

    const newPanels = Array.from({ length: sceneDescriptions.length }, (_, i) => ({
      id: Date.now() + i,
      description: `${sceneDescriptions[i]} - Scene ${i + 1}`,
      style,
      mood,
      image: '',
    }))

    setPanels(newPanels)
    setCurrentGeneratingIndex(0)
    setDreamText('')
    setShowCreateModal(false)
    updateTabInUrl('Comics')

    try {
      const createdDream = await saveDream({
        text: currentDreamText,
        style: currentStyle,
        mood: currentMood,
        panels: newPanels.map((p, i) => ({
          description: p.description,
          scene_number: i,
          image_url: undefined,
        })),
      })
      setLastCreatedDreamId(createdDream.id)
      showToast('Dream created! Generating panels...', 'success')
      analytics.events.dreamCreated({ style: currentStyle, mood: currentMood, panelCount: newPanels.length })
    } catch (err) {
      console.error('Error saving dream:', err)
      showToast('Failed to create dream', 'error')
    }
  }

  const handlePanelImageReady = async (panelId: number, imageUrl: string) => {
    const updatedPanels = panels.map(panel => (panel.id === panelId ? { ...panel, image: imageUrl } : panel))
    setPanels(updatedPanels)

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

    if (currentGeneratingIndex < panels.length - 1) {
      setCurrentGeneratingIndex(currentGeneratingIndex + 1)
    }
  }

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

              {!!panels.length && (
                <section aria-label="Current generation">
                  <PanelShowcase
                    panels={panels}
                    currentGeneratingIndex={currentGeneratingIndex}
                    onImageReady={handlePanelImageReady}
                  />
                </section>
              )}

              {!panels.length && !hasDreams && (
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
              {!!panels.length && (
                <PanelShowcase
                  panels={panels}
                  currentGeneratingIndex={currentGeneratingIndex}
                  onImageReady={handlePanelImageReady}
                />
              )}
              {!panels.length && !dreamsWithPanels.length && (
                <Card>
                  <EmptyState
                    icon="📚"
                    title="No comic panels yet"
                    description="Generate a new dream on the Dashboard to fill this gallery."
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


        </div>

        <Footer />
      </DashboardLayout>

      <DreamCreationModal
        isOpen={showCreateModal}
        dreamText={dreamText}
        styleValue={style}
        moodValue={mood}
        enhancing={enhancing}
        onClose={() => setShowCreateModal(false)}
        onDreamTextChange={setDreamText}
        onStyleChange={setStyle}
        onMoodChange={setMood}
        onEnhance={handleEnhance}
        onCreate={handleCreate}
      />

      {showUpgrade && (
        <UpgradePrompt
          currentTier={userTier}
          onClose={() => setShowUpgrade(false)}
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









