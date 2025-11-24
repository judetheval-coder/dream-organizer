"use client"

import { useState } from 'react'
import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'

export type DreamGroup = {
  id: string
  name: string
  description: string
  emoji: string
  memberCount: number
  postCount: number
  isJoined: boolean
  isPrivate: boolean
  category: 'lucid' | 'nightmare' | 'recurring' | 'creative' | 'analysis' | 'beginners' | 'custom'
  recentActivity?: string
  coverGradient?: string
}

// Default dream groups
export const DEFAULT_GROUPS: DreamGroup[] = [
  {
    id: 'lucid-dreamers',
    name: 'Lucid Dreamers',
    description: 'Master the art of conscious dreaming. Share techniques, experiences, and tips.',
    emoji: '✨',
    memberCount: 2847,
    postCount: 1203,
    isJoined: false,
    isPrivate: false,
    category: 'lucid',
    recentActivity: '2 hours ago',
    coverGradient: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
  },
  {
    id: 'nightmare-club',
    name: 'Nightmare Club',
    description: 'A safe space to share and process scary dreams. Turn nightmares into art.',
    emoji: '👻',
    memberCount: 1523,
    postCount: 892,
    isJoined: false,
    isPrivate: false,
    category: 'nightmare',
    recentActivity: '5 hours ago',
    coverGradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)',
  },
  {
    id: 'recurring-dreams',
    name: 'Recurring Dreams',
    description: 'Explore patterns in dreams that keep coming back. What are they trying to tell us?',
    emoji: '🔄',
    memberCount: 1891,
    postCount: 756,
    isJoined: false,
    isPrivate: false,
    category: 'recurring',
    recentActivity: '1 day ago',
    coverGradient: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
  },
  {
    id: 'creative-dreamers',
    name: 'Creative Dreamers',
    description: 'Artists, writers, and creators inspired by their dreams. Share your dream-based art!',
    emoji: '🎨',
    memberCount: 3201,
    postCount: 2104,
    isJoined: false,
    isPrivate: false,
    category: 'creative',
    recentActivity: '30 minutes ago',
    coverGradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
  },
  {
    id: 'dream-analysis',
    name: 'Dream Analysis',
    description: 'Deep dive into dream interpretation. Psychology enthusiasts welcome!',
    emoji: '🔍',
    memberCount: 2156,
    postCount: 1567,
    isJoined: false,
    isPrivate: false,
    category: 'analysis',
    recentActivity: '4 hours ago',
    coverGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  },
  {
    id: 'dream-beginners',
    name: 'Dream Beginners',
    description: 'New to dream journaling? Start here! Friendly community for newcomers.',
    emoji: '🌱',
    memberCount: 4521,
    postCount: 3892,
    isJoined: false,
    isPrivate: false,
    category: 'beginners',
    recentActivity: '1 hour ago',
    coverGradient: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)',
  },
]

interface DreamGroupsProps {
  groups?: DreamGroup[]
  onJoin?: (groupId: string) => void
  onLeave?: (groupId: string) => void
  onCreate?: () => void
  onViewGroup?: (groupId: string) => void
}

export default function DreamGroups({ 
  groups = DEFAULT_GROUPS, 
  onJoin, 
  onLeave,
  onCreate,
  onViewGroup 
}: DreamGroupsProps) {
  const [filter, setFilter] = useState<'all' | 'joined' | 'suggested'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredGroups = groups.filter(group => {
    if (filter === 'joined' && !group.isJoined) return false
    if (filter === 'suggested' && group.isJoined) return false
    if (searchQuery && !group.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const joinedCount = groups.filter(g => g.isJoined).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>
            👥 Dream Groups
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            Join communities of dreamers with shared interests
          </p>
        </div>

        <button
          onClick={onCreate}
          className="px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
          style={{ 
            background: gradients.button,
            color: colors.white,
          }}
        >
          + Create Group
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="px-4 py-2 rounded-xl" style={{ background: colors.surface }}>
          <p className="text-2xl font-bold" style={{ color: colors.purple }}>{joinedCount}</p>
          <p className="text-xs" style={{ color: colors.textMuted }}>Groups Joined</p>
        </div>
        <div className="px-4 py-2 rounded-xl" style={{ background: colors.surface }}>
          <p className="text-2xl font-bold" style={{ color: colors.cyan }}>{groups.length}</p>
          <p className="text-xs" style={{ color: colors.textMuted }}>Available</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-xl border outline-none transition-all focus:ring-2"
            style={{
              background: colors.surface,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
        </div>

        <div className="flex gap-2 p-1 rounded-xl" style={{ background: colors.surface }}>
          {(['all', 'joined', 'suggested'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                background: filter === tab ? colors.purple : 'transparent',
                color: filter === tab ? colors.white : colors.textSecondary,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map(group => (
          <Card 
            key={group.id}
            className="overflow-hidden cursor-pointer"
            interactive
            padding="p-0"
            onClick={() => onViewGroup?.(group.id)}
          >
            {/* Cover */}
            <div 
              className="h-20 relative"
              style={{ background: group.coverGradient || gradients.card }}
            >
              <span className="absolute bottom-2 left-4 text-3xl">{group.emoji}</span>
              {group.isPrivate && (
                <span 
                  className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: 'rgba(0,0,0,0.5)', color: colors.white }}
                >
                  🔒 Private
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                  {group.name}
                </h3>
                <p className="text-sm line-clamp-2 mt-1" style={{ color: colors.textSecondary }}>
                  {group.description}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
                <span>👥 {group.memberCount.toLocaleString()} members</span>
                <span>📝 {group.postCount.toLocaleString()} posts</span>
              </div>

              {/* Activity */}
              {group.recentActivity && (
                <p className="text-xs" style={{ color: colors.textMuted }}>
                  Active {group.recentActivity}
                </p>
              )}

              {/* Join button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (group.isJoined) {
                    onLeave?.(group.id)
                  } else {
                    onJoin?.(group.id)
                  }
                }}
                className="w-full py-2 rounded-xl font-medium transition-all"
                style={{
                  background: group.isJoined ? colors.surface : colors.purple,
                  color: group.isJoined ? colors.textSecondary : colors.white,
                  border: `1px solid ${group.isJoined ? colors.border : colors.purple}`,
                }}
              >
                {group.isJoined ? '✓ Joined' : 'Join Group'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredGroups.length === 0 && (
        <Card className="text-center py-12">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="font-medium" style={{ color: colors.textPrimary }}>
            {filter === 'joined' ? 'You haven\'t joined any groups yet' : 'No groups found'}
          </p>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
            {filter === 'joined' 
              ? 'Explore groups and join communities that interest you!' 
              : 'Try a different search term'}
          </p>
        </Card>
      )}

      {/* Create group CTA */}
      <Card className="text-center py-8" style={{ background: `linear-gradient(135deg, ${colors.purple}20, ${colors.cyan}20)` }}>
        <span className="text-3xl mb-3 block">✨</span>
        <p className="font-medium" style={{ color: colors.textPrimary }}>
          Can&apos;t find your community?
        </p>
        <p className="text-sm mt-1 mb-4" style={{ color: colors.textMuted }}>
          Create your own dream group and invite others!
        </p>
        <button
          onClick={onCreate}
          className="px-6 py-2 rounded-xl font-medium transition-all hover:scale-105"
          style={{ 
            background: colors.purple,
            color: colors.white,
          }}
        >
          Create a Group
        </button>
      </Card>
    </div>
  )
}
