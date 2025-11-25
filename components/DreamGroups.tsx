"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { colors, gradients } from '@/lib/design'
import { Card, Chip, Button, EmptyState } from '@/components/ui/primitives'
import { DEFAULT_GROUPS, type DreamGroup } from '@/lib/mock-data'
import { joinGroup, leaveGroup, getJoinedGroups, createGroup } from '@/lib/social'

export default function DreamGroups({ groups: initialGroups = DEFAULT_GROUPS }: { groups?: DreamGroup[] }) {
  const { user } = useUser()
  const userId = user?.id || 'anonymous'
  
  const [groups, setGroups] = useState<DreamGroup[]>(initialGroups)
  const [filter, setFilter] = useState<'all' | 'joined' | 'suggested'>('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', emoji: '✨', isPrivate: false, category: 'general' })

  // Load joined status from local storage
  useEffect(() => {
    const joinedIds = getJoinedGroups(userId)
    setGroups(prev => prev.map(g => ({ ...g, isJoined: joinedIds.includes(g.id) })))
  }, [userId])

  const handleJoin = (groupId: string) => {
    const result = joinGroup(groupId, userId)
    if (result.success) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isJoined: true, memberCount: g.memberCount + 1 } : g))
    }
  }

  const handleLeave = (groupId: string) => {
    const result = leaveGroup(groupId, userId)
    if (result.success) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isJoined: false, memberCount: Math.max(0, g.memberCount - 1) } : g))
    }
  }

  const handleCreate = () => {
    if (!newGroup.name.trim()) return
    const created = createGroup({
      name: newGroup.name,
      description: newGroup.description,
      emoji: newGroup.emoji,
      isPrivate: newGroup.isPrivate,
      category: newGroup.category,
      coverGradient: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
    }, userId)
    setGroups(prev => [created, ...prev])
    setShowCreateModal(false)
    setNewGroup({ name: '', description: '', emoji: '✨', isPrivate: false, category: 'general' })
  }

  const handleViewGroup = (groupId: string) => {
    // In a full implementation, this would navigate to the group page
    alert(`Viewing group ${groupId} - Group pages coming soon!`)
  }

  const filtered = groups.filter(g => {
    if (filter === 'joined' && !g.isJoined) return false
    if (filter === 'suggested' && g.isJoined) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const joinedCount = groups.filter(g => g.isJoined).length

  return (
    <div className="space-y-6">
      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ background: colors.surface, border: `2px solid ${colors.purple}` }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Create a Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-2xl" style={{ color: colors.textMuted }}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Group Name</label>
                <input type="text" value={newGroup.name} onChange={e => setNewGroup(prev => ({ ...prev, name: e.target.value }))} placeholder="Lucid Dreamers Unite" className="w-full px-4 py-3 rounded-xl border outline-none" style={{ background: colors.background, borderColor: colors.border, color: colors.textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Description</label>
                <textarea value={newGroup.description} onChange={e => setNewGroup(prev => ({ ...prev, description: e.target.value }))} placeholder="A community for..." rows={3} className="w-full px-4 py-3 rounded-xl border outline-none resize-none" style={{ background: colors.background, borderColor: colors.border, color: colors.textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Emoji</label>
                <input type="text" value={newGroup.emoji} onChange={e => setNewGroup(prev => ({ ...prev, emoji: e.target.value }))} maxLength={2} className="w-20 px-4 py-3 rounded-xl border outline-none text-center text-2xl" style={{ background: colors.background, borderColor: colors.border }} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newGroup.isPrivate} onChange={e => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))} className="w-5 h-5 rounded" />
                <span style={{ color: colors.textSecondary }}>Make this group private</span>
              </label>
              <Button onClick={handleCreate} className="w-full">Create Group</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>👥 Dream Groups</h2>
          <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Join communities of dreamers with shared interests</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>+ Create Group</Button>
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
          <Card key={g.id} className="overflow-hidden cursor-pointer" interactive padding="p-0" onClick={() => handleViewGroup(g.id)}>
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
              <button onClick={e => { e.stopPropagation(); g.isJoined ? handleLeave(g.id) : handleJoin(g.id) }} className="w-full py-2 rounded-xl font-medium transition-all" style={{ background: g.isJoined ? colors.surface : colors.purple, color: g.isJoined ? colors.textSecondary : colors.white, border: `1px solid ${g.isJoined ? colors.border : colors.purple}` }}>
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
        <Button onClick={() => setShowCreateModal(true)}>Create a Group</Button>
      </Card>
    </div>
  )
}
