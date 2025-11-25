"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'
import { 
  fetchPublicDreams, 
  reactToDream, 
  followUser, 
  unfollowUser, 
  getFollowing,
  type PublicDream,
  type ReactionType
} from '@/lib/social'

interface PublicGalleryProps {
  initialDreams?: PublicDream[]
}

const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '❤️',
  love: '😍',
  wow: '😮',
  dream: '🌙',
  insightful: '💡',
}

export default function PublicGallery({ initialDreams = [] }: PublicGalleryProps) {
  const { user } = useUser()
  const currentUserId = user?.id
  
  const [dreams, setDreams] = useState<PublicDream[]>(initialDreams)
  const [selectedDream, setSelectedDream] = useState<string | null>(null)
  const [filter, setFilter] = useState<'trending' | 'recent' | 'following'>('trending')
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState<string[]>([])

  // Load public dreams on mount
  useEffect(() => {
    const loadDreams = async () => {
      setLoading(true)
      const publicDreams = await fetchPublicDreams()
      if (publicDreams.length > 0) {
        setDreams(publicDreams)
      }
      setLoading(false)
    }
    loadDreams()
  }, [])

  // Load following list
  useEffect(() => {
    if (currentUserId) {
      getFollowing(currentUserId).then(setFollowing)
    }
  }, [currentUserId])

  // Update dreams with following status
  useEffect(() => {
    setDreams(prev => prev.map(d => ({
      ...d,
      isFollowing: following.includes(d.userId)
    })))
  }, [following])

  const handleReact = async (dreamId: string, reaction: ReactionType) => {
    if (!currentUserId) return
    const result = await reactToDream(dreamId, currentUserId, reaction)
    if (result.success) {
      setDreams(prev => prev.map(d => {
        if (d.id === dreamId) {
          return {
            ...d,
            reactions: {
              ...d.reactions,
              [reaction]: d.reactions[reaction] + 1
            }
          }
        }
        return d
      }))
    }
  }

  const handleFollow = async (userId: string) => {
    if (!currentUserId) return
    const isCurrentlyFollowing = following.includes(userId)
    
    if (isCurrentlyFollowing) {
      const result = await unfollowUser(currentUserId, userId)
      if (result.success) {
        setFollowing(prev => prev.filter(id => id !== userId))
      }
    } else {
      const result = await followUser(currentUserId, userId)
      if (result.success) {
        setFollowing(prev => [...prev, userId])
      }
    }
  }

  const handleComment = (dreamId: string) => {
    alert(`Comments for dream ${dreamId} coming soon!`)
  }

  const filteredDreams = dreams.filter(d => {
    if (filter === 'following') return following.includes(d.userId)
    return true
  }).sort((a, b) => {
    if (filter === 'trending') {
      const aScore = Object.values(a.reactions).reduce((sum, v) => sum + v, 0)
      const bScore = Object.values(b.reactions).reduce((sum, v) => sum + v, 0)
      return bScore - aScore
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

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
                      handleFollow(dream.userId)
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
                        handleReact(dream.id, type as ReactionType)
                      }}
                      className="px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-all hover:scale-110"
                      style={{ background: colors.surface }}
                    >
                      {REACTION_EMOJIS[type as ReactionType]}
                      {count > 0 && <span style={{ color: colors.textMuted }}>{count}</span>}
                    </button>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleComment(dream.id)
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
