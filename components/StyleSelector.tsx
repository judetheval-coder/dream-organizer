"use client"

import React from 'react'

export type GenerationStyle = 'comic' | 'realistic' | 'cartoon' | 'abstract' | 'watercolor' | 'oil'

interface StyleSelectorProps {
  onStyleChange: (style: GenerationStyle) => void
  currentStyle: GenerationStyle
  darkMode?: boolean
}

const STYLES = [
  {
    id: 'comic',
    name: 'Comic Book',
    description: 'Bold outlines, vibrant colors',
    emoji: '💥',
    prompt: 'comic book style, graphic novel, ink illustration, bold linework, halftone dots, vibrant colors'
  },
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Photo-realistic rendering',
    emoji: '📸',
    prompt: 'photorealistic, highly detailed, professional photography, cinematic lighting, 8k quality'
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    description: 'Animated style art',
    emoji: '🎨',
    prompt: 'cartoon style, animated, colorful, playful, Disney-like, hand-drawn, smooth shading'
  },
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Surreal, dreamlike art',
    emoji: '✨',
    prompt: 'abstract surreal art, dreamlike, ethereal, flowing colors, impressionistic, conceptual'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, flowing watercolor',
    emoji: '🌊',
    prompt: 'watercolor painting, soft watercolors, flowing brushstrokes, wet paper effect, artistic'
  },
  {
    id: 'oil',
    name: 'Oil Painting',
    description: 'Classical oil painting',
    emoji: '🖼️',
    prompt: 'oil painting, classical art style, textured brushstrokes, masterpiece, museum quality'
  }
]

export function getStylePrompt(style: GenerationStyle): string {
  const styleObj = STYLES.find(s => s.id === style)
  return styleObj?.prompt || STYLES[0].prompt
}

export default function StyleSelector({ onStyleChange, currentStyle, darkMode = true }: StyleSelectorProps) {
  return (
    <div className={`p-6 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        🎨 Generation Style
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id as GenerationStyle)}
            className={`p-4 rounded-lg border-2 transition-all ${
              currentStyle === style.id
                ? darkMode
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-purple-500 bg-purple-100'
                : darkMode
                ? 'border-slate-700 bg-slate-700 hover:border-slate-600'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            }`}
          >
            <div className="text-2xl mb-2">{style.emoji}</div>
            <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {style.name}
            </p>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {style.description}
            </p>
          </button>
        ))}
      </div>

      {/* Current style info */}
      <div className={`mt-4 p-4 rounded text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
        <p className={`font-bold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
          Current Style: {STYLES.find(s => s.id === currentStyle)?.name}
        </p>
        <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
          {STYLES.find(s => s.id === currentStyle)?.description}
        </p>
      </div>
    </div>
  )
}
