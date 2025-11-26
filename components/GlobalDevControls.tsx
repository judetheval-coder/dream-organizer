"use client"

import { useState, useEffect } from 'react'
import { DevPanel } from '@/components/DevPanel'

export function GlobalDevControls() {
  const [showDevPanel, setShowDevPanel] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === '7') {
        setShowDevPanel(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!showDevPanel) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl">
        <DevPanel onClose={() => setShowDevPanel(false)} />
      </div>
    </div>
  )
}