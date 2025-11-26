"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { colors, shadows, typography } from "@/lib/design"
import { optimizePromptForDalle } from "@/lib/gpt-helpers"
import { shareDream } from "@/lib/social"
import { Button } from "./ui/primitives"

const FRAMES = {
  classic: { border: `3px solid ${colors.border}`, borderRadius: '12px' },
  torn: { border: 'none', borderRadius: '4px', clipPath: 'polygon(2% 0%, 98% 1%, 100% 97%, 1% 100%)' },
  fade: { border: 'none', borderRadius: '20px', boxShadow: `0 0 40px 10px ${colors.background}` },
  comic: { border: `4px solid ${colors.textPrimary}`, borderRadius: '8px', boxShadow: `6px 6px 0px ${colors.purple}` },
  glow: { border: `2px solid ${colors.purple}`, borderRadius: '16px', boxShadow: `0 0 30px ${colors.purple}40, inset 0 0 30px ${colors.purple}20` },
} as const

type FrameStyle = keyof typeof FRAMES
type PanelProps = {
  description: string; style: string; mood: string; onImageReady?: (url: string) => void
  generateDelay?: number; shouldGenerate?: boolean; image?: string; frameStyle?: FrameStyle
  enableEffects?: boolean; draggable?: boolean; onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void; onDrop?: (e: React.DragEvent) => void; dragIndex?: number
  // Optional dream id (either as dreamId or legacy dream_id when props are spread)
  dreamId?: string | number;
  dream_id?: string | number;
}

const IMG_STORE = "dream-organizer-panel-images"

