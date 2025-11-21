"use client"

import React from 'react'
import { colors, shadows } from '@/lib/design'

interface Props {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon = '✨', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div 
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{
          background: `${colors.surface}`,
          border: `2px dashed ${colors.border}`,
        }}
      >
        <span className="text-5xl opacity-50">{icon}</span>
      </div>
      
      <h3 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
        {title}
      </h3>
      
      <p className="text-base max-w-md mb-6" style={{ color: colors.textMuted }}>
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purpleLight} 100%)`,
            color: colors.white,
            boxShadow: shadows.glow,
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
