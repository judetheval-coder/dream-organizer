"use client"

import { useState, useEffect } from 'react'
import { useDevMode } from '@/hooks/useDevMode'
import { useToast } from '@/contexts/ToastContext'
import { Button } from './ui/primitives'

interface DevPanelProps {
  onClose?: () => void
}

type DevTab = 'data' | 'debug' | 'system' | 'logs' | 'social' | 'groups' | 'contests' | 'media' | 'simulation' | 'analytics' | 'challenges' | 'users' | 'badges' | 'database'

interface Challenge {
  id: string
  prompt: string
  style: string
  mood: string
  challenge_date: string
  bonus_xp?: number
  winner_id?: string
  submission_count?: number
}

interface User {
  id: string
  email: string
  subscription_tier: string
  dreams_count: number
  actual_dreams_count?: number
  panels_count?: number
  created_at: string
}

interface Badge {
  id: string
  name: string
  description: string
  rarity: string
  emoji: string
}

export function DevPanel({ onClose }: DevPanelProps) {
  const { unlocked, unlock } = useDevMode()
  const { showToast } = useToast()
  const [secret, setSecret] = useState('')
  const [activeTab, setActiveTab] = useState<DevTab>('data')
  const [logs, setLogs] = useState<string[]>([
    '[INFO] Dev console initialized',
    '[INFO] Ready for commands'
  ])
  const [confirmClear, setConfirmClear] = useState(false)
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [groupForm, setGroupForm] = useState({ name: '', description: '', emoji: '✨', isPrivate: false, category: 'general' })
  const [contests, setContests] = useState<any[]>([])
  const [contestForm, setContestForm] = useState({ title: '', description: '', rules: '', prize_info: '', start_date: '', end_date: '', status: 'draft' })
  const [media, setMedia] = useState<any[]>([])
  const [mediaForm, setMediaForm] = useState({ user_id: '', title: '', description: '', media_url: '', media_type: 'image', is_featured: false })
  const [fakeUsers, setFakeUsers] = useState<any[]>([])
  const [fakeUserForm, setFakeUserForm] = useState({ username: '', display_name: '', bio: '', profile_pic_url: '', follower_count: 0, post_count: 0 })
  const [stats, setStats] = useState<Record<string, any>>({})

  // NEW: Challenge management state
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengeForm, setChallengeForm] = useState({ prompt: '', style: 'Arcane', mood: 'Mysterious', challenge_date: '', bonus_xp: 100 })
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])

  // NEW: User management state
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userDetails, setUserDetails] = useState<any>(null)

  // NEW: Badge management state
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [badgeStats, setBadgeStats] = useState<any>({})
  const [selectedBadgeUser, setSelectedBadgeUser] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')

  // NEW: Database health state
  const [dbHealth, setDbHealth] = useState<any>(null)

  const loadGroups = async () => {
    try {
      const res = await fetch('/api/dev_7c29/groups')
      const data = await res.json()
      if (res.ok) {
        setGroups(data.groups || [])
        addLog(`Loaded ${data.groups?.length || 0} groups`)
      } else {
        showToast(data.error || 'Failed to load groups', 'error')
      }
    } catch (err) {
      showToast('Error loading groups', 'error')
      addLog(`Error loading groups: ${err}`)
    }
  }

  const loadContests = async () => {
    try {
      const res = await fetch('/api/dev_7c29/contests')
      const data = await res.json()
      if (res.ok) {
        setContests(data.contests || [])
        addLog(`Loaded ${data.contests?.length || 0} contests`)
      } else {
        showToast(data.error || 'Failed to load contests', 'error')
      }
    } catch (err) {
      showToast('Error loading contests', 'error')
      addLog(`Error loading contests: ${err}`)
    }
  }

  const loadMedia = async () => {
    try {
      const res = await fetch('/api/dev_7c29/media')
      const data = await res.json()
      if (res.ok) {
        setMedia(data.media || [])
        addLog(`Loaded ${data.media?.length || 0} media items`)
      } else {
        showToast(data.error || 'Failed to load media', 'error')
      }
    } catch (err) {
      showToast('Error loading media', 'error')
      addLog(`Error loading media: ${err}`)
    }
  }

  const loadFakeUsers = async () => {
    try {
      const res = await fetch('/api/dev_7c29/simulation')
      const data = await res.json()
      if (res.ok) {
        setFakeUsers(data.fakeUsers || [])
        addLog(`Loaded ${data.fakeUsers?.length || 0} fake users`)
      } else {
        showToast(data.error || 'Failed to load fake users', 'error')
      }
    } catch (err) {
      showToast('Error loading fake users', 'error')
      addLog(`Error loading fake users: ${err}`)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/dev_7c29/analytics')
      const data = await res.json()
      if (res.ok) {
        setStats(data.stats || {})
        addLog('Loaded analytics stats')
      } else {
        showToast(data.error || 'Failed to load stats', 'error')
      }
    } catch (err) {
      showToast('Error loading stats', 'error')
      addLog(`Error loading stats: ${err}`)
    }
  }

  // NEW: Load challenges
  const loadChallenges = async () => {
    try {
      const res = await fetch('/api/dev_7c29/challenges')
      const data = await res.json()
      if (res.ok) {
        setChallenges(data.challenges || [])
        addLog(`Loaded ${data.challenges?.length || 0} challenges`)
      } else {
        showToast(data.error || 'Failed to load challenges', 'error')
      }
    } catch (err) {
      showToast('Error loading challenges', 'error')
      addLog(`Error loading challenges: ${err}`)
    }
  }

  // NEW: Load challenge submissions
  const loadSubmissions = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/dev_7c29/challenges/submissions?challenge_id=${challengeId}`)
      const data = await res.json()
      if (res.ok) {
        setSubmissions(data.submissions || [])
        addLog(`Loaded ${data.submissions?.length || 0} submissions`)
      } else {
        showToast(data.error || 'Failed to load submissions', 'error')
      }
    } catch (err) {
      showToast('Error loading submissions', 'error')
    }
  }

  // NEW: Load users
  const loadUsers = async (search = '') => {
    try {
      const res = await fetch(`/api/dev_7c29/users?search=${encodeURIComponent(search)}`)
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users || [])
        addLog(`Loaded ${data.users?.length || 0} users`)
      } else {
        showToast(data.error || 'Failed to load users', 'error')
      }
    } catch (err) {
      showToast('Error loading users', 'error')
    }
  }

  // NEW: Load user details
  const loadUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/dev_7c29/users/details?id=${userId}`)
      const data = await res.json()
      if (res.ok) {
        setUserDetails(data)
        addLog(`Loaded details for user ${data.user?.email || userId}`)
      } else {
        showToast(data.error || 'Failed to load user details', 'error')
      }
    } catch (err) {
      showToast('Error loading user details', 'error')
    }
  }

  // NEW: Load badges and stats
  const loadBadges = async () => {
    try {
      const [badgesRes, statsRes] = await Promise.all([
        fetch('/api/dev_7c29/badges'),
        fetch('/api/dev_7c29/badges?action=stats')
      ])
      const badgesData = await badgesRes.json()
      const statsData = await statsRes.json()

      if (badgesRes.ok) setAllBadges(badgesData.badges || [])
      if (statsRes.ok) setBadgeStats(statsData)
      addLog('Loaded badges and stats')
    } catch (err) {
      showToast('Error loading badges', 'error')
    }
  }

  // NEW: Load database health
  const loadDbHealth = async () => {
    try {
      const res = await fetch('/api/dev_7c29/database')
      const data = await res.json()
      setDbHealth(data)
      addLog(`Database health: ${data.status}`)
    } catch (err) {
      showToast('Error checking database health', 'error')
    }
  }

  // Auto-load data when tabs change
  useEffect(() => {
    if (unlocked) {
      if (activeTab === 'challenges') loadChallenges()
      if (activeTab === 'users') loadUsers()
      if (activeTab === 'badges') loadBadges()
      if (activeTab === 'database') loadDbHealth()
    }
  }, [activeTab, unlocked])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  if (!unlocked) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-white mb-4 text-lg font-semibold">🔒 Developer Access</h3>
          <p className="text-gray-300 mb-4 text-sm">
            This area is restricted to authorized developers only.
          </p>
          <input
            type="password"
            placeholder="Enter authorization code"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="mb-3 p-3 bg-gray-800 text-white rounded border border-gray-600 w-full focus:border-purple-500 focus:outline-none"
            aria-label="Developer authorization code"
          />
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                setIsAuthorizing(true)
                try {
                  const trimmed = secret.trim()
                  addLog(`Attempting unlock with secret length=${trimmed.length}`)
                  const result = await unlock(trimmed)
                  if (result.success) {
                    showToast('Developer mode unlocked!', 'success')
                    addLog('Developer access granted')
                  } else {
                    const errText = result.error || 'Invalid authorization code'
                    // If server returned HTML (e.g., a dev error page), show a friendly message and log the full body
                    const looksLikeHtml = typeof errText === 'string' && errText.trim().startsWith('<')
                    if (looksLikeHtml) {
                      showToast('Unlock failed: server returned HTML.', 'error')
                      addLog('Failed authorization attempt: server returned non-JSON response (HTML)')
                      // Suppress console.error for expected HTML error
                    } else {
                      showToast(errText, 'error')
                      addLog(`Failed authorization attempt: ${errText}`)
                    }
                  }
                } catch (err) {
                  // Surface unexpected errors to the user and log
                  const msg = err instanceof Error ? err.message : String(err)
                  showToast(`Unlock failed: ${msg}`, 'error')
                  addLog(`Unlock error: ${msg}`)
                  // Also write to console to help debugging in dev tools
                  // eslint-disable-next-line no-console
                  console.error('[DevPanel] unlock error', err)
                } finally {
                  setIsAuthorizing(false)
                }
              }}
              className="flex-1"
              disabled={isAuthorizing}
            >
              {isAuthorizing ? 'Authorizing…' : 'Authorize'}
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="secondary" className="px-4">
                ✕
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-white text-lg font-semibold">🛠️ Developer Console</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 overflow-x-auto">
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'data' as DevTab, label: '📊 Data' },
              { key: 'challenges' as DevTab, label: '🎯 Challenges' },
              { key: 'users' as DevTab, label: '👤 Users' },
              { key: 'badges' as DevTab, label: '🏅 Badges' },
              { key: 'database' as DevTab, label: '🗄️ Database' },
              { key: 'debug' as DevTab, label: '🔧 Debug' },
              { key: 'system' as DevTab, label: '⚙️ System' },
              { key: 'logs' as DevTab, label: '📝 Logs' },
              { key: 'social' as DevTab, label: '👥 Social' },
              { key: 'groups' as DevTab, label: '🏘️ Groups' },
              { key: 'contests' as DevTab, label: '🏆 Contests' },
              { key: 'media' as DevTab, label: '🖼️ Media' },
              { key: 'simulation' as DevTab, label: '🤖 Sim' },
              { key: 'analytics' as DevTab, label: '📈 Stats' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors whitespace-nowrap ${activeTab === key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 min-h-[400px]">
          {activeTab === 'data' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Data Management</h4>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/dev_7c29/seed', { method: 'POST' })
                      const payload = await res.json().catch(() => undefined)
                      if (res.ok) {
                        showToast('Fake data seeded successfully!', 'success')
                        addLog(`Seeded fake user/dream data (inserted: users=${payload?.inserted?.users?.length ?? 0}, dreams=${payload?.inserted?.dreams?.length ?? 0}, panels=${payload?.inserted?.panels?.length ?? 0})`)
                      } else {
                        const err = payload?.errors || payload?.error || 'Seeding failed'
                        showToast('Seeding failed', 'error')
                        addLog(`Failed to seed fake data: ${JSON.stringify(err)}`)
                      }
                    } catch {
                      showToast('Seeding failed', 'error')
                      addLog('Failed to seed fake data (exception)')
                    }
                  }}
                  className="w-full justify-start"
                  aria-label="Seed fake data"
                >
                  🌱 Seed Fake Data
                </Button>
                <Button
                  onClick={async () => {
                    // Use inline confirm to avoid native confirm() blocking.
                    setConfirmClear(true)
                  }}
                  variant="danger"
                  className="w-full justify-start"
                  aria-label="Clear fake data"
                >
                  🗑️ Clear Fake Data
                </Button>
                {confirmClear && (
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-sm text-gray-300">Confirm clear fake data?</span>
                    <Button onClick={async () => {
                      try {
                        const res = await fetch('/api/dev_7c29/seed/clear', { method: 'POST' })
                        const payload = await res.json().catch(() => undefined)
                        if (res.ok) {
                          showToast('Fake data cleared', 'success')
                          addLog('Cleared fake data')
                        } else {
                          showToast('Failed to clear fake data', 'error')
                          addLog(`Failed to clear fake data: ${JSON.stringify(payload?.errors || payload?.error || 'unknown')}`)
                        }
                      } catch {
                        showToast('Failed to clear fake data', 'error')
                        addLog('Failed to clear fake data (exception)')
                      }
                      setConfirmClear(false)
                    }} variant="danger" className="px-3">Yes</Button>
                    <Button onClick={() => setConfirmClear(false)} variant="secondary" className="px-3">Cancel</Button>
                  </div>
                )}
                <Button
                  onClick={() => {
                    // TODO: Export data
                    showToast('Export data - Not implemented yet', 'info')
                    addLog('Attempted to export data (not implemented)')
                  }}
                  className="w-full justify-start"
                >
                  📤 Export Data
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'debug' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Debug Tools</h4>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => {
                    localStorage.clear()
                    showToast('Local storage cleared', 'success')
                    addLog('Cleared local storage')
                  }}
                  className="w-full justify-start"
                >
                  🧹 Clear Local Storage
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Toggle feature flags
                    showToast('Feature flags - Not implemented yet', 'info')
                    addLog('Attempted to toggle feature flags (not implemented)')
                  }}
                  className="w-full justify-start"
                >
                  🚩 Feature Flags
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Mock API responses
                    showToast('Mock APIs - Not implemented yet', 'info')
                    addLog('Attempted to enable mock APIs (not implemented)')
                  }}
                  className="w-full justify-start"
                >
                  🎭 Mock APIs
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">System Info</h4>
              <div className="bg-gray-800 rounded p-3 font-mono text-sm text-gray-300">
                <div>🖥️ User Agent: {navigator.userAgent.slice(0, 50)}...</div>
                <div>🌐 Online: {navigator.onLine ? 'Yes' : 'No'}</div>
                <div>📱 Screen: {window.innerWidth}x{window.innerHeight}</div>
                <div>🕒 Time: {new Date().toLocaleString()}</div>
                <div>🔑 Dev Mode: Active</div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => {
                    window.location.reload()
                    addLog('Forced page reload')
                  }}
                  className="w-full justify-start"
                >
                  🔄 Force Reload
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Performance metrics
                    showToast('Performance metrics - Not implemented yet', 'info')
                    addLog('Attempted to show performance metrics (not implemented)')
                  }}
                  className="w-full justify-start"
                >
                  📈 Performance
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Activity Logs</h4>
              <div className="bg-black rounded p-3 font-mono text-sm text-green-400 max-h-64 overflow-y-auto" role="status" aria-live="polite">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))}
              </div>
              <Button
                onClick={() => setLogs([`[${new Date().toLocaleTimeString()}] Logs cleared`])}
                variant="secondary"
                className="w-full justify-start"
              >
                🧹 Clear Logs
              </Button>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Social Ecosystem Control</h4>
              <p className="text-gray-300">Manage all social features of the platform.</p>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => setActiveTab('groups')} className="justify-start">👥 Groups</Button>
                <Button onClick={() => setActiveTab('contests')} className="justify-start">🏆 Contests</Button>
                <Button onClick={() => setActiveTab('media')} className="justify-start">🖼️ Media</Button>
                <Button onClick={() => setActiveTab('simulation')} className="justify-start">🤖 Simulation</Button>
                <Button onClick={() => setActiveTab('analytics')} className="justify-start">📈 Analytics</Button>
              </div>
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Groups Management</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Group name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <textarea
                  placeholder="Description"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Emoji"
                  value={groupForm.emoji}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, emoji: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={groupForm.isPrivate}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="mr-2"
                  />
                  Private Group
                </label>
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/dev_7c29/groups', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(groupForm)
                      })
                      const data = await res.json()
                      if (res.ok) {
                        showToast('Group created successfully!', 'success')
                        addLog(`Created group: ${data.group.name}`)
                        setGroupForm({ name: '', description: '', emoji: '✨', isPrivate: false, category: 'general' })
                        // Reload groups
                        loadGroups()
                      } else {
                        showToast(data.error || 'Failed to create group', 'error')
                        addLog(`Failed to create group: ${data.error}`)
                      }
                    } catch (err) {
                      showToast('Error creating group', 'error')
                      addLog(`Error creating group: ${err}`)
                    }
                  }}
                  className="w-full"
                  disabled={!groupForm.name.trim()}
                >
                  Create Group
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-gray-300">Existing Groups</h5>
                  <Button
                    onClick={async () => {
                      await loadGroups()
                    }}
                    size="sm"
                  >
                    Load Groups
                  </Button>
                </div>
                <div className="bg-gray-800 rounded p-2 max-h-40 overflow-y-auto">
                  {groups.length === 0 ? (
                    <div className="text-sm text-gray-400">No groups loaded</div>
                  ) : (
                    groups.map((group: any) => (
                      <div key={group.id} className="flex justify-between items-center py-1 border-b border-gray-700 last:border-b-0">
                        <span className="text-sm text-white">{group.emoji} {group.name}</span>
                        <Button
                          onClick={async () => {
                            if (confirm('Delete this group?')) {
                              try {
                                const res = await fetch('/api/dev_7c29/groups', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: group.id })
                                })
                                const data = await res.json()
                                if (res.ok) {
                                  showToast('Group deleted', 'success')
                                  addLog(`Deleted group: ${group.name}`)
                                  loadGroups()
                                } else {
                                  showToast(data.error || 'Failed to delete', 'error')
                                }
                              } catch (err) {
                                showToast('Error deleting group', 'error')
                              }
                            }
                          }}
                          size="sm"
                          variant="secondary"
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contests' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Contests Management</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Contest title"
                  value={contestForm.title}
                  onChange={(e) => setContestForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <textarea
                  placeholder="Description"
                  value={contestForm.description}
                  onChange={(e) => setContestForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                  rows={2}
                />
                <textarea
                  placeholder="Rules"
                  value={contestForm.rules}
                  onChange={(e) => setContestForm(prev => ({ ...prev, rules: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Prize info"
                  value={contestForm.prize_info}
                  onChange={(e) => setContestForm(prev => ({ ...prev, prize_info: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="datetime-local"
                    placeholder="Start date"
                    value={contestForm.start_date}
                    onChange={(e) => setContestForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="p-2 bg-gray-800 text-white rounded border border-gray-600"
                  />
                  <input
                    type="datetime-local"
                    placeholder="End date"
                    value={contestForm.end_date}
                    onChange={(e) => setContestForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="p-2 bg-gray-800 text-white rounded border border-gray-600"
                  />
                </div>
                <select
                  value={contestForm.status}
                  onChange={(e) => setContestForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/dev_7c29/contests', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(contestForm)
                      })
                      const data = await res.json()
                      if (res.ok) {
                        showToast('Contest created successfully!', 'success')
                        addLog(`Created contest: ${data.contest.title}`)
                        setContestForm({ title: '', description: '', rules: '', prize_info: '', start_date: '', end_date: '', status: 'draft' })
                        loadContests()
                      } else {
                        showToast(data.error || 'Failed to create contest', 'error')
                        addLog(`Failed to create contest: ${data.error}`)
                      }
                    } catch (err) {
                      showToast('Error creating contest', 'error')
                      addLog(`Error creating contest: ${err}`)
                    }
                  }}
                  className="w-full"
                  disabled={!contestForm.title.trim()}
                >
                  Create Contest
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-gray-300">Existing Contests</h5>
                  <Button onClick={loadContests} size="sm">Load Contests</Button>
                </div>
                <div className="bg-gray-800 rounded p-2 max-h-40 overflow-y-auto">
                  {contests.length === 0 ? (
                    <div className="text-sm text-gray-400">No contests loaded</div>
                  ) : (
                    contests.map((contest: any) => (
                      <div key={contest.id} className="flex justify-between items-center py-1 border-b border-gray-700 last:border-b-0">
                        <div className="text-sm text-white">
                          <div>{contest.title}</div>
                          <div className="text-gray-400">{contest.status}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={async () => {
                              const newStatus = contest.status === 'active' ? 'ended' : 'active'
                              try {
                                const res = await fetch('/api/dev_7c29/contests', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: contest.id, status: newStatus })
                                })
                                const data = await res.json()
                                if (res.ok) {
                                  showToast(`Contest ${newStatus}`, 'success')
                                  addLog(`Set contest ${contest.title} to ${newStatus}`)
                                  loadContests()
                                } else {
                                  showToast(data.error || 'Failed to update', 'error')
                                }
                              } catch (err) {
                                showToast('Error updating contest', 'error')
                              }
                            }}
                            size="sm"
                          >
                            {contest.status === 'active' ? 'End' : 'Activate'}
                          </Button>
                          <Button
                            onClick={async () => {
                              if (confirm('Delete this contest?')) {
                                try {
                                  const res = await fetch('/api/dev_7c29/contests', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: contest.id })
                                  })
                                  const data = await res.json()
                                  if (res.ok) {
                                    showToast('Contest deleted', 'success')
                                    addLog(`Deleted contest: ${contest.title}`)
                                    loadContests()
                                  } else {
                                    showToast(data.error || 'Failed to delete', 'error')
                                  }
                                } catch (err) {
                                  showToast('Error deleting contest', 'error')
                                }
                              }
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Media Control</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="User ID (leave empty for admin)"
                  value={mediaForm.user_id}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, user_id: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Title"
                  value={mediaForm.title}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <textarea
                  placeholder="Description"
                  value={mediaForm.description}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                  rows={2}
                />
                <input
                  type="url"
                  placeholder="Media URL"
                  value={mediaForm.media_url}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, media_url: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <select
                  value={mediaForm.media_type}
                  onChange={(e) => setMediaForm(prev => ({ ...prev, media_type: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                </select>
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={mediaForm.is_featured}
                    onChange={(e) => setMediaForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="mr-2"
                  />
                  Featured
                </label>
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/dev_7c29/media', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(mediaForm)
                      })
                      const data = await res.json()
                      if (res.ok) {
                        showToast('Media uploaded successfully!', 'success')
                        addLog(`Uploaded media: ${data.media.title}`)
                        setMediaForm({ user_id: '', title: '', description: '', media_url: '', media_type: 'image', is_featured: false })
                        loadMedia()
                      } else {
                        showToast(data.error || 'Failed to upload media', 'error')
                        addLog(`Failed to upload media: ${data.error}`)
                      }
                    } catch (err) {
                      showToast('Error uploading media', 'error')
                      addLog(`Error uploading media: ${err}`)
                    }
                  }}
                  className="w-full"
                  disabled={!mediaForm.media_url.trim()}
                >
                  Upload Media
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-gray-300">Public Media</h5>
                  <Button onClick={loadMedia} size="sm">Load Media</Button>
                </div>
                <div className="bg-gray-800 rounded p-2 max-h-40 overflow-y-auto">
                  {media.length === 0 ? (
                    <div className="text-sm text-gray-400">No media loaded</div>
                  ) : (
                    media.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-1 border-b border-gray-700 last:border-b-0">
                        <div className="text-sm text-white">
                          <div>{item.title || 'Untitled'}</div>
                          <div className="text-gray-400">{item.media_type} • {item.is_featured ? 'Featured' : 'Regular'}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={async () => {
                              const newFeatured = !item.is_featured
                              try {
                                const res = await fetch('/api/dev_7c29/media', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: item.id, is_featured: newFeatured })
                                })
                                const data = await res.json()
                                if (res.ok) {
                                  showToast(`Media ${newFeatured ? 'featured' : 'unfeatured'}`, 'success')
                                  addLog(`${newFeatured ? 'Featured' : 'Unfeatured'} media: ${item.title}`)
                                  loadMedia()
                                } else {
                                  showToast(data.error || 'Failed to update', 'error')
                                }
                              } catch (err) {
                                showToast('Error updating media', 'error')
                              }
                            }}
                            size="sm"
                          >
                            {item.is_featured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <Button
                            onClick={async () => {
                              if (confirm('Delete this media?')) {
                                try {
                                  const res = await fetch('/api/dev_7c29/media', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: item.id })
                                  })
                                  const data = await res.json()
                                  if (res.ok) {
                                    showToast('Media deleted', 'success')
                                    addLog(`Deleted media: ${item.title}`)
                                    loadMedia()
                                  } else {
                                    showToast(data.error || 'Failed to delete', 'error')
                                  }
                                } catch (err) {
                                  showToast('Error deleting media', 'error')
                                }
                              }
                            }}
                            size="sm"
                            variant="secondary"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Simulation Tools</h4>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={fakeUserForm.username}
                  onChange={(e) => setFakeUserForm(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={fakeUserForm.display_name}
                  onChange={(e) => setFakeUserForm(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <textarea
                  placeholder="Bio"
                  value={fakeUserForm.bio}
                  onChange={(e) => setFakeUserForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                  rows={2}
                />
                <input
                  type="url"
                  placeholder="Profile Picture URL"
                  value={fakeUserForm.profile_pic_url}
                  onChange={(e) => setFakeUserForm(prev => ({ ...prev, profile_pic_url: e.target.value }))}
                  className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Follower Count"
                    value={fakeUserForm.follower_count}
                    onChange={(e) => setFakeUserForm(prev => ({ ...prev, follower_count: parseInt(e.target.value) || 0 }))}
                    className="p-2 bg-gray-800 text-white rounded border border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Post Count"
                    value={fakeUserForm.post_count}
                    onChange={(e) => setFakeUserForm(prev => ({ ...prev, post_count: parseInt(e.target.value) || 0 }))}
                    className="p-2 bg-gray-800 text-white rounded border border-gray-600"
                  />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/dev_7c29/simulation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fakeUserForm)
                      })
                      const data = await res.json()
                      if (res.ok) {
                        showToast('Fake user created successfully!', 'success')
                        addLog(`Created fake user: ${data.fakeUser.username}`)
                        setFakeUserForm({ username: '', display_name: '', bio: '', profile_pic_url: '', follower_count: 0, post_count: 0 })
                        loadFakeUsers()
                      } else {
                        showToast(data.error || 'Failed to create fake user', 'error')
                        addLog(`Failed to create fake user: ${data.error}`)
                      }
                    } catch (err) {
                      showToast('Error creating fake user', 'error')
                      addLog(`Error creating fake user: ${err}`)
                    }
                  }}
                  className="w-full"
                  disabled={!fakeUserForm.username.trim()}
                >
                  Create Fake User
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <h5 className="text-gray-300">Fake Users</h5>
                  <Button onClick={loadFakeUsers} size="sm">Load Fake Users</Button>
                </div>
                <div className="bg-gray-800 rounded p-2 max-h-40 overflow-y-auto">
                  {fakeUsers.length === 0 ? (
                    <div className="text-sm text-gray-400">No fake users loaded</div>
                  ) : (
                    fakeUsers.map((user: any) => (
                      <div key={user.id} className="flex justify-between items-center py-1 border-b border-gray-700 last:border-b-0">
                        <div className="text-sm text-white">
                          <div>{user.display_name || user.username}</div>
                          <div className="text-gray-400">{user.follower_count} followers • {user.post_count} posts</div>
                        </div>
                        <Button
                          onClick={async () => {
                            if (confirm('Delete this fake user?')) {
                              try {
                                const res = await fetch('/api/dev_7c29/simulation', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: user.id })
                                })
                                const data = await res.json()
                                if (res.ok) {
                                  showToast('Fake user deleted', 'success')
                                  addLog(`Deleted fake user: ${user.username}`)
                                  loadFakeUsers()
                                } else {
                                  showToast(data.error || 'Failed to delete', 'error')
                                }
                              } catch (err) {
                                showToast('Error deleting fake user', 'error')
                              }
                            }
                          }}
                          size="sm"
                          variant="secondary"
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-gray-300">Auto-Generation Tools</h5>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/dev_7c29/activity', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'auto_generate_dreams', count: 5 })
                        })
                        const data = await res.json()
                        if (res.ok) {
                          showToast(`Auto-generated ${data.generated} fake dreams with panels!`, 'success')
                          addLog(`Auto-generated ${data.generated} dreams`)
                          loadStats()
                        } else {
                          showToast(data.error || 'Failed to generate dreams', 'error')
                        }
                      } catch (err) {
                        showToast('Error auto-generating dreams', 'error')
                        addLog(`Error auto-generating dreams: ${err}`)
                      }
                    }}
                    size="sm"
                  >
                    Generate 5 Dreams
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/dev_7c29/activity', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'auto_generate_contests', count: 3 })
                        })
                        const data = await res.json()
                        if (res.ok) {
                          showToast(`Auto-generated ${data.generated} contests!`, 'success')
                          addLog(`Auto-generated ${data.generated} contests`)
                          loadContests()
                          loadStats()
                        } else {
                          showToast(data.error || 'Failed to generate contests', 'error')
                        }
                      } catch (err) {
                        showToast('Error auto-generating contests', 'error')
                        addLog(`Error auto-generating contests: ${err}`)
                      }
                    }}
                    size="sm"
                  >
                    Generate 3 Contests
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/dev_7c29/activity', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'auto_generate_groups', count: 4 })
                        })
                        const data = await res.json()
                        if (res.ok) {
                          showToast(`Auto-generated ${data.generated} groups!`, 'success')
                          addLog(`Auto-generated ${data.generated} groups`)
                          loadGroups()
                          loadStats()
                        } else {
                          showToast(data.error || 'Failed to generate groups', 'error')
                        }
                      } catch (err) {
                        showToast('Error auto-generating groups', 'error')
                        addLog(`Error auto-generating groups: ${err}`)
                      }
                    }}
                    size="sm"
                  >
                    Generate 4 Groups
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/dev_7c29/activity', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'auto_generate_media', count: 6 })
                        })
                        const data = await res.json()
                        if (res.ok) {
                          showToast(`Auto-generated ${data.generated} media items!`, 'success')
                          addLog(`Auto-generated ${data.generated} media items`)
                          loadMedia()
                          loadStats()
                        } else {
                          showToast(data.error || 'Failed to generate media', 'error')
                        }
                      } catch (err) {
                        showToast('Error auto-generating media', 'error')
                        addLog(`Error auto-generating media: ${err}`)
                      }
                    }}
                    size="sm"
                  >
                    Generate 6 Media
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-gray-300">Activity Simulation</h5>
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/dev_7c29/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'boost_engagement', count: 5 })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            showToast('Boosted engagement across platform!', 'success')
                            addLog('Boosted engagement metrics')
                          } else {
                            showToast(data.error || 'Failed to boost engagement', 'error')
                          }
                        } catch (err) {
                          showToast('Error boosting engagement', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Boost Random Engagement
                    </Button>
                    <Button
                      onClick={async () => {
                        // Simulate group joins for first group
                        if (groups.length > 0) {
                          try {
                            const res = await fetch('/api/dev_7c29/activity', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'simulate_group_joins', count: 5, targetId: groups[0].id })
                            })
                            const data = await res.json()
                            if (res.ok) {
                              showToast(`Added ${data.added} fake members to ${groups[0].name}!`, 'success')
                              addLog(`Added fake members to group: ${groups[0].name}`)
                              loadGroups()
                            } else {
                              showToast(data.error || 'Failed to add members', 'error')
                            }
                          } catch (err) {
                            showToast('Error adding fake members', 'error')
                          }
                        } else {
                          showToast('Create a group first', 'info')
                        }
                      }}
                      size="sm"
                    >
                      Populate Groups
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={async () => {
                        // Simulate contest entries for first contest
                        if (contests.length > 0) {
                          try {
                            const res = await fetch('/api/dev_7c29/activity', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'simulate_contest_entries', count: 3, targetId: contests[0].id })
                            })
                            const data = await res.json()
                            if (res.ok) {
                              showToast(`Added ${data.added} fake entries to ${contests[0].title}!`, 'success')
                              addLog(`Added fake entries to contest: ${contests[0].title}`)
                              loadContests()
                            } else {
                              showToast(data.error || 'Failed to add entries', 'error')
                            }
                          } catch (err) {
                            showToast('Error adding fake entries', 'error')
                          }
                        } else {
                          showToast('Create a contest first', 'info')
                        }
                      }}
                      size="sm"
                    >
                      Populate Contests
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/dev_7c29/activity')
                          const data = await res.json()
                          if (res.ok) {
                            showToast(`Simulation active! ${data.simulationStats.totalFakeUsers} fake users, ${data.simulationStats.engagementMultiplier}x engagement`, 'success')
                            addLog('Checked simulation statistics')
                          } else {
                            showToast(data.error || 'Failed to get stats', 'error')
                          }
                        } catch (err) {
                          showToast('Error getting simulation stats', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Check Population Stats
                    </Button>
                    <Button
                      onClick={async () => {
                        // Create viral content illusion
                        showToast('Creating viral content simulation...', 'info')
                        addLog('Initiating viral content simulation')

                        // Boost engagement across multiple items
                        for (let i = 0; i < 3; i++) {
                          try {
                            await fetch('/api/dev_7c29/activity', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ action: 'boost_engagement', count: 1 })
                            })
                          } catch (err) {
                            // Continue
                          }
                        }

                        showToast('Viral content simulation complete! Check engagement metrics.', 'success')
                        addLog('Viral content simulation completed')
                      }}
                      size="sm"
                    >
                      Create Viral Content
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={async () => {
                        // Simulate comments on existing dreams
                        try {
                          const res = await fetch('/api/dev_7c29/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'auto_generate_comments', count: 10 })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            showToast(`Auto-generated ${data.generated} comments!`, 'success')
                            addLog(`Auto-generated ${data.generated} comments`)
                          } else {
                            showToast(data.error || 'Failed to generate comments', 'error')
                          }
                        } catch (err) {
                          showToast('Error auto-generating comments', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Generate Comments
                    </Button>
                    <Button
                      onClick={async () => {
                        // Simulate achievements for users
                        try {
                          const res = await fetch('/api/dev_7c29/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'simulate_achievements', count: 15 })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            showToast(`Simulated ${data.generated} achievements!`, 'success')
                            addLog(`Simulated ${data.generated} achievements`)
                          } else {
                            showToast(data.error || 'Failed to simulate achievements', 'error')
                          }
                        } catch (err) {
                          showToast('Error simulating achievements', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Simulate Achievements
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={async () => {
                        // Simulate online users
                        try {
                          const res = await fetch('/api/dev_7c29/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'simulate_online_users', count: 8 })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            showToast(`Simulated ${data.generated} online users!`, 'success')
                            addLog(`Simulated ${data.generated} online users`)
                          } else {
                            showToast(data.error || 'Failed to simulate online users', 'error')
                          }
                        } catch (err) {
                          showToast('Error simulating online users', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Simulate Online Users
                    </Button>
                    <Button
                      onClick={async () => {
                        // Auto-boost all engagement metrics
                        try {
                          const res = await fetch('/api/dev_7c29/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'auto_boost_all', multiplier: 2 })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            showToast(`Auto-boosted all engagement by ${data.multiplier}x!`, 'success')
                            addLog(`Auto-boosted engagement by ${data.multiplier}x`)
                            loadStats()
                          } else {
                            showToast(data.error || 'Failed to boost engagement', 'error')
                          }
                        } catch (err) {
                          showToast('Error auto-boosting engagement', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Auto-Boost All Metrics
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={async () => {
                        // Generate viral trending content
                        try {
                          const res = await fetch('/api/dev_7c29/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'generate_trending_content', count: 3 })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            showToast(`Generated ${data.generated} trending posts!`, 'success')
                            addLog(`Generated ${data.generated} trending posts`)
                          } else {
                            showToast(data.error || 'Failed to generate trending content', 'error')
                          }
                        } catch (err) {
                          showToast('Error generating trending content', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Generate Trending
                    </Button>
                    <Button
                      onClick={async () => {
                        // Simulate social proof notifications
                        try {
                          const res = await fetch('/api/dev_7c29/activity', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'simulate_social_proof', count: 5 })
                          })
                          const data = await res.json()
                          if (res.ok) {
                            showToast(`Simulated ${data.generated} social proof events!`, 'success')
                            addLog(`Simulated ${data.generated} social proof events`)
                          } else {
                            showToast(data.error || 'Failed to simulate social proof', 'error')
                          }
                        } catch (err) {
                          showToast('Error simulating social proof', 'error')
                        }
                      }}
                      size="sm"
                    >
                      Social Proof Events
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-800 rounded p-3">
                <h5 className="text-white font-semibold mb-2">Population Illusion Tips</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Create 50+ fake users for realistic community feel</li>
                  <li>• Populate groups with 10-20 fake members each</li>
                  <li>• Add fake entries to contests to show activity</li>
                  <li>• Create fake posts and comments for engagement</li>
                  <li>• Boost view/like counts to increase perceived popularity</li>
                  <li>• Use realistic names, bios, and content for better illusion</li>
                  <li>• Higher engagement multiplier = more convincing community</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Real-Time Analytics</h4>
              <div className="flex justify-between items-center">
                <p className="text-gray-300">Live platform statistics</p>
                <Button onClick={loadStats} size="sm">Refresh Stats</Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-2xl font-bold text-purple-400">{stats.totalUsers || 0}</div>
                  <div className="text-sm text-gray-300">Total Users</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-2xl font-bold text-cyan-400">{stats.totalDreams || 0}</div>
                  <div className="text-sm text-gray-300">Total Dreams</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-2xl font-bold text-pink-400">{stats.totalPanels || 0}</div>
                  <div className="text-sm text-gray-300">Total Panels</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-2xl font-bold text-green-400">{stats.totalGroups || 0}</div>
                  <div className="text-sm text-gray-300">Total Groups</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-2xl font-bold text-yellow-400">{stats.totalContests || 0}</div>
                  <div className="text-sm text-gray-300">Total Contests</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-2xl font-bold text-orange-400">{stats.totalFakeUsers || 0}</div>
                  <div className="text-sm text-gray-300">Fake Users</div>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <div className="text-2xl font-bold text-indigo-400">{(stats.totalSimulatedViews || 0) + (stats.totalSimulatedLikes || 0)}</div>
                  <div className="text-sm text-gray-300">Simulated Engagement</div>
                </div>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <h5 className="text-white font-semibold mb-2">Population Illusion Metrics</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Fake Users: <span className="text-orange-400">{stats.totalFakeUsers || 0}</span></div>
                  <div>Simulated Members: <span className="text-green-400">{stats.totalSimulatedMembers || 0}</span></div>
                  <div>Simulated Entries: <span className="text-yellow-400">{stats.totalSimulatedEntries || 0}</span></div>
                  <div>Simulated Comments: <span className="text-blue-400">{stats.totalSimulatedComments || 0}</span></div>
                  <div>Simulated Posts: <span className="text-purple-400">{stats.totalSimulatedPosts || 0}</span></div>
                  <div>Achievements: <span className="text-indigo-400">{stats.totalAchievements || 0}</span></div>
                  <div>Social Events: <span className="text-pink-400">{stats.totalSocialEvents || 0}</span></div>
                  <div>Online Users: <span className="text-cyan-400">{stats.onlineUsers || 0}</span></div>
                  <div>Engagement Multiplier: <span className="text-red-400">{stats.engagementMultiplier || 0}x</span></div>
                  <div>Total Views: <span className="text-cyan-400">{stats.totalSimulatedViews || 0}</span></div>
                  <div>Total Likes: <span className="text-pink-400">{stats.totalSimulatedLikes || 0}</span></div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Higher engagement multiplier = more active community feel
                </div>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <h5 className="text-white font-semibold mb-2">Recent Activity (24h)</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Dreams: <span className="text-cyan-400">{stats.recentDreams || 0}</span></div>
                  <div>Panels: <span className="text-pink-400">{stats.recentPanels || 0}</span></div>
                  <div>Groups: <span className="text-green-400">{stats.recentGroups || 0}</span></div>
                  <div>Contests: <span className="text-yellow-400">{stats.recentContests || 0}</span></div>
                  <div>Media: <span className="text-red-400">{stats.recentMedia || 0}</span></div>
                  <div>Fake Users: <span className="text-purple-400">{stats.totalFakeUsers || 0}</span></div>
                </div>
              </div>
              <div className="bg-gray-800 rounded p-3">
                <h5 className="text-white font-semibold mb-2">Manual Adjustments</h5>
                <p className="text-gray-400 text-sm mb-2">Override stats for testing (resets on refresh)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="User count"
                    className="p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  />
                  <Button
                    onClick={() => {
                      showToast('Manual adjustments - Coming soon', 'info')
                      addLog('Attempted manual stat adjustment')
                    }}
                    size="sm"
                  >
                    Adjust Users
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {stats.timestamp ? new Date(stats.timestamp).toLocaleString() : 'Never'}
              </div>
            </div>
          )}

          {/* NEW: Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">🎯 Daily Challenge Management</h4>
                <Button onClick={loadChallenges} size="sm">Refresh</Button>
              </div>

              {/* Create new challenge form */}
              <div className="bg-gray-800 rounded p-4 space-y-3">
                <h5 className="text-gray-300 font-medium">Create New Challenge</h5>
                <textarea
                  placeholder="Challenge prompt (e.g., 'A dream where you discover a hidden door in your house')"
                  value={challengeForm.prompt}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, prompt: e.target.value }))}
                  className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  rows={2}
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={challengeForm.style}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, style: e.target.value }))}
                    className="p-2 bg-gray-700 text-white rounded border border-gray-600"
                  >
                    <option value="Arcane">Arcane</option>
                    <option value="Gothic">Gothic</option>
                    <option value="Retro Comic">Retro Comic</option>
                    <option value="Dark Fantasy">Dark Fantasy</option>
                    <option value="Cyberpunk">Cyberpunk</option>
                    <option value="Watercolor">Watercolor</option>
                  </select>
                  <select
                    value={challengeForm.mood}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, mood: e.target.value }))}
                    className="p-2 bg-gray-700 text-white rounded border border-gray-600"
                  >
                    <option value="Mysterious">Mysterious</option>
                    <option value="Adventurous">Adventurous</option>
                    <option value="Peaceful">Peaceful</option>
                    <option value="Tense">Tense</option>
                    <option value="Exciting">Exciting</option>
                    <option value="Nostalgic">Nostalgic</option>
                  </select>
                  <input
                    type="date"
                    value={challengeForm.challenge_date}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, challenge_date: e.target.value }))}
                    className="p-2 bg-gray-700 text-white rounded border border-gray-600"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Bonus XP"
                    value={challengeForm.bonus_xp}
                    onChange={(e) => setChallengeForm(prev => ({ ...prev, bonus_xp: parseInt(e.target.value) || 100 }))}
                    className="p-2 bg-gray-700 text-white rounded border border-gray-600 w-32"
                  />
                  <Button
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/dev_7c29/challenges', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(challengeForm)
                        })
                        const data = await res.json()
                        if (res.ok) {
                          showToast('Challenge created!', 'success')
                          addLog(`Created challenge for ${challengeForm.challenge_date}`)
                          setChallengeForm({ prompt: '', style: 'Arcane', mood: 'Mysterious', challenge_date: '', bonus_xp: 100 })
                          loadChallenges()
                        } else {
                          showToast(data.error || 'Failed to create challenge', 'error')
                        }
                      } catch (err) {
                        showToast('Error creating challenge', 'error')
                      }
                    }}
                    disabled={!challengeForm.prompt || !challengeForm.challenge_date}
                    className="flex-1"
                  >
                    Create Challenge
                  </Button>
                </div>
              </div>

              {/* Challenges list */}
              <div className="bg-gray-800 rounded p-4 max-h-96 overflow-y-auto">
                <h5 className="text-gray-300 font-medium mb-3">All Challenges ({challenges.length})</h5>
                {challenges.length === 0 ? (
                  <p className="text-gray-500 text-sm">No challenges found. Create one above!</p>
                ) : (
                  <div className="space-y-2">
                    {challenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${selectedChallenge?.id === challenge.id
                            ? 'bg-purple-900/50 border-purple-500'
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          }`}
                        onClick={() => {
                          setSelectedChallenge(challenge)
                          loadSubmissions(challenge.id)
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-white font-medium">{challenge.prompt.slice(0, 60)}...</div>
                            <div className="text-gray-400 text-sm mt-1">
                              📅 {challenge.challenge_date} • 🎨 {challenge.style} • 💭 {challenge.mood}
                            </div>
                            <div className="text-gray-400 text-sm">
                              📝 {challenge.submission_count || 0} submissions • ⭐ {challenge.bonus_xp || 100} XP
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (confirm('Delete this challenge?')) {
                                  const res = await fetch('/api/dev_7c29/challenges', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: challenge.id })
                                  })
                                  if (res.ok) {
                                    showToast('Challenge deleted', 'success')
                                    loadChallenges()
                                  }
                                }
                              }}
                              size="sm"
                              variant="secondary"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                        {challenge.winner_id && (
                          <div className="mt-2 text-green-400 text-sm">🏆 Winner selected</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submissions for selected challenge */}
              {selectedChallenge && (
                <div className="bg-gray-800 rounded p-4">
                  <h5 className="text-gray-300 font-medium mb-3">
                    Submissions for: {selectedChallenge.prompt.slice(0, 40)}...
                  </h5>
                  {submissions.length === 0 ? (
                    <p className="text-gray-500 text-sm">No submissions yet</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {submissions.map((sub) => (
                        <div key={sub.id} className="p-2 bg-gray-700 rounded flex justify-between items-center">
                          <div>
                            <div className="text-white text-sm">{sub.user?.email || 'Unknown'}</div>
                            <div className="text-gray-400 text-xs">
                              👍 {sub.votes || 0} votes • {sub.dream?.text?.slice(0, 50) || 'No dream text'}...
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              onClick={async () => {
                                const res = await fetch('/api/dev_7c29/challenges', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: selectedChallenge.id,
                                    action: 'pick_winner',
                                    winner_id: sub.user_id
                                  })
                                })
                                if (res.ok) {
                                  showToast('Winner selected!', 'success')
                                  addLog(`Selected winner: ${sub.user?.email}`)
                                  loadChallenges()
                                }
                              }}
                              size="sm"
                            >
                              🏆 Pick Winner
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NEW: Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">👤 User Management</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && loadUsers(userSearch)}
                  />
                  <Button onClick={() => loadUsers(userSearch)} size="sm">Search</Button>
                </div>
              </div>

              {/* Users list */}
              <div className="bg-gray-800 rounded p-4 max-h-80 overflow-y-auto">
                <h5 className="text-gray-300 font-medium mb-3">Users ({users.length})</h5>
                {users.length === 0 ? (
                  <p className="text-gray-500 text-sm">No users found. Click Search to load.</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 rounded border cursor-pointer transition-colors ${selectedUser?.id === user.id
                            ? 'bg-purple-900/50 border-purple-500'
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          }`}
                        onClick={() => {
                          setSelectedUser(user)
                          loadUserDetails(user.id)
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-medium">{user.email}</div>
                            <div className="text-gray-400 text-sm">
                              💭 {user.actual_dreams_count || user.dreams_count || 0} dreams •
                              🖼️ {user.panels_count || 0} panels •
                              💎 {user.subscription_tier || 'free'}
                            </div>
                            <div className="text-gray-500 text-xs">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {user.subscription_tier !== 'pro' && (
                              <Button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  const res = await fetch('/api/dev_7c29/users', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: user.id, action: 'upgrade_to_pro' })
                                  })
                                  if (res.ok) {
                                    showToast('Upgraded to Pro!', 'success')
                                    loadUsers(userSearch)
                                  }
                                }}
                                size="sm"
                              >
                                ⬆️ Pro
                              </Button>
                            )}
                            {user.subscription_tier !== 'premium' && (
                              <Button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  const res = await fetch('/api/dev_7c29/users', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: user.id, action: 'upgrade_to_premium' })
                                  })
                                  if (res.ok) {
                                    showToast('Upgraded to Premium!', 'success')
                                    loadUsers(userSearch)
                                  }
                                }}
                                size="sm"
                              >
                                👑 Premium
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User details */}
              {userDetails && (
                <div className="bg-gray-800 rounded p-4">
                  <h5 className="text-gray-300 font-medium mb-3">
                    Details: {userDetails.user?.email}
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-2xl font-bold text-cyan-400">{userDetails.stats?.total_dreams || 0}</div>
                      <div className="text-gray-400">Total Dreams</div>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-2xl font-bold text-pink-400">{userDetails.stats?.total_panels || 0}</div>
                      <div className="text-gray-400">Total Panels</div>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-2xl font-bold text-yellow-400">{userDetails.stats?.total_badges || 0}</div>
                      <div className="text-gray-400">Badges Earned</div>
                    </div>
                    <div className="bg-gray-700 p-2 rounded">
                      <div className="text-2xl font-bold text-green-400">{userDetails.stats?.total_referrals || 0}</div>
                      <div className="text-gray-400">Referrals</div>
                    </div>
                  </div>
                  {userDetails.badges?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-gray-400 text-sm mb-1">Badges:</div>
                      <div className="flex flex-wrap gap-1">
                        {userDetails.badges.map((b: any) => (
                          <span key={b.badge_id} className="px-2 py-1 bg-gray-700 rounded text-xs">
                            {b.badge_id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* NEW: Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">🏅 Badge Management</h4>
                <Button onClick={loadBadges} size="sm">Refresh</Button>
              </div>

              {/* Badge stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{badgeStats.totalAwarded || 0}</div>
                  <div className="text-gray-400 text-sm">Badges Awarded</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{badgeStats.uniqueUsers || 0}</div>
                  <div className="text-gray-400 text-sm">Users with Badges</div>
                </div>
                <div className="bg-gray-800 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">{allBadges.length}</div>
                  <div className="text-gray-400 text-sm">Total Badge Types</div>
                </div>
              </div>

              {/* Award badge form */}
              <div className="bg-gray-800 rounded p-4 space-y-3">
                <h5 className="text-gray-300 font-medium">Award Badge Manually</h5>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="User ID (from Users tab)"
                    value={selectedBadgeUser}
                    onChange={(e) => setSelectedBadgeUser(e.target.value)}
                    className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  />
                  <select
                    value={selectedBadge}
                    onChange={(e) => setSelectedBadge(e.target.value)}
                    className="flex-1 p-2 bg-gray-700 text-white rounded border border-gray-600 text-sm"
                  >
                    <option value="">Select badge...</option>
                    {allBadges.map((badge) => (
                      <option key={badge.id} value={badge.id}>
                        {badge.emoji} {badge.name} ({badge.rarity})
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={async () => {
                      if (!selectedBadgeUser || !selectedBadge) return
                      const res = await fetch('/api/dev_7c29/badges', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: selectedBadgeUser, badge_id: selectedBadge })
                      })
                      const data = await res.json()
                      if (res.ok) {
                        showToast(data.message || 'Badge awarded!', 'success')
                        loadBadges()
                        setSelectedBadgeUser('')
                        setSelectedBadge('')
                      } else {
                        showToast(data.error || 'Failed to award badge', 'error')
                      }
                    }}
                    disabled={!selectedBadgeUser || !selectedBadge}
                  >
                    Award Badge
                  </Button>
                </div>
              </div>

              {/* Badge distribution */}
              <div className="bg-gray-800 rounded p-4">
                <h5 className="text-gray-300 font-medium mb-3">Badge Distribution</h5>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {allBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <span>{badge.emoji}</span>
                        <span className="text-white text-sm">{badge.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${badge.rarity === 'legendary' ? 'text-yellow-400' :
                          badge.rarity === 'epic' ? 'text-purple-400' :
                            badge.rarity === 'rare' ? 'text-blue-400' :
                              badge.rarity === 'uncommon' ? 'text-green-400' :
                                'text-gray-400'
                        }`}>
                        {badgeStats.badgeCounts?.[badge.id] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent unlocks */}
              {badgeStats.recentUnlocks?.length > 0 && (
                <div className="bg-gray-800 rounded p-4">
                  <h5 className="text-gray-300 font-medium mb-3">Recent Unlocks</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {badgeStats.recentUnlocks.slice(0, 10).map((unlock: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-400">{unlock.email}</span>
                        <span className="text-white">{unlock.badge?.emoji} {unlock.badge?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NEW: Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">🗄️ Database Health</h4>
                <Button onClick={loadDbHealth} size="sm">Refresh</Button>
              </div>

              {/* Connection status */}
              <div className={`p-4 rounded flex items-center gap-3 ${dbHealth?.status === 'healthy' ? 'bg-green-900/50 border border-green-500' :
                  dbHealth?.status === 'degraded' ? 'bg-yellow-900/50 border border-yellow-500' :
                    'bg-red-900/50 border border-red-500'
                }`}>
                <div className={`w-3 h-3 rounded-full animate-pulse ${dbHealth?.status === 'healthy' ? 'bg-green-400' :
                    dbHealth?.status === 'degraded' ? 'bg-yellow-400' :
                      'bg-red-400'
                  }`} />
                <div>
                  <div className="text-white font-medium">
                    Status: {dbHealth?.status?.toUpperCase() || 'UNKNOWN'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Connection: {dbHealth?.connection || 'Checking...'}
                  </div>
                </div>
              </div>

              {/* Table counts */}
              {dbHealth?.tableCounts && (
                <div className="bg-gray-800 rounded p-4">
                  <h5 className="text-gray-300 font-medium mb-3">Table Counts</h5>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {Object.entries(dbHealth.tableCounts).map(([table, count]) => (
                      <div key={table} className="flex justify-between p-2 bg-gray-700 rounded text-sm">
                        <span className="text-gray-400">{table}</span>
                        <span className={typeof count === 'number' ? 'text-cyan-400' : 'text-red-400'}>
                          {String(count)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent activity */}
              {dbHealth?.recent24h && (
                <div className="bg-gray-800 rounded p-4">
                  <h5 className="text-gray-300 font-medium mb-3">Last 24 Hours</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">{dbHealth.recent24h.users}</div>
                      <div className="text-gray-400 text-sm">New Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-pink-400">{dbHealth.recent24h.dreams}</div>
                      <div className="text-gray-400 text-sm">New Dreams</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{dbHealth.recent24h.panels}</div>
                      <div className="text-gray-400 text-sm">New Panels</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription distribution */}
              {dbHealth?.subscriptionDistribution && (
                <div className="bg-gray-800 rounded p-4">
                  <h5 className="text-gray-300 font-medium mb-3">Subscription Tiers</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400">{dbHealth.subscriptionDistribution.free}</div>
                      <div className="text-gray-400 text-sm">Free</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{dbHealth.subscriptionDistribution.pro}</div>
                      <div className="text-gray-400 text-sm">Pro</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{dbHealth.subscriptionDistribution.premium}</div>
                      <div className="text-gray-400 text-sm">Premium</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance actions */}
              <div className="bg-gray-800 rounded p-4">
                <h5 className="text-gray-300 font-medium mb-3">Maintenance Actions</h5>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={async () => {
                      const res = await fetch('/api/dev_7c29/database', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'cleanup_orphans' })
                      })
                      const data = await res.json()
                      showToast(data.message || 'Cleanup complete', res.ok ? 'success' : 'error')
                      loadDbHealth()
                    }}
                    size="sm"
                  >
                    🧹 Cleanup Orphans
                  </Button>
                  <Button
                    onClick={async () => {
                      const res = await fetch('/api/dev_7c29/database', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_counts' })
                      })
                      const data = await res.json()
                      showToast(data.message || 'Counts verified', res.ok ? 'success' : 'error')
                      loadDbHealth()
                    }}
                    size="sm"
                  >
                    ✅ Verify Counts
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!confirm('Reset monthly panel counters for all users?')) return
                      const res = await fetch('/api/dev_7c29/database', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'reset_monthly_counters' })
                      })
                      const data = await res.json()
                      showToast(data.message || 'Counters reset', res.ok ? 'success' : 'error')
                    }}
                    size="sm"
                    variant="secondary"
                  >
                    🔄 Reset Monthly Counters
                  </Button>
                </div>
              </div>

              {/* Errors */}
              {dbHealth?.errors?.length > 0 && (
                <div className="bg-red-900/50 border border-red-500 rounded p-4">
                  <h5 className="text-red-400 font-medium mb-2">⚠️ Issues Detected</h5>
                  <ul className="text-red-300 text-sm space-y-1">
                    {dbHealth.errors.map((err: string, i: number) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-xs text-gray-500">
                Last checked: {dbHealth?.timestamp ? new Date(dbHealth.timestamp).toLocaleString() : 'Never'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}