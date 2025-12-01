"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useDreams } from '@/hooks/useDreams'
import { colors, gradients } from '@/lib/design'
import { Card, Button, EmptyState } from '@/components/ui/primitives'
import UpgradePrompt from '@/components/UpgradePrompt'
import { DEFAULT_GROUPS, type DreamGroup } from '@/lib/mock-data'
import { joinGroup, leaveGroup, getJoinedGroups, createGroup } from '@/lib/social'

export default function DreamGroups({ groups: initialGroups = DEFAULT_GROUPS }: { groups?: DreamGroup[] }) {
  const { user } = useUser()
  const userId = user?.id || ''
  const { userTier } = useDreams()

  const [groups, setGroups] = useState<DreamGroup[]>(initialGroups)
  const [filter, setFilter] = useState<'all' | 'joined' | 'suggested'>('all')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', description: '', emoji: '✨', isPrivate: false, category: 'general' })

  // Load joined status from Supabase
  useEffect(() => {
    if (!userId) return
    getJoinedGroups(userId).then(joinedIds => {
      setGroups(prev => prev.map(g => ({ ...g, isJoined: joinedIds.includes(g.id) })))
    })
  }, [userId])

  const handleJoin = async (groupId: string) => {
    const result = await joinGroup(groupId, userId)
    if (result.success) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isJoined: true, memberCount: g.memberCount + 1 } : g))
    }
  }

  const handleLeave = async (groupId: string) => {
    const result = await leaveGroup(groupId, userId)
    if (result.success) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, isJoined: false, memberCount: Math.max(0, g.memberCount - 1) } : g))
    }
  }

  const handleCreate = async () => {
    if (!newGroup.name.trim()) return
    // Ensure signed-in and premium tier
    if (!userId) {
      // User must be signed in - modal won't open without auth
      return
    }
    if (userTier !== 'premium') {
      setShowCreateModal(false)
      setShowUpgradePrompt(true)
      return
    }

    const result = await createGroup({
      name: newGroup.name,
      description: newGroup.description,
      category: newGroup.category,
      isPrivate: newGroup.isPrivate,
    }, userId)

    if (result.success && result.group) {
      setGroups(prev => [result.group!, ...prev])
      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', emoji: '✨', isPrivate: false, category: 'general' })
    }
  }

  const handleViewGroup = (_groupId: string) => {
    // Group detail pages will be implemented in a future release
    // For now, clicking a group card shows join/leave button
  }

  const filtered = groups.filter(g => {
    if (filter === 'joined' && !g.isJoined) return false
    if (filter === 'suggested' && g.isJoined) return false
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const joinedCount = groups.filter(g => g.isJoined).length
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-extrabold" style={{ color: colors.textPrimary }}>Groups</h2>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full shadow-sm text-sm font-semibold" style={{ background: colors.surface, color: colors.textPrimary }}>✓ Joined {joinedCount}</div>
          <Button onClick={() => {
            if (!user) {
              // User needs to sign in - button should be hidden for non-auth users
              return
            }
            if (userTier !== 'premium') {
              setShowUpgradePrompt(true)
              return
            }
            setShowCreateModal(true)
          }} className="text-sm font-semibold px-4 py-2 rounded-full">Create</Button>
        </div>
      </div>
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} className="w-full px-5 py-3 pl-12 rounded-2xl border outline-none text-base font-medium" style={{ background: colors.surface, borderColor: colors.border, color: colors.textPrimary }} />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
        </div>
        <div className="flex gap-2 p-1 rounded-2xl shadow-sm" style={{ background: colors.surface }}>
          {(['all', 'joined', 'suggested'] as const).map(t => (
            <button key={t} onClick={() => setFilter(t)} className={`px-5 py-2 rounded-xl text-base font-semibold transition-all capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 ${filter === t ? 'shadow bg-gradient-to-r from-[#5B2CFC] to-[#8A2BE2] text-white scale-[1.04]' : 'text-[#B0B0B0] hover:text-white hover:bg-[rgba(255,255,255,0.07)] hover:scale-[1.02]'}`} style={{ background: filter === t ? colors.purple : 'transparent', color: filter === t ? colors.white : colors.textSecondary }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g) => (
          <Card key={g.id} className="overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all" interactive padding="p-0" onClick={() => handleViewGroup(g.id)}>
            <div className="h-24 relative" style={{ background: g.coverGradient || gradients.card }}>
              <span className="absolute bottom-3 left-6 text-4xl">{g.emoji}</span>
              {g.isPrivate ? <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow" style={{ background: 'rgba(0,0,0,0.5)', color: colors.white }}>🔒 Private</span> : null}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-lg tracking-tight" style={{ color: colors.textPrimary }}>{g.name}</h3>
                <p className="text-base line-clamp-2 mt-1 font-medium" style={{ color: colors.textSecondary }}>{g.description}</p>
              </div>
              <div className="flex items-center gap-6 text-sm font-medium" style={{ color: colors.textMuted }}>
                <span>👥 {g.memberCount.toLocaleString()} members</span>
                <span>💭 {g.postCount.toLocaleString()} posts</span>
              </div>
              {g.recentActivity ? <p className="text-xs" style={{ color: colors.textMuted }}>Active {g.recentActivity}</p> : null}
              <button onClick={(e) => { e.stopPropagation(); if (g.isJoined) handleLeave(g.id); else handleJoin(g.id); }} className={`w-full py-3 rounded-2xl font-bold text-base transition-all shadow-sm ${g.isJoined ? 'bg-[rgba(255,255,255,0.04)] text-[#B0B0B0] border border-[#8A2BE2]' : 'bg-gradient-to-r from-[#5B2CFC] to-[#8A2BE2] text-white border-none hover:scale-[1.02]'}`}>
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
      <Card className="text-center py-12 rounded-3xl shadow-xl" style={{ background: `linear-gradient(135deg, ${colors.purple}20, ${colors.cyan}20)` }}>
        <span className="text-4xl mb-4 block">✨</span>
        <p className="font-extrabold text-lg" style={{ color: colors.textPrimary }}>Can&apos;t find your community?</p>
        <p className="text-base mt-1 mb-5 font-medium" style={{ color: colors.textMuted }}>Create your own dream group and invite others!</p>
        <Button onClick={() => {
          if (!user) { return } // User needs to sign in
          if (userTier !== 'premium') { setShowUpgradePrompt(true); return }
          setShowCreateModal(true)
        }} className="text-lg font-bold px-6 py-3 rounded-2xl shadow">Create a Group</Button>
      </Card>

      {/* Create Modal */}
      {showCreateModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="create-group-title" className="relative z-50 w-full max-w-md">
            <Card className="p-6">
              <h3 id="create-group-title" className="font-extrabold text-lg mb-2">Create a Group</h3>
              <div className="space-y-3">
                <input value={newGroup.name} onChange={e => setNewGroup(prev => ({ ...prev, name: e.target.value }))} placeholder="Group name" className="w-full p-3 rounded-xl border" style={{ background: colors.surface, borderColor: colors.border }} />
                <input value={newGroup.description} onChange={e => setNewGroup(prev => ({ ...prev, description: e.target.value }))} placeholder="Short description" className="w-full p-3 rounded-xl border" style={{ background: colors.surface, borderColor: colors.border }} />
                <div className="flex gap-3 items-center">
                  <input value={newGroup.emoji} onChange={e => setNewGroup(prev => ({ ...prev, emoji: e.target.value }))} className="w-16 p-3 rounded-xl text-center" />
                  <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={newGroup.isPrivate} onChange={e => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))} /> Private</label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setShowCreateModal(false)} className="px-4 py-2">Cancel</Button>
                  <Button onClick={() => handleCreate()} className="px-4 py-2 font-bold">Create</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
      {showUpgradePrompt && (
        <UpgradePrompt currentTier={userTier} onClose={() => setShowUpgradePrompt(false)} />
      )}
    </div>
  )
}
