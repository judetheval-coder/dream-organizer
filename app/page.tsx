'use client'
import { useState, useEffect } from 'react'
import { colors, gradients, shadows } from '@/lib/design'
import Panel from '@/components/Panel'
import { enhanceDreamStory, analyzeDreams } from '@/lib/gpt-helpers'
import Logo from '@/components/Logo'
import WelcomeScreen from '@/components/WelcomeScreen'
import EmptyState from '@/components/EmptyState'
import Footer from '@/components/Footer'

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState('Dashboard')
  const [dreamText, setDreamText] = useState('')
  const [style, setStyle] = useState('Anime')
  const [mood, setMood] = useState('Dreamy')
  const [panels, setPanels] = useState<any[]>([])
  const [enhancing, setEnhancing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<string | null>(null)
  const [savedDreams, setSavedDreams] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('dream-archives')
    if (saved) setSavedDreams(JSON.parse(saved))
  }, [])

  const stats = {
    totalDreams: savedDreams.length,
    lucidDreams: 0,
    nightmares: 0,
    achievements: 2,
  }

  const generateSceneDescriptions = (dreamText: string) => {
    // Split dream into logical scenes for image generation
    const sentences = dreamText.match(/[^.!?]+[.!?]+/g) || [dreamText]
    const sentencesPerScene = Math.ceil(sentences.length / 4)
    const scenes = []

    for (let i = 0; i < 4; i++) {
      const start = i * sentencesPerScene
      const end = start + sentencesPerScene
      const sceneText = sentences.slice(start, end).join('').trim()
      scenes.push(sceneText || dreamText)
    }

    return scenes
  }

  const handleCreate = () => {
    if (!dreamText.trim()) return

    const sceneDescriptions = generateSceneDescriptions(dreamText)

    const newPanels = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      description: `${sceneDescriptions[i]} - Scene ${i + 1}`,
      style,
      mood,
      image: '',
      generating: false,
    }))

    const dream = { text: dreamText, date: new Date().toISOString(), panels: newPanels }
    const updated = [dream, ...savedDreams]
    setSavedDreams(updated)
    localStorage.setItem('dream-archives', JSON.stringify(updated))
    setPanels(newPanels)
    setCurrentGeneratingIndex(0)
    
    setDreamText('')
    setShowCreateModal(false)
    setCurrentTab('Comics')
  }

  const handlePanelImageReady = (panelId: number, imageUrl: string) => {
    // Update the panel with the generated image
    const updatedPanels = panels.map(p => 
      p.id === panelId ? { ...p, image: imageUrl } : p
    )
    setPanels(updatedPanels)

    // Update savedDreams to persist the image
    const updatedDreams = savedDreams.map(dream => ({
      ...dream,
      panels: dream.panels?.map((p: any) => 
        p.id === panelId ? { ...p, image: imageUrl } : p
      ) || []
    }))
    setSavedDreams(updatedDreams)
    localStorage.setItem('dream-archives', JSON.stringify(updatedDreams))

    // Move to next panel in queue
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
    } catch (error) {
      console.error('Enhancement failed:', error)
    }
    setEnhancing(false)
  }

  const handleAnalyze = async () => {
    if (savedDreams.length === 0) return
    setAnalyzing(true)
    try {
      const result = await analyzeDreams(
        savedDreams.map((d) => d.text),
        false
      )
      setInsights(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      setInsights('Analysis failed. Please try again.')
    }
    setAnalyzing(false)
  }

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('has-visited')
    if (hasVisited) setShowWelcome(false)
  }, [])

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
    <div style={{ background: gradients.page }} className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 h-screen w-64 p-6 overflow-y-auto z-40"
        style={{
          background: colors.backgroundDark,
          borderRight: `1px solid ${colors.surface}`,
        }}
      >
        <div className="mb-8">
          <Logo size="md" />
        </div>

        <nav className="space-y-2">
          <NavItem
            label="Dashboard"
            icon="📊"
            active={currentTab === 'Dashboard'}
            onClick={() => setCurrentTab('Dashboard')}
          />
          <NavItem
            label="My Dreams"
            icon="💭"
            active={currentTab === 'My Dreams'}
            onClick={() => setCurrentTab('My Dreams')}
          />
          <NavItem
            label="Comics"
            icon="🎨"
            active={currentTab === 'Comics'}
            onClick={() => setCurrentTab('Comics')}
          />
          <NavItem
            label="Insights"
            icon="✨"
            active={currentTab === 'Insights'}
            onClick={() => setCurrentTab('Insights')}
          />
          <NavItem
            label="Settings"
            icon="⚙️"
            active={currentTab === 'Settings'}
            onClick={() => setCurrentTab('Settings')}
          />
        </nav>

        <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${colors.surface}` }}>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            v1.0 • Dream Organizer
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {currentTab === 'Dashboard' && '✨ Welcome to Your Dreams'}
            {currentTab === 'My Dreams' && '💭 My Dreams'}
            {currentTab === 'Comics' && '🎨 Comics Gallery'}
            {currentTab === 'Insights' && '✨ Dream Insights'}
            {currentTab === 'Settings' && '⚙️ Settings'}
          </h2>
          <p style={{ color: colors.textMuted }}>
            {currentTab === 'Dashboard' && 'Explore, enhance, and visualize your dream world'}
            {currentTab === 'My Dreams' && 'Browse and manage all your saved dreams'}
            {currentTab === 'Comics' && 'View your generated dream comics'}
            {currentTab === 'Insights' && 'Analyze patterns in your dreams'}
            {currentTab === 'Settings' && 'Customize your experience'}
          </p>
        </div>

        {/* Dashboard Tab */}
        {currentTab === 'Dashboard' && (
          <>
            <div className="grid grid-cols-4 gap-6 mb-12">
              <StatCard
                icon="💭"
                value={stats.totalDreams}
                label="Total Dreams"
                tag="All Time"
              />
              <StatCard
                icon="✨"
                value={stats.lucidDreams}
                label="Lucid Dreams"
                tag="This Week"
              />
              <StatCard
                icon="😨"
                value={stats.nightmares}
                label="Nightmares"
                tag="This Month"
              />
              <StatCard
                icon="🏆"
                value={stats.achievements}
                label="Achievements"
                tag="Unlocked"
              />
            </div>

            <div className="flex gap-4 mb-12">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: gradients.button,
                  boxShadow: shadows.glow,
                  color: colors.white,
                  border: 'none',
                }}
              >
                ✨ New Dream
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || savedDreams.length === 0}
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                style={{
                  background: gradients.card,
                  boxShadow: shadows.sm,
                  color: colors.white,
                  border: 'none',
                }}
              >
                🔍 Analyze Dreams
              </button>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                Recent Activity
              </h3>
              <div
                className="rounded-xl p-6 space-y-3"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.backgroundDark}`,
                }}
              >
                {savedDreams.length === 0 ? (
                  <p style={{ color: colors.textMuted }}>No dreams yet. Create your first one!</p>
                ) : (
                  savedDreams.slice(0, 5).map((dream, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg cursor-pointer transition-all hover:opacity-80"
                      style={{
                        background: colors.backgroundDark,
                        borderLeft: `3px solid ${colors.cyan}`,
                      }}
                    >
                      <p className="text-sm" style={{ color: colors.textPrimary }}>
                        {dream.text.substring(0, 100)}...
                      </p>
                      <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                        {new Date(dream.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {panels.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                  Generated Panels
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {panels.map((panel, idx) => (
                    <Panel 
                      key={panel.id} 
                      {...panel} 
                      generateDelay={0}
                      shouldGenerate={currentGeneratingIndex === idx}
                      onImageReady={(url) => handlePanelImageReady(panel.id, url)}
                    />
                  ))}
                </div>

                {currentGeneratingIndex >= 0 && currentGeneratingIndex < panels.length && (
                  <div className="mt-8 p-4 rounded-lg text-center" style={{ background: colors.surface, border: `1px solid ${colors.cyan}` }}>
                    <p className="text-sm font-semibold" style={{ color: colors.cyan }}>
                      ✨ Currently Generating: Scene {currentGeneratingIndex + 1} of {panels.length}
                    </p>
                    <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                      {panels[currentGeneratingIndex]?.description.replace(/ - Scene \d+$/, '')}
                    </p>
                  </div>
                )}

                {currentGeneratingIndex >= panels.length && panels.every((p: any) => p.image) && (
                  <div className="mt-8 p-4 rounded-lg text-center" style={{ background: colors.surface, border: `1px solid ${colors.cyan}` }}>
                    <p className="text-sm font-semibold" style={{ color: colors.cyan }}>
                      ✅ All Scenes Generated!
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* My Dreams Tab */}
        {currentTab === 'My Dreams' && (
          <div>
            {savedDreams.length === 0 ? (
              <div
                className="rounded-xl p-12 text-center"
                style={{
                  background: colors.surface,
                  border: `2px dashed ${colors.cyan}`,
                }}
              >
                <p className="text-2xl mb-2">💭</p>
                <p style={{ color: colors.textMuted }}>No dreams saved yet. Create your first dream from the Dashboard!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedDreams.map((dream, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-xl"
                    style={{
                      background: colors.surface,
                      border: `2px solid ${colors.purple}`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: colors.textMuted }}>
                          {new Date(dream.date).toLocaleDateString()} at {new Date(dream.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = savedDreams.filter((_, i) => i !== idx)
                          setSavedDreams(updated)
                          localStorage.setItem('dream-archives', JSON.stringify(updated))
                        }}
                        className="px-3 py-1 text-sm rounded-lg transition-all hover:opacity-80"
                        style={{
                          background: colors.backgroundDark,
                          color: '#dc2626',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    <p
                      className="text-base leading-relaxed mb-4 whitespace-pre-wrap"
                      style={{ color: colors.textPrimary }}
                    >
                      {dream.text}
                    </p>
                    {dream.panels && dream.panels.length > 0 && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.backgroundDark }}>
                        <p className="text-sm font-semibold mb-3" style={{ color: colors.cyan }}>
                          Comic Panels ({dream.panels.length})
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {dream.panels.map((panel: any, pIdx: number) => (
                            <Panel 
                              key={pIdx} 
                              {...panel} 
                              generateDelay={0}
                              shouldGenerate={false}
                              onImageReady={(url) => handlePanelImageReady(panel.id, url)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comics Tab */}
        {currentTab === 'Comics' && (
          <div>
            {savedDreams.length === 0 || !savedDreams.some(d => d.panels?.length > 0) ? (
              <div
                className="rounded-xl p-12 text-center"
                style={{
                  background: colors.surface,
                  border: `2px dashed ${colors.cyan}`,
                }}
              >
                <p className="text-2xl mb-3">📚</p>
                <p style={{ color: colors.textMuted }}>No comic panels generated yet.</p>
                <p className="text-sm mt-3" style={{ color: colors.textMuted }}>
                  Create a new dream on the Dashboard to generate comic panels!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {savedDreams.map((dream, dIdx) =>
                  dream.panels && dream.panels.length > 0 ? (
                    <div key={dIdx}>
                      <div className="mb-6">
                        <p className="font-semibold text-lg" style={{ color: colors.cyan }}>
                          {dream.text.substring(0, 100)}...
                        </p>
                        <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                          {new Date(dream.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {dream.panels.map((panel: any, idx: number) => (
                          <Panel 
                            key={panel.id} 
                            {...panel} 
                            generateDelay={0}
                            shouldGenerate={false}
                            onImageReady={(url) => handlePanelImageReady(panel.id, url)}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        )}

        {/* Insights Tab */}
        {currentTab === 'Insights' && (
          <div
            className="rounded-xl p-6"
            style={{
              background: colors.surface,
              border: `2px solid ${colors.purple}`,
            }}
          >
            {savedDreams.length === 0 ? (
              <p style={{ color: colors.textMuted }}>Save some dreams first to analyze patterns!</p>
            ) : (
              <>
                <p className="mb-4" style={{ color: colors.textMuted }}>
                  You have <strong style={{ color: colors.cyan }}>{savedDreams.length}</strong> dreams saved.
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-6 py-3 rounded-xl font-semibold cursor-pointer hover:scale-105 transition-all disabled:opacity-50"
                  style={{
                    background: gradients.button,
                    boxShadow: shadows.glow,
                    color: colors.white,
                    border: 'none',
                  }}
                >
                  {analyzing ? '🔄 Analyzing...' : '🔍 Analyze My Dreams'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {currentTab === 'Settings' && (
          <div
            className="rounded-xl p-6 max-w-md"
            style={{
              background: colors.surface,
              border: `2px solid ${colors.purple}`,
            }}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  Theme
                </label>
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: colors.backgroundDark,
                    color: colors.textMuted,
                  }}
                >
                  Dark Purple & Cyan (Fixed)
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  Storage
                </label>
                <p style={{ color: colors.textMuted }}>
                  Dreams are saved locally: <strong>{savedDreams.length} dreams</strong>
                </p>
              </div>

              <div>
                <button
                  onClick={() => {
                    localStorage.clear()
                    setSavedDreams([])
                    setPanels([])
                  }}
                  className="px-4 py-2 rounded-lg font-semibold cursor-pointer hover:scale-105 transition-all"
                  style={{
                    background: colors.backgroundDark,
                    color: colors.cyan,
                    border: `1px solid ${colors.cyan}`,
                  }}
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Dream Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="rounded-2xl p-10 max-w-md w-full"
            style={{
              background: colors.surface,
              border: `2px solid ${colors.purple}`,
              boxShadow: shadows.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Create New Dream
            </h2>

            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder="Describe your dream..."
              className="w-full mb-6 p-4 rounded-lg"
              rows={5}
              style={{
                background: colors.backgroundDark,
                color: colors.textPrimary,
                border: `1px solid ${colors.cyan}`,
              }}
            />

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm mb-3 font-semibold" style={{ color: colors.textMuted }}>
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-3 rounded-lg"
                  style={{
                    background: colors.backgroundDark,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cyan}`,
                  }}
                >
                  <option>Anime</option>
                  <option>Watercolor</option>
                  <option>Oil Painting</option>
                  <option>Abstract</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-3 font-semibold" style={{ color: colors.textMuted }}>
                  Mood
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-3 rounded-lg"
                  style={{
                    background: colors.backgroundDark,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cyan}`,
                  }}
                >
                  <option>Dreamy</option>
                  <option>Dark</option>
                  <option>Vibrant</option>
                  <option>Peaceful</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <button
                onClick={handleEnhance}
                disabled={enhancing || !dreamText.trim()}
                className="flex-1 py-3 rounded-lg font-semibold cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
                style={{
                  background: colors.cyan,
                  color: colors.backgroundDark,
                  border: 'none',
                }}
              >
                {enhancing ? '✨ Enhancing...' : '✨ Enhance with AI'}
              </button>
              <button
                onClick={handleCreate}
                disabled={!dreamText.trim()}
                className="flex-1 py-3 rounded-lg font-semibold cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
                style={{
                  background: gradients.button,
                  color: colors.white,
                  border: 'none',
                  boxShadow: shadows.glow,
                }}
              >
                🎨 Create Comic
              </button>
            </div>

            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-3 rounded-lg cursor-pointer font-medium"
              style={{
                background: colors.backgroundDark,
                color: colors.textMuted,
                border: `1px solid ${colors.surface}`,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Insights Modal */}
      {insights && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={() => setInsights(null)}
        >
          <div
            className="rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto"
            style={{
              background: colors.surface,
              border: `2px solid ${colors.purple}`,
              boxShadow: shadows.xl,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                Dream Insights
              </h2>
              <button
                onClick={() => setInsights(null)}
                className="text-2xl cursor-pointer"
                style={{ color: colors.textMuted }}
              >
                ✕
              </button>
            </div>
            <div style={{ color: colors.textPrimary, whiteSpace: 'pre-wrap' }}>
              {insights}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}

function NavItem({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string
  icon: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer hover:opacity-80 font-medium"
      style={{
        background: active ? colors.purple : 'transparent',
        color: active ? colors.white : colors.textMuted,
        border: 'none',
      }}
    >
      {icon} {label}
    </button>
  )
}

function StatCard({
  icon,
  value,
  label,
  tag,
}: {
  icon: string
  value: number
  label: string
  tag: string
}) {
  return (
    <div
      className="rounded-xl p-6 cursor-pointer transition-all hover:scale-105"
      style={{
        background: colors.surface,
        border: `1px solid ${colors.cyan}`,
        boxShadow: shadows.sm,
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-2xl">{icon}</span>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            background: colors.backgroundDark,
            color: colors.textMuted,
          }}
        >
          {tag}
        </span>
      </div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm" style={{ color: colors.textMuted }}>
        {label}
      </div>
    </div>
  )
}