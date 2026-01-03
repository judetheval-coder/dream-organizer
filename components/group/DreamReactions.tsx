'use client'

import { useState } from 'react'
import { colors } from '@/lib/design'

interface DreamReactionsProps {
  postId: string
  initialReactions: Record<string, number>
  userReactions: string[]
  onReact: (reactionType: string) => Promise<void>
}

const DREAM_REACTIONS = [
  { type: 'soaring', emoji: '🪽', label: 'Soaring', color: '#8B5CF6' },
  { type: 'haunting', emoji: '🌙', label: 'Haunting', color: '#6366F1' },
  { type: 'lucid', emoji: '🔮', label: 'Lucid', color: '#EC4899' },
  { type: 'familiar', emoji: '💭', label: 'Familiar', color: '#06B6D4' },
  { type: 'intense', emoji: '⚡', label: 'Intense', color: '#F59E0B' },
]

export default function DreamReactions({ postId, initialReactions, userReactions, onReact }: DreamReactionsProps) {
  const [reactions, setReactions] = useState<Record<string, number>>(initialReactions)
  const [activeReactions, setActiveReactions] = useState<Set<string>>(new Set(userReactions))
  const [hovered, setHovered] = useState<string | null>(null)

  const handleReaction = async (reactionType: string) => {
    const isActive = activeReactions.has(reactionType)
    
    setReactions(prev => ({
      ...prev,
      [reactionType]: Math.max(0, (prev[reactionType] || 0) + (isActive ? -1 : 1))
    }))
    
    if (isActive) {
      setActiveReactions(prev => {
        const next = new Set(prev)
        next.delete(reactionType)
        return next
      })
    } else {
      setActiveReactions(prev => new Set(prev).add(reactionType))
    }

    await onReact(reactionType)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {DREAM_REACTIONS.map((reaction) => {
        const count = reactions[reaction.type] || 0
        const isActive = activeReactions.has(reaction.type)
        const isHovered = hovered === reaction.type

        return (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            onMouseEnter={() => setHovered(reaction.type)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              isActive ? 'scale-110' : 'hover:scale-105'
            }`}
            style={{
              background: isActive 
                ? `${reaction.color}40` 
                : isHovered 
                  ? `${reaction.color}20` 
                  : 'rgba(255, 255, 255, 0.05)',
              border: `2px solid ${isActive ? reaction.color : 'transparent'}`,
              color: isActive ? reaction.color : colors.textSecondary,
              boxShadow: isActive ? `0 0 20px ${reaction.color}40` : 'none'
            }}
          >
            <span className="text-xl">{reaction.emoji}</span>
            <span className="text-sm">{reaction.label}</span>
            {count > 0 && (
              <span 
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${reaction.color}30`, color: reaction.color }}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

