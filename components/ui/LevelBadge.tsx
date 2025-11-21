"use client"
import React from 'react'
import { colors, radii, gradients } from '../../lib/design'
import { PlayerStats } from '../../lib/xp-system'

interface Props { stats?: PlayerStats | null }

export const LevelBadge: React.FC<Props> = ({ stats }) => {
  if (!stats) return null
  const pct = ((stats.totalXP % 100) / 100) * 100
  return (
    <div
      className="flex items-center gap-3 pl-3 pr-4 py-2 rounded-xl relative"
      style={{
        background: 'linear-gradient(135deg, rgba(43,25,90,0.8) 0%, rgba(18,12,40,0.85) 100%)',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 0 0 1px rgba(0,255,240,0.15), 0 8px 28px -6px rgba(0,0,0,0.55)'
      }}
    >
      <span className="text-lg leading-none">⭐</span>
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] font-bold tracking-wide" style={{ color: colors.cyan }}>Level {stats.level}</span>
        <span className="text-[10px] font-medium" style={{ color: colors.textMuted }}>{stats.totalXP} XP</span>
        <div className="mt-1 h-1 w-24 rounded-full overflow-hidden bg-[#1b1f29]">
          <div
            className="h-full"
            style={{ width: pct + '%', background: 'linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%)', transition: 'width .4s ease' }}
          />
        </div>
      </div>
    </div>
  )
}

export default LevelBadge

