"use client"

import { useState, useMemo } from 'react'
import { colors } from '@/lib/design'
import { GLOBAL_DREAM_PATTERNS, findPatternMatches } from '@/lib/global-dream-patterns'
import Card from '@/components/ui/Card'

interface GlobalPatternsProps {
  userDreams?: string[]  // Array of user's dream texts to compare
}

export default function GlobalPatterns({ userDreams = [] }: GlobalPatternsProps) {
  const [showAll, setShowAll] = useState(false)

  // Find patterns that match user's dreams
  const userMatches = useMemo(() => {
    const matchCounts = new Map<string, number>()
    
    for (const dream of userDreams) {
      const matches = findPatternMatches(dream)
      for (const match of matches) {
        matchCounts.set(match.symbol, (matchCounts.get(match.symbol) || 0) + 1)
      }
    }
    
    return matchCounts
  }, [userDreams])

  const displayPatterns = showAll 
    ? GLOBAL_DREAM_PATTERNS 
    : GLOBAL_DREAM_PATTERNS.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>
          🌍 Global Dream Patterns
        </h2>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
          See how your dreams compare to dreamers worldwide
        </p>
      </div>

      {/* User comparison summary */}
      {userDreams.length > 0 && userMatches.size > 0 && (
        <Card className="space-y-3" style={{ background: `linear-gradient(135deg, ${colors.purple}20, ${colors.cyan}20)` }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-semibold" style={{ color: colors.textPrimary }}>
                Your dreams match {userMatches.size} global patterns!
              </p>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Based on {userDreams.length} dream{userDreams.length > 1 ? 's' : ''} analyzed
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Array.from(userMatches.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([symbol, count]) => {
                const pattern = GLOBAL_DREAM_PATTERNS.find(p => p.symbol === symbol)
                return (
                  <div 
                    key={symbol}
                    className="px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                    style={{ background: colors.purple, color: colors.white }}
                  >
                    <span>{pattern?.emoji}</span>
                    <span>{symbol}</span>
                    {count > 1 && (
                      <span className="text-xs opacity-75">×{count}</span>
                    )}
                  </div>
                )
              })
            }
          </div>
        </Card>
      )}

      {/* Patterns list */}
      <div className="space-y-3">
        {displayPatterns.map((pattern, index) => {
          const userHasThis = userMatches.has(pattern.symbol)
          const userCount = userMatches.get(pattern.symbol) || 0

          return (
            <div 
              key={pattern.symbol}
              className={`p-4 rounded-xl border transition-all ${userHasThis ? 'ring-2' : ''}`}
              style={{ 
                background: colors.surface,
                borderColor: colors.border,
                ...(userHasThis && { ringColor: colors.purple })
              }}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ 
                    background: index < 3 ? colors.purple : colors.surface,
                    color: index < 3 ? colors.white : colors.textMuted,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {index + 1}
                </div>

                {/* Emoji */}
                <span className="text-2xl">{pattern.emoji}</span>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: colors.textPrimary }}>
                      {pattern.symbol}
                    </span>
                    {userHasThis && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: colors.purple, color: colors.white }}
                      >
                        You too! {userCount > 1 ? `(${userCount}×)` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: colors.textMuted }}>
                    {pattern.category}
                    {pattern.funFact && ` • ${pattern.funFact}`}
                  </p>
                </div>

                {/* Percentage bar */}
                <div className="w-32">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: colors.textMuted }}>of dreamers</span>
                    <span className="font-bold" style={{ color: colors.cyan }}>
                      {pattern.percentage}%
                    </span>
                  </div>
                  <div 
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: colors.border }}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pattern.percentage}%`,
                        background: userHasThis 
                          ? `linear-gradient(90deg, ${colors.purple}, ${colors.cyan})`
                          : colors.cyan
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show more button */}
      {!showAll && GLOBAL_DREAM_PATTERNS.length > 10 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-80"
          style={{ 
            background: colors.surface,
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`
          }}
        >
          Show all {GLOBAL_DREAM_PATTERNS.length} patterns
        </button>
      )}

      {/* Did you know section */}
      <Card>
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: colors.textPrimary }}>
          💡 Did you know?
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 rounded-lg" style={{ background: `${colors.purple}15` }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              We spend about <strong style={{ color: colors.purple }}>6 years</strong> of our lives dreaming
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `${colors.cyan}15` }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              You forget <strong style={{ color: colors.cyan }}>95%</strong> of dreams within 10 minutes of waking
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `${colors.pink}15` }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              <strong style={{ color: colors.pink }}>Blind people</strong> dream with other senses like sound and touch
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `${colors.purple}15` }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              On average, you have <strong style={{ color: colors.purple }}>4-6 dreams</strong> per night
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
