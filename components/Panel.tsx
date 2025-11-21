"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { colors, shadows, radii, typography } from "@/lib/design"
import { optimizePromptForDalle } from "@/lib/gpt-helpers"

type PanelProps = {
  description: string
  style: string
  mood: string
  onImageReady?: (url: string) => void
  generateDelay?: number
  shouldGenerate?: boolean
  image?: string
}

export default function Panel({ description, style, mood, onImageReady, generateDelay = 0, shouldGenerate = true, image: initialImage = "" }: PanelProps) {
  const [image, setImage] = useState<string>(initialImage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)

  // Extract scene number from description (e.g., "Dream text - Scene 1" -> "Scene 1")
  const sceneMatch = description.match(/Scene \d+/)
  const sceneLabel = sceneMatch ? sceneMatch[0] : "Scene"

  const IMAGE_STORE_KEY = "dream-organizer-panel-images"

  useEffect(() => {
    // If we have an initial image, use it and don't load from storage
    if (initialImage) {
      setImage(initialImage)
      onImageReady?.(initialImage)
      return
    }

    // Otherwise try to load from localStorage
    try {
      const store = JSON.parse(localStorage.getItem(IMAGE_STORE_KEY) || "{}")
      const key = `${description}-${style}-${mood}`
      if (store[key]) {
        setImage(store[key])
        onImageReady?.(store[key])
      }
    } catch {}
  }, [initialImage, description, style, mood, onImageReady])

  const persistImage = (img: string) => {
    try {
      const store = JSON.parse(localStorage.getItem(IMAGE_STORE_KEY) || "{}")
      const key = `${description}-${style}-${mood}`
      store[key] = img
      localStorage.setItem(IMAGE_STORE_KEY, JSON.stringify(store))
    } catch {}
  }

  const generateImage = async () => {
    if (!description || loading) return

    setLoading(true)
    setError("")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 10, 90))
    }, 800)

    try {
      // Use the optimized prompt API to get a clean, beautiful comic-style prompt
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

      // Don't clear loading state - keep image displayed
      setLoading(false)
      setProgress(0)
    } catch (e: any) {
      clearInterval(interval)
      setProgress(0)
      setLoading(false)
      setError(e.message || "Generation failed")
      console.error("Panel generation error:", e)
    }
  }

  useEffect(() => {
    if (!image && !loading && description && shouldGenerate) {
      const timer = setTimeout(() => {
        generateImage()
      }, generateDelay)
      return () => clearTimeout(timer)
    }
  }, [shouldGenerate])

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "2/1", minHeight: '300px' }}>
      {loading && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
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
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          style={{ background: colors.backgroundDark }}
        >
          <p className="text-4xl mb-4"></p>
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
          <Image
            src={image}
            alt={description}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-xl"
            unoptimized
            priority
          />

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl">
            <button
              onClick={generateImage}
              className="px-4 py-2 font-semibold rounded-lg transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purpleLight} 100%)`,
                color: colors.white,
                boxShadow: shadows.glow,
              }}
            >
               Regenerate
            </button>
          </div>
        </div>
      )}

      {!loading && !image && !error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
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
             Generate
          </button>
        </div>
      )}
    </div>
  )
}
