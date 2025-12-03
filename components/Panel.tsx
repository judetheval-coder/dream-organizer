"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { colors } from "@/lib/design"
import { optimizePromptForDalle } from "@/lib/gpt-helpers"
import { shareDream } from "@/lib/social"
import { useToast } from "@/contexts/ToastContext"

const FRAMES = {
  minimal: {
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
  },
  classic: {
    border: '3px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
  },
  comic: {
    border: '4px solid #1a1a2e',
    borderRadius: '4px',
    boxShadow: '6px 6px 0px rgba(124, 58, 237, 0.4)'
  },
  glow: {
    border: '2px solid rgba(124, 58, 237, 0.4)',
    borderRadius: '12px',
    boxShadow: '0 0 30px rgba(124, 58, 237, 0.15), 0 8px 32px rgba(0,0,0,0.4)'
  },
  neon: {
    border: '2px solid rgba(6, 182, 212, 0.5)',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(6, 182, 212, 0.2), 0 0 40px rgba(124, 58, 237, 0.1)'
  },
} as const

type FrameStyle = keyof typeof FRAMES
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
  onDragEnd?: (e: React.DragEvent) => void
  dragIndex?: number
  dreamId?: string | number
  dream_id?: string | number
  sceneNumber?: number
  totalScenes?: number
}

const IMG_STORE = "dream-organizer-panel-images"

