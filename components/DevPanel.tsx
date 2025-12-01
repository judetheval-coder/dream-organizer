"use client"

import { useState } from 'react'
import { useDevMode } from '@/hooks/useDevMode'
import { useToast } from '@/contexts/ToastContext'
import { Button } from './ui/primitives'

interface DevPanelProps {
  onClose?: () => void
}

type DevTab = 'data' | 'debug' | 'system' | 'logs' | 'social' | 'groups' | 'contests' | 'media' | 'simulation' | 'analytics'

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
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
          <div className="flex gap-1">
            {[
              { key: 'data' as DevTab, label: '📊 Data', icon: '📊' },
              { key: 'debug' as DevTab, label: '🔧 Debug', icon: '🔧' },
              { key: 'system' as DevTab, label: '⚙️ System', icon: '⚙️' },
              { key: 'logs' as DevTab, label: '📝 Logs', icon: '📝' },
              { key: 'social' as DevTab, label: '👥 Social', icon: '👥' },
              { key: 'groups' as DevTab, label: '👥 Groups', icon: '👥' },
              { key: 'contests' as DevTab, label: '🏆 Contests', icon: '🏆' },
              { key: 'media' as DevTab, label: '🖼️ Media', icon: '🖼️' },
              { key: 'simulation' as DevTab, label: '🤖 Simulation', icon: '🤖' },
              { key: 'analytics' as DevTab, label: '📈 Analytics', icon: '📈' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${activeTab === key
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
        </div>
      </div>
    </div>
  )
}