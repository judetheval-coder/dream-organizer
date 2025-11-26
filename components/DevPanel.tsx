"use client"

import { useState } from 'react'
import { useDevMode } from '@/hooks/useDevMode'
import { useToast } from '@/contexts/ToastContext'
import { Button } from './ui/primitives'

interface DevPanelProps {
  onClose?: () => void
}

type DevTab = 'data' | 'debug' | 'system' | 'logs'

export function DevPanel({ onClose }: DevPanelProps) {
  const { unlocked, unlock } = useDevMode()
  const { showToast } = useToast()
  const [secret, setSecret] = useState('')
  const [activeTab, setActiveTab] = useState<DevTab>('data')
  const [logs, setLogs] = useState<string[]>([
    '[INFO] Dev console initialized',
    '[INFO] Ready for commands'
  ])

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
          />
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                const success = await unlock(secret)
                if (success) {
                  showToast('Developer mode unlocked!', 'success')
                  addLog('Developer access granted')
                } else {
                  showToast('Invalid authorization code', 'error')
                  addLog('Failed authorization attempt')
                }
              }}
              className="flex-1"
            >
              Authorize
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
              { key: 'logs' as DevTab, label: '📝 Logs', icon: '📝' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  activeTab === key
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
                    const res = await fetch('/api/_dev_7c29/seed', { method: 'POST' })
                    if (res.ok) {
                      showToast('Fake data seeded successfully!', 'success')
                      addLog('Seeded fake user/dream data')
                    } else {
                      showToast('Seeding failed', 'error')
                      addLog('Failed to seed fake data')
                    }
                  }}
                  className="w-full justify-start"
                >
                  🌱 Seed Fake Data
                </Button>
                <Button
                  onClick={async () => {
                    if (confirm('Clear all fake data? This will remove dev-user-* entries.')) {
                      // TODO: Implement clear fake data
                      showToast('Clear fake data - Not implemented yet', 'info')
                      addLog('Attempted to clear fake data (not implemented)')
                    }
                  }}
                  variant="danger"
                  className="w-full justify-start"
                >
                  🗑️ Clear Fake Data
                </Button>
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
              <div className="bg-black rounded p-3 font-mono text-sm text-green-400 max-h-64 overflow-y-auto">
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
        </div>
      </div>
    </div>
  )
}