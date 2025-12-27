"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { colors } from "@/lib/design"
import { useToast } from "@/contexts/ToastContext"

type ComicPageProps = {
  scenes: string[]
  onImageReady?: (url: string) => void
  image?: string
  dreamId?: string | number
}

const IMG_STORE = "dream-organizer-comic-pages"

export default function ComicPage({
  scenes,
  onImageReady,
  image: initialImage = "",
  dreamId,
}: ComicPageProps) {
  const { showToast } = useToast()
  const [image, setImage] = useState(initialImage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const hasCalledImageReady = useRef(false)

  const key = `comic-${scenes.join('-').slice(0, 100)}`

  const persist = useCallback((img: string) => {
    try {
      const s = JSON.parse(localStorage.getItem(IMG_STORE) || "{}")
      s[key] = img
      localStorage.setItem(IMG_STORE, JSON.stringify(s))
    } catch { /* ignore */ }
  }, [key])

  const generate = useCallback(async () => {
    if (!scenes.length || loading) return
    setLoading(true)
    setError("")
    setProgress(0)

    const iv = setInterval(() => setProgress(p => Math.min(p + Math.random() * 4, 92)), 500)

    try {
      const res = await fetch("/api/generate-comic-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes,
          panelCount: scenes.length as 2 | 3 | 4
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Generation failed (${res.status})`)
      }

      if (!data?.image) throw new Error("No image returned")

      clearInterval(iv)
      setProgress(100)
      setImage(data.image)
      persist(data.image)
      onImageReady?.(data.image)
    } catch (e) {
      clearInterval(iv)
      setProgress(0)
      const errorMessage = e instanceof Error ? e.message : "Generation failed"
      setError(errorMessage)
      console.error('[ComicPage] Generation error:', errorMessage)
    } finally {
      clearInterval(iv)
      setLoading(false)
    }
  }, [scenes, loading, onImageReady, persist])

  useEffect(() => {
    if (initialImage) {
      setImage(initialImage)
      if (!hasCalledImageReady.current) {
        hasCalledImageReady.current = true
        onImageReady?.(initialImage)
      }
      return
    }
    try {
      const s = JSON.parse(localStorage.getItem(IMG_STORE) || "{}")
      if (s[key]) {
        setImage(s[key])
        if (!hasCalledImageReady.current) {
          hasCalledImageReady.current = true
          onImageReady?.(s[key])
        }
      }
    } catch { /* ignore */ }
  }, [initialImage, key])

  // Auto-generate on mount if no image and no error
  useEffect(() => {
    if (!image && !loading && !error && scenes.length > 0) {
      const t = setTimeout(() => void generate(), 500)
      return () => clearTimeout(t)
    }
  }, [scenes, generate, image, loading, error])

  const handleDelete = () => {
    setImage('')
    setError('')
    try {
      const s = JSON.parse(localStorage.getItem(IMG_STORE) || '{}')
      delete s[key]
      localStorage.setItem(IMG_STORE, JSON.stringify(s))
    } catch { /* ignore */ }
    showToast('Comic page deleted', 'success')
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = image
    a.download = `comic-page-${Date.now()}.png`
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
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative overflow-hidden transition-all duration-300"
        style={{
          aspectRatio: "832/1216", // Portrait comic page ratio
          border: '6px solid white',
          borderRadius: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 2px rgba(0,0,0,0.8)',
          background: '#0a0118',
          transform: isHovered ? 'translateY(-4px)' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: 'linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%)' }}>
            <div className="loading-dream-dust mb-6">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="relative w-24 h-24 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#comicGradient)" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${progress * 2.51} 251`}
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
                <defs>
                  <linearGradient id="comicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.purple} />
                    <stop offset="100%" stopColor={colors.cyan} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white/80">{Math.round(progress)}%</span>
              </div>
            </div>
            <p className="text-base text-white/60 font-medium">Creating your comic page...</p>
            <p className="text-sm text-white/40 mt-2">This may take up to a minute</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && !image && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8" style={{ background: 'linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%)' }}>
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-base text-white/60 mb-6 text-center">{error}</p>
            <button
              onClick={generate}
              className="px-6 py-3 rounded-full text-base font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}
            >
              Retry Generation
            </button>
          </div>
        )}

        {/* Generated Comic Page */}
        {!loading && image && (
          <>
            <Image
              src={image}
              alt="Generated comic page"
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
              unoptimized
            />

            {/* Hover overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-200 z-10 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button onClick={handleDownload} className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                    ↓ Save Comic
                  </button>
                  <button onClick={handleCopy} className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                    Copy
                  </button>
                  <button onClick={generate} className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-80 transition-opacity" style={{ background: `linear-gradient(90deg, ${colors.purple}, ${colors.cyan})` }}>
                    ↻ Regenerate
                  </button>
                  <button onClick={handleDelete} className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/40 text-red-100 hover:bg-red-500/60 transition-colors">
                    ✕ Delete
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !image && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8" style={{ background: 'linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%)' }}>
            <div className="text-6xl mb-4 opacity-60">📚</div>
            <p className="text-lg text-white/60 text-center mb-2 font-medium">Marvel-Style Comic Page</p>
            <p className="text-sm text-white/40 text-center mb-6">{scenes.length} panels will be generated</p>
            <button
              onClick={generate}
              className="px-6 py-3 rounded-full text-base font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}
            >
              Generate Comic Page
            </button>
          </div>
        )}
      </div>

      {/* Scene descriptions below the comic */}
      {scenes.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Scenes</h4>
          <div className="grid gap-2">
            {scenes.map((scene, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}>
                  {i + 1}
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
