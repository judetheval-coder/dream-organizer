"use client"

import { colors } from '@/lib/design'

export type FrameStyle = 'classic' | 'torn' | 'fade' | 'comic' | 'glow'

interface FrameStyleSelectorProps {
  value: FrameStyle
  onChange: (style: FrameStyle) => void
  className?: string
}

const FRAME_OPTIONS: { value: FrameStyle; label: string; icon: string; description: string }[] = [
  { value: 'glow', label: 'Glow', icon: '✨', description: 'Subtle purple glow' },
  { value: 'classic', label: 'Classic', icon: '🖼️', description: 'Simple border' },
  { value: 'comic', label: 'Comic', icon: '💥', description: 'Bold with shadow' },
  { value: 'fade', label: 'Fade', icon: '🌫️', description: 'Soft edges' },
  { value: 'torn', label: 'Torn', icon: '📜', description: 'Rough edges' },
]

export default function FrameStyleSelector({ value, onChange, className = '' }: FrameStyleSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {FRAME_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-2 rounded-lg transition-all hover:scale-105
            flex items-center gap-2 text-sm font-medium
          `}
          style={{
            background: value === option.value ? colors.purple : colors.surface,
            color: value === option.value ? colors.white : colors.textMuted,
            border: `1px solid ${value === option.value ? colors.purple : colors.border}`,
            boxShadow: value === option.value ? `0 0 15px ${colors.purple}40` : 'none',
          }}
          title={option.description}
        >
          <span>{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
