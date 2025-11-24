"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { colors, shadows, typography } from "@/lib/design"
import { optimizePromptForDalle } from "@/lib/gpt-helpers"

// Frame styles for panels
const FRAME_STYLES = {
  classic: {
    border: `3px solid ${colors.border}`,
    borderRadius: '12px',
  },
  torn: {
    border: 'none',
    borderRadius: '4px',
    clipPath: 'polygon(2% 0%, 98% 1%, 100% 97%, 1% 100%)',
  },
  fade: {
    border: 'none',
    borderRadius: '20px',
    boxShadow: `0 0 40px 10px ${colors.background}`,
  },
  comic: {
    border: `4px solid ${colors.textPrimary}`,
    borderRadius: '8px',
    boxShadow: `6px 6px 0px ${colors.purple}`,
  },
  glow: {
    border: `2px solid ${colors.purple}`,
    borderRadius: '16px',
    boxShadow: `0 0 30px ${colors.purple}40, inset 0 0 30px ${colors.purple}20`,
  },
} as const

type FrameStyle = keyof typeof FRAME_STYLES

type PanelProps = {
  description: string
  style: string
  mood: string
  onImageReady?: (url: string) => void
  generateDelay?: number
  shouldGenerate?: boolean
  image?: string
  frameStyle?: FrameStyle
  enableEffects?: boolean
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  dragIndex?: number
}

