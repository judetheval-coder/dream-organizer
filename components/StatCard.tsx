"use client"

import React from 'react'
import { colors } from '@/lib/design'

interface Props {
  icon: string
  label: string
  value: string | number
  trend?: string
  color?: 'purple' | 'cyan' | 'pink'
}

export default function StatCard({ icon, label, value, trend, color = 'purple' }: Props) {
  const colorMap = {
    purple: { from: colors.purple, to: colors.purpleLight },
    cyan: { from: colors.cyan, to: colors.cyanLight },
    pink: { from: colors.pink, to: '#f472b6' }
  }

  const selectedColor = colorMap[color]

  return (
    <div
      className="p-6 rounded-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-105"
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${selectedColor.from}10 0%, ${selectedColor.to}10 100%)`
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          {trend && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ 
              background: `${colors.backgroundDark}`,
              color: colors.cyan 
            }}>
              {trend}
            </span>
          )}
        </div>
        
        <div className="text-3xl font-bold mb-1" style={{ 
          color: colors.textPrimary 
        }}>
          {value}
        </div>
        
        <div className="text-sm" style={{ color: colors.textMuted }}>
          {label}
        </div>
      </div>
    </div>
  )
}
