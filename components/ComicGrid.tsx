"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { colors } from "@/lib/design"
import { useToast } from "@/contexts/ToastContext"
import { optimizePromptForDalle } from "@/lib/gpt-helpers"

// Scene data structure from breakdown-dream API
type SceneData = {
  visual: string
  caption: string | null
  caption_position: string | null
  dialogue: string | null
  sfx: string | null
  panel_type: string
  // Legacy fields for backward compatibility
  overlay_text?: string | null
  text_position?: string | null
}

type ComicGridProps = {
  scenes: string[] // Legacy support - visual prompts only
  sceneData?: SceneData[] // New structured data with overlays
  onAllImagesReady?: (images: string[]) => void
  initialImages?: string[]
  dreamId?: string | number
  columns?: 2 | 3 | 4 // Allow flexible column layouts
}

type PanelState = {
  image: string
  loading: boolean
  error: string
  progress: number
  // New caption system
  caption?: string | null
  caption_position?: string | null
  dialogue?: string | null
  sfx?: string | null
  panel_type?: string
  // Legacy fields
  overlay_text?: string | null
  text_position?: string | null
}

export default function ComicGrid({
  scenes,
  sceneData,
  onAllImagesReady,
  initialImages = [],
  dreamId,
  columns: propColumns,
}: ComicGridProps) {
  // Auto-calculate columns based on panel count if not specified
  const columns = propColumns || (scenes.length <= 4 ? 2 : scenes.length <= 9 ? 3 : 4)
  const { showToast } = useToast()

  // Generate a consistent seed for this comic - all panels will use the same seed
  // This helps maintain a consistent art style across panels
  const [comicSeed] = useState(() => Math.floor(Math.random() * 2147483647))
  const [panels, setPanels] = useState<PanelState[]>(() =>
    scenes.map((_, i) => ({
      image: initialImages[i] || '',
      loading: false,
      error: '',
      progress: 0,
      // New caption system
      caption: sceneData?.[i]?.caption || null,
      caption_position: sceneData?.[i]?.caption_position || 'top-left',
      dialogue: sceneData?.[i]?.dialogue || null,
      sfx: sceneData?.[i]?.sfx || null,
      panel_type: sceneData?.[i]?.panel_type || 'action',
      // Legacy fields
      overlay_text: sceneData?.[i]?.overlay_text || sceneData?.[i]?.dialogue || null,
      text_position: sceneData?.[i]?.text_position || null,
    }))
  )
  const [isHovered, setIsHovered] = useState(false)
  const [generatingIndex, setGeneratingIndex] = useState(-1)

  // Generate a single panel with automatic retry
  const generatePanel = useCallback(async (index: number, retryCount = 0): Promise<string | null> => {
    const MAX_RETRIES = 3
    const RETRY_DELAY_BASE = 2000 // 2 seconds, doubles each retry

    if (!scenes[index]) return null

    setPanels(prev => prev.map((p, i) =>
      i === index ? { ...p, loading: true, error: retryCount > 0 ? `Retrying (${retryCount}/${MAX_RETRIES})...` : '', progress: 0 } : p
    ))

    const progressInterval = setInterval(() => {
      setPanels(prev => prev.map((p, i) =>
        i === index ? { ...p, progress: Math.min(p.progress + Math.random() * 8, 90) } : p
      ))
    }, 400)

    try {
      // Optimize prompt for this specific scene
      const prompt = await optimizePromptForDalle(scenes[index], 'Comic', 'Dynamic')
      const panelType = sceneData?.[index]?.panel_type || 'action'

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, seed: comicSeed, panel_type: panelType })
      })

      const data = await res.json()

      if (!res.ok) {
        // If rate limited or server error, retry with backoff
        if ((res.status === 429 || res.status >= 500) && retryCount < MAX_RETRIES) {
          clearInterval(progressInterval)
          const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount)
          console.log(`[ComicGrid] Panel ${index + 1} failed with ${res.status}, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          return generatePanel(index, retryCount + 1)
        }
        throw new Error(data?.error || `Generation failed (${res.status})`)
      }

      if (!data?.image) throw new Error("No image returned")

      clearInterval(progressInterval)
      setPanels(prev => prev.map((p, i) =>
        i === index ? { ...p, image: data.image, loading: false, progress: 100, error: '' } : p
      ))

      return data.image
    } catch (e) {
      clearInterval(progressInterval)

      // Auto-retry on certain errors
      const errorMessage = e instanceof Error ? e.message : "Generation failed"
      const isRetryable = errorMessage.includes('429') ||
                          errorMessage.includes('500') ||
                          errorMessage.includes('502') ||
                          errorMessage.includes('503') ||
                          errorMessage.includes('timeout')

      if (isRetryable && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount)
        console.log(`[ComicGrid] Panel ${index + 1} error: ${errorMessage}, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return generatePanel(index, retryCount + 1)
      }

      setPanels(prev => prev.map((p, i) =>
        i === index ? { ...p, loading: false, error: errorMessage, progress: 0 } : p
      ))
      return null
    }
  }, [scenes, comicSeed])

  // Generate panels sequentially to avoid overwhelming the API
  // This is more reliable than parallel generation with staggering
  const generateAllPanels = useCallback(async () => {
    setGeneratingIndex(0)
    const results: (string | null)[] = []

    for (let i = 0; i < scenes.length; i++) {
      setGeneratingIndex(i)
      const result = await generatePanel(i)
      results.push(result)

      // Small delay between panels to let Replicate breathe
      if (i < scenes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setGeneratingIndex(-1)

    // Filter out failed generations and collect successful ones
    const images = results.filter((img): img is string => img !== null)

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

    const panelSize = columns <= 2 ? 512 : columns === 3 ? 400 : 350
    const borderWidth = 16 // Thicker white borders like classic comics
    const panelBorder = 3 // Black border around each panel
    const cols = columns
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

    // Draw narrative caption box (aged paper style)
    const drawCaptionBox = (
      panelX: number,
      panelY: number,
      panelWidth: number,
      text: string,
      position: string
    ) => {
      ctx.save()

      const maxWidth = panelWidth * 0.85
      ctx.font = 'italic 13px Georgia, serif'
      const lines = wrapText(ctx, text, maxWidth - 24)
      const lineHeight = 18
      const boxHeight = lines.length * lineHeight + 16
      const boxWidth = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width)) + 24)

      let boxX = panelX + 8
      let boxY = panelY + 8

      if (position === 'bottom-left') {
        boxY = panelY + panelWidth - boxHeight - 8
      } else if (position === 'top-right') {
        boxX = panelX + panelWidth - boxWidth - 8
      } else if (position === 'bottom-center') {
        boxX = panelX + (panelWidth - boxWidth) / 2
        boxY = panelY + panelWidth - boxHeight - 8
      }

      // Aged paper gradient background
      const gradient = ctx.createLinearGradient(boxX, boxY, boxX + boxWidth, boxY + boxHeight)
      gradient.addColorStop(0, '#fffef8')
      gradient.addColorStop(1, '#f4edd8')
      ctx.fillStyle = gradient
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight)

      // Border
      ctx.strokeStyle = '#2a2a2a'
      ctx.lineWidth = 2
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3

      // Text
      ctx.fillStyle = '#1a1a1a'
      ctx.shadowColor = 'transparent'
      lines.forEach((line, i) => {
        ctx.fillText(line, boxX + 12, boxY + 18 + i * lineHeight)
      })

      ctx.restore()
    }

    // Draw speech bubble
    const drawSpeechBubble = (
      panelX: number,
      panelY: number,
      panelWidth: number,
      text: string,
      hasCaption: boolean
    ) => {
      ctx.save()

      const maxWidth = panelWidth * 0.7
      ctx.font = 'bold 14px "Comic Sans MS", cursive'
      const lines = wrapText(ctx, text, maxWidth - 20)
      const lineHeight = 18
      const bubbleHeight = lines.length * lineHeight + 16
      const bubbleWidth = Math.min(maxWidth, Math.max(...lines.map(l => ctx.measureText(l).width)) + 28)

      const bubbleX = panelX + (panelWidth - bubbleWidth) / 2
      const bubbleY = hasCaption ? panelY + panelWidth * 0.45 : panelY + panelWidth * 0.15

      // Bubble background
      ctx.fillStyle = 'white'
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 15)
      ctx.fill()
      ctx.stroke()

      // Bubble tail
      ctx.beginPath()
      ctx.moveTo(bubbleX + 20, bubbleY + bubbleHeight)
      ctx.lineTo(bubbleX + 25, bubbleY + bubbleHeight + 12)
      ctx.lineTo(bubbleX + 35, bubbleY + bubbleHeight)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.stroke()

      // Text
      ctx.fillStyle = '#1a1a1a'
      lines.forEach((line, i) => {
        ctx.fillText(line, bubbleX + 14, bubbleY + 18 + i * lineHeight)
      })

      ctx.restore()
    }

    // Draw sound effect
    const drawSoundEffect = (
      panelX: number,
      panelY: number,
      panelWidth: number,
      text: string
    ) => {
      ctx.save()

      const sfxX = panelX + panelWidth * 0.75
      const sfxY = panelY + panelWidth * 0.85

      ctx.translate(sfxX, sfxY)
      ctx.rotate(-8 * Math.PI / 180)

      ctx.font = 'bold 24px Impact, sans-serif'
      ctx.fillStyle = '#ff3b3b'
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 3
      ctx.letterSpacing = '3px'

      ctx.strokeText(text, 0, 0)
      ctx.fillText(text, 0, 0)

      ctx.restore()
    }

    // Legacy text overlay for backward compatibility
    const drawLegacyOverlay = (
      x: number,
      y: number,
      width: number,
      text: string,
      position: string
    ) => {
      ctx.save()

      if (position === 'speech-bubble') {
        drawSpeechBubble(x, y, width, text, false)
      } else if (position === 'sign') {
        ctx.font = 'bold 18px Impact, sans-serif'
        const textWidth = ctx.measureText(text).width
        const signX = x + (width - textWidth) / 2 - 10
        const signY = y + 10

        ctx.fillStyle = 'rgba(255, 0, 100, 0.9)'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.fillRect(signX, signY, textWidth + 20, 28)
        ctx.strokeRect(signX, signY, textWidth + 20, 28)

        ctx.fillStyle = 'white'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 3
        ctx.strokeText(text, signX + 10, signY + 20)
        ctx.fillText(text, signX + 10, signY + 20)
      }

      ctx.restore()
    }

    // Helper to wrap text
    const wrapText = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = ''

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        if (context.measureText(testLine).width > maxWidth && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      })
      if (currentLine) lines.push(currentLine)
      return lines
    }

    try {
      for (let i = 0; i < panels.length; i++) {
        if (panels[i].image) {
          const img = await loadImage(panels[i].image)
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = borderWidth + col * (panelSize + borderWidth)
          const y = borderWidth + row * (panelSize + borderWidth)
          const panel = panels[i]

          // Draw the image
          ctx.drawImage(img, x, y, panelSize, panelSize)

          // Draw black panel border
          ctx.strokeStyle = 'black'
          ctx.lineWidth = panelBorder
          ctx.strokeRect(x, y, panelSize, panelSize)

          // Draw narrative caption if present
          if (panel.caption) {
            drawCaptionBox(x, y, panelSize, panel.caption, panel.caption_position || 'top-left')
          }

          // Draw speech bubble if present
          if (panel.dialogue) {
            drawSpeechBubble(x, y, panelSize, panel.dialogue, !!panel.caption)
          }

          // Draw sound effect if present
          if (panel.sfx) {
            drawSoundEffect(x, y, panelSize, panel.sfx)
          }

          // Legacy: Draw old overlay_text if no new fields present
          if (!panel.caption && !panel.dialogue && panel.overlay_text && panel.text_position) {
            drawLegacyOverlay(x, y, panelSize, panel.overlay_text, panel.text_position)
          }
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
      {/* Comic page container with thick white borders like classic comics */}
      <div
        className="relative transition-all duration-300"
        style={{
          padding: '16px',
          background: 'white',
          borderRadius: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          transform: isHovered && allLoaded ? 'translateY(-4px)' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dynamic grid of panels with thick white gutters */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${Math.ceil(scenes.length / columns)}, 1fr)`,
            gap: '16px',
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

              {/* Text overlays - narrative captions, speech bubbles, sound effects */}
              {!panel.loading && panel.image && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Narrative Caption Box - aged paper styling */}
                  {panel.caption && (
                    <div
                      className="absolute max-w-[85%]"
                      style={{
                        ...(panel.caption_position === 'top-left' ? { top: 8, left: 8 } : {}),
                        ...(panel.caption_position === 'bottom-left' ? { bottom: 8, left: 8 } : {}),
                        ...(panel.caption_position === 'top-right' ? { top: 8, right: 8 } : {}),
                        ...(panel.caption_position === 'bottom-center' ? { bottom: 8, left: '50%', transform: 'translateX(-50%)' } : {}),
                      }}
                    >
                      <div
                        className="px-3 py-2"
                        style={{
                          background: 'linear-gradient(145deg, #fffef8 0%, #f4edd8 100%)',
                          border: '2px solid #2a2a2a',
                          fontFamily: 'var(--font-eb-garamond), Georgia, serif',
                          fontSize: '0.8rem',
                          fontStyle: 'italic',
                          lineHeight: 1.45,
                          color: '#1a1a1a',
                          boxShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                        }}
                      >
                        {panel.caption}
                      </div>
                    </div>
                  )}

                  {/* Speech Bubble */}
                  {panel.dialogue && (
                    <div
                      className="absolute"
                      style={{
                        top: panel.caption ? '45%' : '15%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div
                        className="relative bg-white rounded-2xl px-3 py-2"
                        style={{
                          fontFamily: 'var(--font-comic-neue), "Comic Sans MS", cursive',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          color: '#1a1a1a',
                          border: '2.5px solid #1a1a1a',
                          boxShadow: '2px 2px 0 rgba(0,0,0,0.15)',
                          maxWidth: '80%',
                        }}
                      >
                        {panel.dialogue}
                        {/* Speech bubble tail */}
                        <div
                          className="absolute -bottom-3 left-5 w-0 h-0"
                          style={{
                            borderLeft: '8px solid transparent',
                            borderRight: '8px solid transparent',
                            borderTop: '12px solid #1a1a1a',
                          }}
                        />
                        <div
                          className="absolute -bottom-2 left-5 w-0 h-0"
                          style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '10px solid white',
                            marginLeft: '2px',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sound Effect */}
                  {panel.sfx && (
                    <div
                      className="absolute"
                      style={{
                        bottom: '15%',
                        right: '10%',
                        fontFamily: 'var(--font-bangers), Impact, sans-serif',
                        fontSize: '1.5rem',
                        color: '#ff3b3b',
                        textShadow: '2px 2px 0 #1a1a1a, -1px -1px 0 #1a1a1a',
                        letterSpacing: '3px',
                        transform: 'rotate(-8deg)',
                      }}
                    >
                      {panel.sfx}
                    </div>
                  )}

                  {/* Legacy: Old overlay_text system for backward compatibility */}
                  {!panel.caption && !panel.dialogue && panel.overlay_text && (
                    <>
                      {panel.text_position === 'speech-bubble' && (
                        <div className="absolute top-3 left-3 right-3 max-w-[80%]">
                          <div
                            className="relative bg-white rounded-2xl px-3 py-2 shadow-lg"
                            style={{
                              fontFamily: 'var(--font-comic-neue), "Comic Sans MS", cursive',
                              fontSize: '0.75rem',
                              lineHeight: '1.2',
                              color: '#000',
                              border: '2px solid #000',
                            }}
                          >
                            {panel.overlay_text}
                            <div
                              className="absolute -bottom-2 left-4 w-0 h-0"
                              style={{
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '10px solid #000',
                              }}
                            />
                          </div>
                        </div>
                      )}
                      {panel.text_position === 'sign' && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2">
                          <div
                            className="px-3 py-1 rounded"
                            style={{
                              fontFamily: 'var(--font-bangers), Impact, sans-serif',
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              color: '#fff',
                              textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                              background: 'linear-gradient(180deg, rgba(255,0,100,0.9), rgba(200,0,80,0.9))',
                              border: '2px solid #000',
                            }}
                          >
                            {panel.overlay_text}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Panel border for comic book effect */}
              {!panel.loading && panel.image && (
                <div
                  className="absolute inset-0 pointer-events-none z-5"
                  style={{
                    boxShadow: 'inset 0 0 0 3px #000',
                    borderRadius: '2px',
                  }}
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