export default function Panel({ 
  description, 
  style, 
  mood, 
  onImageReady, 
  generateDelay = 0, 
  shouldGenerate = true, 
  image: initialImage = "",
  frameStyle = 'glow',
  enableEffects = true,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  dragIndex,
}: PanelProps) {
  const [image, setImage] = useState<string>(initialImage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [transform3D, setTransform3D] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const lastTouchDistance = useRef<number | null>(null)

  // Extract scene number from description
  const sceneMatch = description.match(/Scene \d+/)
  const sceneLabel = sceneMatch ? sceneMatch[0] : "Scene"

  const IMAGE_STORE_KEY = "dream-organizer-panel-images"

  // 3D tilt effect on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableEffects || !panelRef.current) return
    
    const rect = panelRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    
    setTransform3D({
      x: y * 10, // Rotate around X axis based on Y position
      y: -x * 10, // Rotate around Y axis based on X position
    })
  }, [enableEffects])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setTransform3D({ x: 0, y: 0 })
  }, [])

  // Pinch to zoom on mobile
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      if (lastTouchDistance.current !== null) {
        const delta = distance - lastTouchDistance.current
        setScale(prev => Math.min(Math.max(prev + delta * 0.005, 1), 3))
      }
      lastTouchDistance.current = distance
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    lastTouchDistance.current = null
    // Reset scale after a delay
    setTimeout(() => setScale(1), 300)
  }, [])

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(dragIndex))
    onDragStart?.(e)
  }, [dragIndex, onDragStart])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage)
      onImageReady?.(initialImage)
      return
    }

    try {
      const store = JSON.parse(localStorage.getItem(IMAGE_STORE_KEY) || "{}")
      const key = `${description}-${style}-${mood}`
      if (store[key]) {
        setImage(store[key])
        onImageReady?.(store[key])
      }
    } catch {}
  }, [initialImage, description, style, mood, onImageReady])

  const persistImage = useCallback((img: string) => {
    try {
      const store = JSON.parse(localStorage.getItem(IMAGE_STORE_KEY) || "{}")
      const key = `${description}-${style}-${mood}`
      store[key] = img
      localStorage.setItem(IMAGE_STORE_KEY, JSON.stringify(store))
    } catch {}
  }, [description, mood, style])

  const generateImage = useCallback(async () => {
    if (!description || loading) return

    setLoading(true)
    setError("")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 90))
    }, 800)

    try {
      const optimizedPrompt = await optimizePromptForDalle(description, style, mood)

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: optimizedPrompt }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Generation failed: ${response.status} - ${text}`)
      }

      const data = await response.json()

      if (!data.image) {
        throw new Error("No image in response")
      }

      clearInterval(interval)
      setProgress(100)

      setImage(data.image)
      persistImage(data.image)
      onImageReady?.(data.image)

      setLoading(false)
      setProgress(0)
    } catch (e) {
      clearInterval(interval)
      setProgress(0)
      setLoading(false)
      setError(e instanceof Error ? e.message : "Generation failed")
      console.error("Panel generation error:", e)
    }
  }, [description, loading, mood, onImageReady, persistImage, style])

  useEffect(() => {
    if (!image && !loading && description && shouldGenerate) {
      const timer = setTimeout(() => {
        void generateImage()
      }, generateDelay)
      return () => clearTimeout(timer)
      return () => clearTimeout(timer)
    }
  }, [description, generateDelay, generateImage, image, loading, shouldGenerate])

  const frameStyles = FRAME_STYLES[frameStyle]

  // Subtle breathing animation for panels with images
  const breatheAnimation = enableEffects && image && !isHovered ? {
    animation: 'breathe 4s ease-in-out infinite',
  } : {}

  return (
    <div
      ref={panelRef}
      className={`relative w-full overflow-hidden transition-all duration-300 ${isDragging ? 'opacity-50' : ''}`}
      style={{
        aspectRatio: "2/1",
        minHeight: '300px',
        ...frameStyles,
        transform: enableEffects 
          ? `perspective(1000px) rotateX(${transform3D.x}deg) rotateY(${transform3D.y}deg) scale(${scale})`
          : `scale(${scale})`,
        transformStyle: 'preserve-3d',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        ...breatheAnimation,
        cursor: draggable ? 'grab' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Subtle ambient glow effect */}
      {enableEffects && image && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.purple}15 0%, transparent 70%)`,
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
      )}

      {loading && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10"
          style={{
            background: colors.backgroundDark,
          }}
        >
          <div className="relative mb-6">
            <div 
              className="w-20 h-20 rounded-full border-4 animate-spin"
              style={{
                borderColor: colors.purple,
                borderTopColor: colors.cyan,
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
              style={{ fontFamily: typography.heading, color: colors.textPrimary }}
            >
              {Math.round(progress)}%
            </div>
          </div>

          <div
            className="px-6 py-3 font-semibold rounded-full"
            style={{
              background: colors.surface,
              color: colors.cyan,
            }}
          >
            Generating {sceneLabel}...
          </div>
        </div>
      )}

      {!loading && error && !image && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10"
          style={{ background: colors.backgroundDark }}
        >
          <p className="text-4xl mb-4">😵</p>
          <p
            className="text-sm font-semibold mb-4"
            style={{ fontFamily: typography.body, color: colors.textPrimary }}
          >
            {error}
          </p>
          <button
            onClick={generateImage}
            className="px-6 py-3 font-semibold rounded-xl transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purpleLight} 100%)`,
              color: colors.white,
              boxShadow: shadows.glow,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && image && (
        <div className="relative w-full h-full group">
          {/* Main image with subtle parallax effect */}
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{
              transform: enableEffects && isHovered 
                ? `translateX(${transform3D.y * 0.5}px) translateY(${transform3D.x * 0.5}px)` 
                : 'none',
            }}
          >
            <Image
              src={image}
              alt={description}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized
              loading="lazy"
            />
          </div>

          {/* Hover overlay with controls */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end gap-3 p-4 z-20"
          >
            {/* Drag handle indicator */}
            {draggable && (
              <div 
                className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: colors.surface, color: colors.textMuted }}
              >
                ⋮⋮ Drag to reorder
              </div>
            )}

            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = image
                  link.download = `dream-panel-${Date.now()}.png`
                  link.click()
                }}
                className="px-3 py-2 font-semibold rounded-lg transition-all hover:scale-105 text-sm backdrop-blur-sm"
                style={{
                  background: `${colors.cyan}dd`,
                  color: colors.background,
                }}
                title="Download"
              >
                📥 Download
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(image)
                    alert('Image URL copied to clipboard!')
                  } catch {
                    alert('Failed to copy')
                  }
                }}
                className="px-3 py-2 font-semibold rounded-lg transition-all hover:scale-105 text-sm backdrop-blur-sm"
                style={{
                  background: `${colors.purple}dd`,
                  color: colors.white,
                }}
                title="Copy URL"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this image?')) {
                    setImage('')
                    setError('')
                    try {
                      const store = JSON.parse(localStorage.getItem(IMAGE_STORE_KEY) || '{}')
                      const key = `${description}-${style}-${mood}`
                      delete store[key]
                      localStorage.setItem(IMAGE_STORE_KEY, JSON.stringify(store))
                    } catch {}
                  }
                }}
                className="px-3 py-2 font-semibold rounded-lg transition-all hover:scale-105 text-sm backdrop-blur-sm"
                style={{
                  background: '#dc2626dd',
                  color: 'white',
                }}
                title="Delete"
              >
                🗑️ Delete
              </button>
            </div>
            <button
              onClick={generateImage}
              className="px-4 py-2 font-semibold rounded-lg transition-all hover:scale-105 backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${colors.purple}dd 0%, ${colors.purpleLight}dd 100%)`,
                color: colors.white,
                boxShadow: shadows.glow,
              }}
            >
              🔄 Regenerate
            </button>
          </div>
        </div>
      )}

      {!loading && !image && !error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10"
          style={{
            background: colors.backgroundDark,
          }}
        >
          <p
            className="text-sm mb-4 text-center"
            style={{ fontFamily: typography.body, color: colors.textSecondary }}
          >
            {description}
          </p>
          <button
            onClick={generateImage}
            className="px-6 py-3 font-semibold rounded-xl transition-all hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purpleLight} 100%)`,
              color: colors.white,
              boxShadow: shadows.glow,
            }}
          >
            ✨ Generate
          </button>
        </div>
      )}

      {/* CSS Keyframes for animations */}
      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: perspective(1000px) scale(1); }
          50% { transform: perspective(1000px) scale(1.01); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
