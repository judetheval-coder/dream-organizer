"use client"

import { useState, useEffect } from 'react'
import { DevPanel } from '@/components/DevPanel'
import { ToastProvider } from '@/contexts/ToastContext'
import { useDevMode } from '@/hooks/useDevMode'

export function GlobalDevControls() {
  // Runtime guard: if built for production, do not render dev controls on the client
  if (process.env.NODE_ENV === 'production') return null
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false)
  const [showDevPanel, setShowDevPanel] = useState(false)
  const [unlockSecret, setUnlockSecret] = useState('')
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const { unlock } = useDevMode()

  const handleUnlock = async () => {
    setIsAuthorizing(true)
    try {
      const result = await unlock(unlockSecret.trim())
      if (result.success) {
        setShowUnlockPrompt(false)
        setShowDevPanel(true)
        setUnlockSecret('')
      } else {
        alert(result.error || 'Invalid authorization code')
      }
    } catch (err) {
      alert('Error during authorization')
    } finally {
      setIsAuthorizing(false)
    }
  }

  useEffect(() => {
    const isTypingIntoInput = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false
      const tag = target.tagName?.toLowerCase()
      return tag === 'input' || tag === 'textarea' || target.isContentEditable
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea or editable element
      if (isTypingIntoInput(e.target)) return

      const modifierDown = e.ctrlKey || e.metaKey // allow Ctrl or Cmd
      const shiftDown = e.shiftKey
      // Use physical key codes where possible; fallback to key char
      const isSeven = e.code === 'Digit7' || e.code === 'Numpad7' || e.key === '7'

      if (modifierDown && shiftDown && isSeven) {
        setShowUnlockPrompt(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Always render something invisible to keep event listeners active
  if (!showUnlockPrompt && !showDevPanel) {
    return <div style={{ display: 'none' }} />
  }

  if (showUnlockPrompt && !showDevPanel) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white mb-4 text-lg font-semibold">🔒 Developer Access</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Enter the developer authorization code to access the control panel.
            </p>
            <input
              type="password"
              placeholder="Enter authorization code"
              value={unlockSecret}
              onChange={(e) => setUnlockSecret(e.target.value)}
              className="mb-3 p-3 bg-gray-800 text-white rounded border border-gray-600 w-full focus:border-purple-500 focus:outline-none"
              aria-label="Developer authorization code"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUnlock()
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleUnlock}
                disabled={isAuthorizing}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                {isAuthorizing ? 'Authorizing...' : 'Unlock'}
              </button>
              <button
                onClick={() => setShowUnlockPrompt(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl">
        <ToastProvider>
          <DevPanel onClose={() => {
            setShowDevPanel(false)
            setShowUnlockPrompt(false)
          }} />
        </ToastProvider>
      </div>
    </div>
  )
}