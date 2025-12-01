"use client"

import { colors } from '@/lib/design'

export type FrameStyle = 'minimal' | 'classic' | 'comic' | 'glow' | 'neon'

interface FrameStyleSelectorProps {
  value: FrameStyle
  onChange: (style: FrameStyle) => void
  className?: string
}

const FRAME_OPTIONS: { value: FrameStyle; label: string; icon: string }[] = [
  { value: 'minimal', label: 'Clean', icon: '◻️' },
  { value: 'classic', label: 'Classic', icon: '🖼️' },
  { value: 'comic', label: 'Comic', icon: '💥' },
  { value: 'glow', label: 'Glow', icon: '✨' },
  { value: 'neon', label: 'Neon', icon: '💎' },
]

export default function FrameStyleSelector({ value, onChange, className = '' }: FrameStyleSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {FRAME_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className="px-3 py-1.5 rounded-md transition-all text-xs font-medium"
          style={{
            background: value === option.value ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)',
            color: value === option.value ? colors.purple : colors.textMuted,
            border: `1px solid ${value === option.value ? 'rgba(124, 58, 237, 0.4)' : 'transparent'}`,
          }}
        >
          <span className="mr-1">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  )
}