export default function Panel({
  description,
  style,
  mood,
  onImageReady,
  generateDelay = 0,
  shouldGenerate = true,
  image: initialImage = "",
  frameStyle = 'minimal',
  enableEffects = true,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragIndex,
  dreamId,
  dream_id,
  sceneNumber,
  totalScenes
}: PanelProps) {
  const { showToast } = useToast()
  const [image, setImage] = useState(initialImage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const key = `${description}-${style}-${mood}`
  const internalDreamId = dreamId ?? dream_id
  const cleanDescription = description.replace(/\s*-\s*Scene\s*\d+\s*/gi, '').trim()

  const persist = useCallback((img: string) => {
    try {
      const s = JSON.parse(localStorage.getItem(IMG_STORE) || "{}")
      s[key] = img
      localStorage.setItem(IMG_STORE, JSON.stringify(s))
    } catch { /* ignore */ }
  }, [key])

  const generate = useCallback(async () => {
    if (!description || loading) return
    setLoading(true)
    setError("")
    setProgress(0)

    const iv = setInterval(() => setProgress(p => Math.min(p + Math.random() * 6, 92)), 400)

    try {
      const prompt = await optimizePromptForDalle(description, style, mood)
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      })
      if (!res.ok) throw new Error(`Generation failed`)
      const { image: img } = await res.json()
      if (!img) throw new Error("No image returned")

      clearInterval(iv)
      setProgress(100)
      setImage(img)
      persist(img)
      onImageReady?.(img)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed")
    } finally {
      clearInterval(iv)
      setLoading(false)
    }
  }, [description, loading, mood, onImageReady, persist, style])

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage)
      onImageReady?.(initialImage)
      return
    }
    try {
      const s = JSON.parse(localStorage.getItem(IMG_STORE) || "{}")
      if (s[key]) {
        setImage(s[key])
        onImageReady?.(s[key])
      }
    } catch { /* ignore */ }
  }, [initialImage, key, onImageReady])

  useEffect(() => {
    if (!image && !loading && description && shouldGenerate) {
      const t = setTimeout(() => void generate(), generateDelay)
      return () => clearTimeout(t)
    }
  }, [description, generateDelay, generate, image, loading, shouldGenerate])

  const handleDelete = () => {
    setImage('')
    setError('')
    try {
      const s = JSON.parse(localStorage.getItem(IMG_STORE) || '{}')
      delete s[key]
      localStorage.setItem(IMG_STORE, JSON.stringify(s))
    } catch { /* ignore */ }
    showToast('Image deleted', 'success')
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = image
    a.download = `dream-${Date.now()}.png`
    a.click()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(image)
      showToast('Copied!', 'success')
    } catch {
      showToast('Failed to copy', 'error')
    }
  }

  return (
    <div
      ref={ref}
      className={`dream-panel relative overflow-hidden transition-all duration-300 ${isDragging ? 'opacity-50 scale-95' : ''}`}
      style={{
        aspectRatio: "16/10",
        ...FRAMES[frameStyle],
        transform: isHovered && enableEffects ? 'translateY(-2px)' : 'none',
        cursor: draggable ? 'grab' : 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowShareMenu(false) }}
      draggable={draggable}
      onDragStart={e => { setIsDragging(true); e.dataTransfer.setData('text/plain', String(dragIndex)); onDragStart?.(e) }}
      onDragEnd={e => { setIsDragging(false); onDragEnd?.(e) }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: 'linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%)' }}>
          {/* Enhanced loading with dream dust animation */}
          <div className="loading-dream-dust mb-4">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="relative w-20 h-20 mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="url(#panelGradient)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={`${progress * 2.51} 251`}
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />
              <defs>
                <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={colors.purple} />
                  <stop offset="100%" stopColor={colors.cyan} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-semibold text-white/80">{Math.round(progress)}%</span>
            </div>
          </div>
          <p className="text-sm text-white/50">Creating your dream...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && !image && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6" style={{ background: 'linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%)' }}>
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-sm text-white/60 mb-4">{error}</p>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Generated Image */}
      {!loading && image && (
        <>
          <Image
            src={image}
            alt={cleanDescription}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />

          {/* Scene badge */}
          {sceneNumber && totalScenes && totalScenes > 1 && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-xs font-medium bg-black/50 backdrop-blur-sm text-white/80 z-20">
              {sceneNumber}/{totalScenes}
            </div>
          )}

          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-200 z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={handleDownload} className="px-2.5 py-1 rounded text-xs font-medium bg-white/15 backdrop-blur-sm text-white/90 hover:bg-white/25 transition-colors">
                  ↓ Save
                </button>
                <button onClick={handleCopy} className="px-2.5 py-1 rounded text-xs font-medium bg-white/15 backdrop-blur-sm text-white/90 hover:bg-white/25 transition-colors">
                  Copy
                </button>
                <div className="relative">
                  <button onClick={() => setShowShareMenu(!showShareMenu)} className="px-2.5 py-1 rounded text-xs font-medium bg-white/15 backdrop-blur-sm text-white/90 hover:bg-white/25 transition-colors">
                    Share
                  </button>
                  {showShareMenu && (
                    <div className="absolute bottom-full left-0 mb-1 flex gap-0.5 p-1 rounded bg-black/70 backdrop-blur-sm">
                      <button onClick={() => { shareDream('twitter', { title: 'My Dream', description: cleanDescription, imageUrl: image, dreamId: internalDreamId?.toString() }); setShowShareMenu(false) }} className="p-1.5 rounded hover:bg-white/10" title="Twitter">🐦</button>
                      <button onClick={() => { shareDream('facebook', { title: 'My Dream', description: cleanDescription, imageUrl: image, dreamId: internalDreamId?.toString() }); setShowShareMenu(false) }} className="p-1.5 rounded hover:bg-white/10" title="Facebook">📘</button>
                    </div>
                  )}
                </div>
                <button onClick={generate} className="px-2.5 py-1 rounded text-xs font-medium text-white/90 hover:opacity-80 transition-opacity" style={{ background: `linear-gradient(90deg, ${colors.purple}cc, ${colors.cyan}cc)` }}>
                  ↻ Redo
                </button>
                <button onClick={handleDelete} className="px-2.5 py-1 rounded text-xs font-medium bg-red-500/30 text-red-200 hover:bg-red-500/50 transition-colors ml-auto">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !image && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4" style={{ background: 'linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%)' }}>
          <div className="text-4xl mb-3 opacity-50">🎨</div>
          <p className="text-xs text-white/40 text-center mb-4 line-clamp-2 max-w-[80%]">{cleanDescription}</p>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-full text-sm font-medium text-white"
            style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}
          >
            Generate
          </button>
        </div>
      )}
    </div>
  )
}
