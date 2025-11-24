"use client"

import { useState } from 'react'
import Image from 'next/image'
import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'

export type PublicDream = {
  id: string
  userId: string
  username: string
  avatar?: string
  dreamText: string
  panels: Array<{
    id: string
    imageUrl: string
    description: string
  }>
  style: string
  mood: string
  createdAt: string
  reactions: {
    like: number
    wow: number
    scary: number
    funny: number
  }
  comments: number
  isFollowing?: boolean
}

interface PublicGalleryProps {
  dreams: PublicDream[]
  onReact?: (dreamId: string, reaction: keyof PublicDream['reactions']) => void
  onFollow?: (userId: string) => void
  onComment?: (dreamId: string) => void
  currentUserId?: string
}

const REACTION_EMOJIS = {
  like: '❤️',
  wow: '😮',
  scary: '😱',
  funny: '😂',
}

export default function PublicGallery({ 
  dreams, 
  onReact, 
  onFollow, 
  onComment,
  currentUserId 
}: PublicGalleryProps) {
  const [selectedDream, setSelectedDream] = useState<string | null>(null)
  const [filter, setFilter] = useState<'trending' | 'recent' | 'following'>('trending')

  const filteredDreams = dreams // Would filter based on 'filter' state in real implementation

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>
            🌟 Dream Gallery
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            Explore dreams shared by the community
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: colors.surface }}>
          {(['trending', 'recent', 'following'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: filter === tab ? colors.purple : 'transparent',
                color: filter === tab ? colors.white : colors.textSecondary,
              }}
            >
              {tab === 'trending' && '🔥 '}
              {tab === 'recent' && '🕐 '}
              {tab === 'following' && '👥 '}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dreams Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDreams.map(dream => (
          <Card 
            key={dream.id} 
            className="overflow-hidden group cursor-pointer"
            interactive
            padding="p-0"
            onClick={() => setSelectedDream(selectedDream === dream.id ? null : dream.id)}
          >
            {/* Panel Preview */}
            <div className="relative aspect-video">
              {dream.panels[0]?.imageUrl ? (
                <Image
                  src={dream.panels[0].imageUrl}
                  alt={dream.panels[0].description}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: gradients.card }}
                >
                  <span className="text-4xl">💭</span>
                </div>
              )}
              
              {/* Panel count badge */}
              {dream.panels.length > 1 && (
                <div 
                  className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(0,0,0,0.7)', color: colors.white }}
                >
                  {dream.panels.length} panels
                </div>
              )}

              {/* Style badge */}
              <div 
                className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs"
                style={{ background: colors.purple, color: colors.white }}
              >
                {dream.style}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* User info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: colors.surface }}
                  >
                    {dream.avatar || '👤'}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {dream.username}
                    </p>
                    <p className="text-xs" style={{ color: colors.textMuted }}>
                      {new Date(dream.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Follow button */}
                {dream.userId !== currentUserId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onFollow?.(dream.userId)
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: dream.isFollowing ? colors.surface : colors.purple,
                      color: dream.isFollowing ? colors.textSecondary : colors.white,
                      border: `1px solid ${dream.isFollowing ? colors.border : colors.purple}`,
                    }}
                  >
                    {dream.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              {/* Dream text preview */}
              <p className="text-sm line-clamp-2" style={{ color: colors.textSecondary }}>
                {dream.dreamText}
              </p>

              {/* Reactions */}
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: colors.border }}>
                <div className="flex gap-1">
                  {Object.entries(dream.reactions).map(([type, count]) => (
                    <button
                      key={type}
                      onClick={(e) => {
                        e.stopPropagation()
                        onReact?.(dream.id, type as keyof PublicDream['reactions'])
                      }}
                      className="px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-all hover:scale-110"
                      style={{ background: colors.surface }}
                    >
                      {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]}
                      {count > 0 && <span style={{ color: colors.textMuted }}>{count}</span>}
                    </button>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onComment?.(dream.id)
                  }}
                  className="text-xs flex items-center gap-1"
                  style={{ color: colors.textMuted }}
                >
                  💬 {dream.comments}
                </button>
              </div>
            </div>

            {/* Expanded view - show all panels */}
            {selectedDream === dream.id && dream.panels.length > 1 && (
              <div className="p-4 pt-0 space-y-2">
                <p className="text-xs font-medium" style={{ color: colors.textMuted }}>
                  All panels:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {dream.panels.slice(1).map(panel => (
                    <div key={panel.id} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={panel.imageUrl}
                        alt={panel.description}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredDreams.length === 0 && (
        <Card className="text-center py-12">
          <span className="text-4xl mb-4 block">🌙</span>
          <p className="font-medium" style={{ color: colors.textPrimary }}>
            No public dreams yet
          </p>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            Be the first to share your dream with the community!
          </p>
        </Card>
      )}
    </div>
  )
}
