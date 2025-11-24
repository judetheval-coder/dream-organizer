"use client"

import React from 'react'
import { colors } from '@/lib/design'

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', text: 'text-xl' },
    md: { container: 'w-12 h-12', text: 'text-3xl' },
    lg: { container: 'w-16 h-16', text: 'text-4xl' }
  }

  return (
    <div className="flex items-center gap-3">
      <div 
        className={`${sizes[size].container} rounded-xl flex items-center justify-center relative overflow-hidden group cursor-pointer`}
        style={{
          background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
          boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <span className={`${sizes[size].text} relative z-10`}>💭</span>
      </div>
      {size !== 'sm' && (
        <div>
          <h1 
            className="text-2xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`
            }}
          >
            Dream Machine
          </h1>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Your Dream Canvas
          </p>
        </div>
      )}
    </div>
  )
}