export default function Panel({ description, style, mood, onImageReady, generateDelay = 0, shouldGenerate = true, image: initialImage = "", frameStyle = 'glow', enableEffects = true, draggable = false, onDragStart, onDragOver, onDrop, dragIndex, dreamId, dream_id }: PanelProps) {
  const [image, setImage] = useState(initialImage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const touchDist = useRef<number | null>(null)

  const sceneLabel = description.match(/Scene \d+/)?.[0] || "Scene"
  const key = `${description}-${style}-${mood}`

  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableEffects || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * 10, y: -((e.clientX - r.left) / r.width - 0.5) * 10 })
  }, [enableEffects])

  const handleTouch = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return
    e.preventDefault()
    const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY)
    if (touchDist.current !== null) setScale(s => Math.min(Math.max(s + (d - touchDist.current!) * 0.005, 1), 3))
    touchDist.current = d
  }, [])

  const persist = useCallback((img: string) => {
    try { const s = JSON.parse(localStorage.getItem(IMG_STORE) || "{}"); s[key] = img; localStorage.setItem(IMG_STORE, JSON.stringify(s)) } catch {}
  }, [key])

  const generate = useCallback(async () => {
    if (!description || loading) return
    setLoading(true); setError(""); setProgress(0)
    const iv = setInterval(() => setProgress(p => Math.min(p + Math.random() * 10, 90)), 800)
    try {
      const prompt = await optimizePromptForDalle(description, style, mood)
      const res = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) })
      if (!res.ok) throw new Error(`Generation failed: ${res.status}`)
      const { image: img } = await res.json()
      if (!img) throw new Error("No image")
      clearInterval(iv); setProgress(100); setImage(img); persist(img); onImageReady?.(img)
    } catch (e) { setError(e instanceof Error ? e.message : "Failed") }
    finally { clearInterval(iv); setLoading(false); setProgress(0) }
  }, [description, loading, mood, onImageReady, persist, style])

  useEffect(() => {
    if (initialImage) { setImage(initialImage); onImageReady?.(initialImage); return }
    try { const s = JSON.parse(localStorage.getItem(IMG_STORE) || "{}"); if (s[key]) { setImage(s[key]); onImageReady?.(s[key]) } } catch {}
  }, [initialImage, key, onImageReady])

  useEffect(() => {
    if (!image && !loading && description && shouldGenerate) {
      const t = setTimeout(() => void generate(), generateDelay)
      return () => clearTimeout(t)
    }
  }, [description, generateDelay, generate, image, loading, shouldGenerate])

  const del = () => {
    if (!confirm('Delete this image?')) return
    setImage(''); setError('')
    try { const s = JSON.parse(localStorage.getItem(IMG_STORE) || '{}'); delete s[key]; localStorage.setItem(IMG_STORE, JSON.stringify(s)) } catch {}
  }

  const btnStyle = (bg: string) => ({ background: bg, color: bg.includes('dc2626') ? 'white' : colors.background })
  const internalDreamId = dreamId ?? dream_id

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden transition-all duration-300 ${isDragging ? 'opacity-50' : ''}`}
      style={{ aspectRatio: "2/1", minHeight: '300px', ...FRAMES[frameStyle], transform: enableEffects ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${scale})` : `scale(${scale})`, cursor: draggable ? 'grab' : 'default' }}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0 }) }}
      onTouchMove={handleTouch}
      onTouchEnd={() => { touchDist.current = null; setTimeout(() => setScale(1), 300) }}
      draggable={draggable}
      onDragStart={e => { setIsDragging(true); e.dataTransfer.setData('text/plain', String(dragIndex)); onDragStart?.(e) }}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {enableEffects && image && <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at center, ${colors.purple}15 0%, transparent 70%)`, animation: 'pulse 3s ease-in-out infinite' }} />}

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10" style={{ background: colors.backgroundDark }}>
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 animate-spin" style={{ borderColor: colors.purple, borderTopColor: colors.cyan }} />
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color: colors.textPrimary }}>{Math.round(progress)}%</div>
          </div>
          <div className="px-6 py-3 font-semibold rounded-full" style={{ background: colors.surface, color: colors.cyan }}>Generating {sceneLabel}...</div>
        </div>
      )}

      {!loading && error && !image && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10" style={{ background: colors.backgroundDark }}>
          <p className="text-4xl mb-4">😵</p>
          <p className="text-sm font-semibold mb-4" style={{ color: colors.textPrimary }}>{error}</p>
          <Button onClick={generate}>Retry</Button>
        </div>
      )}

      {!loading && image && (
        <div className="relative w-full h-full group">
          <div className="absolute inset-0 transition-transform duration-300" style={{ transform: enableEffects && isHovered ? `translateX(${tilt.y * 0.5}px) translateY(${tilt.x * 0.5}px)` : 'none' }}>
            <Image src={image} alt={description} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized loading="lazy" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end gap-3 p-4 z-20">
            {draggable && <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: colors.surface, color: colors.textMuted }}>⋮⋮ Drag to reorder</div>}
            <div className="flex gap-2 flex-wrap justify-center">
              <button onClick={() => { const a = document.createElement('a'); a.href = image; a.download = `dream-panel-${Date.now()}.png`; a.click() }} className="px-3 py-2 font-semibold rounded-lg text-sm backdrop-blur-sm hover:scale-105 transition-all" style={btnStyle(`${colors.cyan}dd`)}>📥 Download</button>
              <button onClick={() => navigator.clipboard.writeText(image).then(() => alert('Copied!'), () => alert('Failed'))} className="px-3 py-2 font-semibold rounded-lg text-sm backdrop-blur-sm hover:scale-105 transition-all" style={btnStyle(`${colors.purple}dd`)}>📋 Copy</button>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} className="px-3 py-2 font-semibold rounded-lg text-sm backdrop-blur-sm hover:scale-105 transition-all" style={btnStyle(`${colors.pink}dd`)}>📤 Share</button>
                {showShareMenu && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-lg flex gap-2" style={{ background: colors.surface }}>
                    <button onClick={() => { shareDream('twitter', { title: 'My Dream Comic', description, imageUrl: image, dreamId: internalDreamId?.toString() }); setShowShareMenu(false) }} className="p-2 rounded-lg hover:scale-110 transition-all" title="Share on Twitter">🐦</button>
                    <button onClick={() => { shareDream('facebook', { title: 'My Dream Comic', description, imageUrl: image, dreamId: internalDreamId?.toString() }); setShowShareMenu(false) }} className="p-2 rounded-lg hover:scale-110 transition-all" title="Share on Facebook">📘</button>
                    <button onClick={() => { shareDream('pinterest', { title: 'My Dream Comic', description, imageUrl: image, dreamId: internalDreamId?.toString() }); setShowShareMenu(false) }} className="p-2 rounded-lg hover:scale-110 transition-all" title="Share on Pinterest">📌</button>
                  </div>
                )}
              </div>
              <button onClick={del} className="px-3 py-2 font-semibold rounded-lg text-sm backdrop-blur-sm hover:scale-105 transition-all" style={btnStyle('#dc2626dd')}>🗑️ Delete</button>
            </div>
            <Button onClick={generate}>🔄 Regenerate</Button>
          </div>
        </div>
      )}

      {!loading && !image && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10" style={{ background: colors.backgroundDark }}>
          <p className="text-sm mb-4 text-center" style={{ color: colors.textSecondary }}>{description}</p>
          <Button onClick={generate}>✨ Generate</Button>
        </div>
      )}

      <style jsx>{`@keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }`}</style>
    </div>
  )
}
