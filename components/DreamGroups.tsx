"use client"

import { useState } from 'react'
import { colors, gradients } from '@/lib/design'
import { Card, Chip, Button, EmptyState } from '@/components/ui/primitives'
import { DEFAULT_GROUPS, type DreamGroup } from '@/lib/mock-data'

export default function DreamGroups({ groups = DEFAULT_GROUPS, onJoin, onLeave, onCreate, onViewGroup }: { groups?: DreamGroup[]; onJoin?: (id: string) => void; onLeave?: (id: string) => void; onCreate?: () => void; onViewGroup?: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'joined' | 'suggested'>('all')
  const [search, setSearch] = useState('')

  const filtered = groups.filter(g => {
    if (filter === 'joined' && !g.isJoined) return false
    if (filter === 'suggested' && g.isJoined) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const joinedCount = groups.filter(g => g.isJoined).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>👥 Dream Groups</h2>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Join communities of dreamers with shared interests</p>
        </div>
        <Button onClick={onCreate}>+ Create Group</Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        {[{ value: joinedCount, label: 'Groups Joined', color: colors.purple }, { value: groups.length, label: 'Available', color: colors.cyan }].map(s => (
          <div key={s.label} className="px-4 py-2 rounded-xl" style={{ background: colors.surface }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: colors.textMuted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-4 py-3 pl-10 rounded-xl border outline-none" style={{ background: colors.surface, borderColor: colors.border, color: colors.textPrimary }} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">🔍</span>
        </div>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: colors.surface }}>
          {(['all', 'joined', 'suggested'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize" style={{ background: filter === t ? colors.purple : 'transparent', color: filter === t ? colors.white : colors.textSecondary }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(g => (
          <Card key={g.id} className="overflow-hidden cursor-pointer" interactive padding="p-0" onClick={() => onViewGroup?.(g.id)}>
            <div className="h-20 relative" style={{ background: g.coverGradient || gradients.card }}>
              <span className="absolute bottom-2 left-4 text-3xl">{g.emoji}</span>
              {g.isPrivate && <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(0,0,0,0.5)', color: colors.white }}>🔒 Private</span>}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold" style={{ color: colors.textPrimary }}>{g.name}</h3>
                <p className="text-sm line-clamp-2 mt-1" style={{ color: colors.textSecondary }}>{g.description}</p>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
                <span>👥 {g.memberCount.toLocaleString()} members</span>
                <span>📝 {g.postCount.toLocaleString()} posts</span>
              </div>
              {g.recentActivity && <p className="text-xs" style={{ color: colors.textMuted }}>Active {g.recentActivity}</p>}
              <button onClick={e => { e.stopPropagation(); g.isJoined ? onLeave?.(g.id) : onJoin?.(g.id) }} className="w-full py-2 rounded-xl font-medium transition-all" style={{ background: g.isJoined ? colors.surface : colors.purple, color: g.isJoined ? colors.textSecondary : colors.white, border: `1px solid ${g.isJoined ? colors.border : colors.purple}` }}>
                {g.isJoined ? '✓ Joined' : 'Join Group'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon="👥" title={filter === 'joined' ? "You haven't joined any groups yet" : 'No groups found'} description={filter === 'joined' ? 'Explore groups and join communities that interest you!' : 'Try a different search term'} />
      )}

      {/* CTA */}
      <Card className="text-center py-8" style={{ background: `linear-gradient(135deg, ${colors.purple}20, ${colors.cyan}20)` }}>
        <span className="text-3xl mb-3 block">✨</span>
        <p className="font-medium" style={{ color: colors.textPrimary }}>Can&apos;t find your community?</p>
        <p className="text-sm mt-1 mb-4" style={{ color: colors.textMuted }}>Create your own dream group and invite others!</p>
        <Button onClick={onCreate}>Create a Group</Button>
      </Card>
    </div>
  )
}
