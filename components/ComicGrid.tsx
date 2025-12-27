"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { colors } from "@/lib/design"
import { useToast } from "@/contexts/ToastContext"
import { optimizePromptForDalle } from "@/lib/gpt-helpers"

type ComicGridProps = {
  scenes: string[]
  onAllImagesReady?: (images: string[]) => void
  initialImages?: string[]
  dreamId?: string | number
}

type PanelState = {
  image: string
  loading: boolean
  error: string
  progress: number
}

export default function ComicGrid({
  scenes,
  onAllImagesReady,
  initialImages = [],
  dreamId,
}: ComicGridProps) {
  const { showToast } = useToast()
  const [panels, setPanels] = useState<PanelState[]>(() =>
    scenes.map((_, i) => ({
      image: initialImages[i] || '',
      loading: false,
      error: '',
      progress: 0
    }))
  )
  const [isHovered, setIsHovered] = useState(false)
  const [generatingIndex, setGeneratingIndex] = useState(-1)

  // Generate a single panel
  const generatePanel = useCallback(async (index: number) => {
    if (!scenes[index]) return

    setPanels(prev => prev.map((p, i) =>
      i === index ? { ...p, loading: true, error: '', progress: 0 } : p
    ))

    const progressInterval = setInterval(() => {
      setPanels(prev => prev.map((p, i) =>
        i === index ? { ...p, progress: Math.min(p.progress + Math.random() * 8, 90) } : p
      ))
    }, 400)

    try {
      // Optimize prompt for this specific scene
      const prompt = await optimizePromptForDalle(scenes[index], 'Comic', 'Dynamic')

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Generation failed (${res.status})`)
      }

      if (!data?.image) throw new Error("No image returned")

      clearInterval(progressInterval)
      setPanels(prev => prev.map((p, i) =>
        i === index ? { ...p, image: data.image, loading: false, progress: 100 } : p
      ))

      return data.image
    } catch (e) {
      clearInterval(progressInterval)
      const errorMessage = e instanceof Error ? e.message : "Generation failed"
      setPanels(prev => prev.map((p, i) =>
        i === index ? { ...p, loading: false, error: errorMessage, progress: 0 } : p
      ))
      return null
    }
  }, [scenes])

  // Generate all panels sequentially
  const generateAllPanels = useCallback(async () => {
    const images: string[] = []

    for (let i = 0; i < scenes.length; i++) {
      setGeneratingIndex(i)
      const image = await generatePanel(i)
      if (image) {
        images.push(image)
      }
      // Small delay between generations to avoid rate limits
      if (i < scenes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setGeneratingIndex(-1)

    if (images.length === scenes.length) {
      onAllImagesReady?.(images)
    }
  }, [scenes, generatePanel, onAllImagesReady])

  // Auto-generate on mount if no initial images
  useEffect(() => {
    const hasAnyImage = panels.some(p => p.image)
    const isGenerating = panels.some(p => p.loading)

    if (!hasAnyImage && !isGenerating && scenes.length > 0) {
      generateAllPanels()
    }
  }, []) // Only run once on mount

  const handleDownload = async () => {
    // Create a canvas to composite all panels
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const panelSize = 512
    const borderWidth = 12
    const cols = 2
    const rows = Math.ceil(scenes.length / cols)

    canvas.width = cols * panelSize + (cols + 1) * borderWidth
    canvas.height = rows * panelSize + (rows + 1) * borderWidth

    // Fill with white background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw each panel
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img')
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    }

    try {
      for (let i = 0; i < panels.length; i++) {
        if (panels[i].image) {
          const img = await loadImage(panels[i].image)
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = borderWidth + col * (panelSize + borderWidth)
          const y = borderWidth + row * (panelSize + borderWidth)
          ctx.drawImage(img, x, y, panelSize, panelSize)
        }
      }

      // Download
      const link = document.createElement('a')
      link.download = `comic-page-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('Comic page downloaded!', 'success')
    } catch (err) {
      console.error('Error creating composite:', err)
      showToast('Failed to download', 'error')
    }
  }

  const allLoaded = panels.every(p => p.image && !p.loading)
  const anyLoading = panels.some(p => p.loading)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Comic page container with white border */}
      <div
        className="relative transition-all duration-300"
        style={{
          padding: '12px',
          background: 'white',
          borderRadius: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          transform: isHovered && allLoaded ? 'translateY(-4px)' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 2x2 Grid of panels */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: `repeat(${Math.ceil(scenes.length / 2)}, 1fr)`,
          }}
        >
          {panels.map((panel, index) => (
            <div
              key={index}
              className="relative overflow-hidden"
              style={{
                aspectRatio: '1',
                background: '#0a0118',
                borderRadius: '2px',
              }}
            >
              {/* Loading state */}
              {panel.loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="relative w-16 h-16 mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="url(#gridGradient)" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${panel.progress * 2.51} 251`}
                        style={{ transition: 'stroke-dasharray 0.3s ease' }}
                      />
                      <defs>
                        <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={colors.purple} />
                          <stop offset="100%" stopColor={colors.cyan} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white/80">{Math.round(panel.progress)}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50">Panel {index + 1}</p>
                </div>
              )}

              {/* Error state */}
              {!panel.loading && panel.error && !panel.image && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
                  <div className="text-2xl mb-2">⚠️</div>
                  <p className="text-xs text-white/50 text-center mb-3">{panel.error}</p>
                  <button
                    onClick={() => generatePanel(index)}
                    className="px-3 py-1.5 rounded text-xs font-medium text-white"
                    style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Generated image */}
              {!panel.loading && panel.image && (
                <Image
                  src={panel.image}
                  alt={`Panel ${index + 1}: ${scenes[index]?.slice(0, 50)}...`}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover"
                  unoptimized
                />
              )}

              {/* Panel number badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold bg-black/60 text-white/80 z-20">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Hover overlay for actions */}
        {allLoaded && (
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 z-30 rounded ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors"
              >
                ↓ Download Comic
              </button>
              <button
                onClick={generateAllPanels}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}
              >
                ↻ Regenerate All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Generation progress */}
      {anyLoading && (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium" style={{ color: colors.cyan }}>
            Generating panel {generatingIndex + 1} of {scenes.length}...
          </p>
        </div>
      )}

      {/* Scene descriptions */}
      {scenes.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Scenes</h4>
          <div className="grid gap-2">
            {scenes.map((scene, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: panels[i]?.image ? colors.purple : 'rgba(255,255,255,0.2)' }}
                >
                  {panels[i]?.image ? '✓' : i + 1}
                </span>
                <p className="text-sm text-white/70 leading-relaxed">{scene}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
