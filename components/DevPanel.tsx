"use client"

import { useState } from 'react'
import { useDevMode } from '@/hooks/useDevMode'
import { useToast } from '@/contexts/ToastContext'
import { Button } from './ui/primitives'

interface DevPanelProps {
  onClose?: () => void
}

export function DevPanel({ onClose }: DevPanelProps) {
  const { unlocked, unlock } = useDevMode()
  const { showToast } = useToast()
  const [secret, setSecret] = useState('')

  if (!unlocked) {
    return (
      <div>
        <h3 className="text-white mb-4">Developer Access Required</h3>
        <p className="text-gray-300 mb-4">This area is restricted to authorized developers only.</p>
        <input
          type="password"
          placeholder="Enter authorization code"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="mb-2 p-2 bg-gray-700 text-white rounded w-full"
        />
        <Button
          onClick={async () => {
            const success = await unlock(secret)
            if (success) {
              showToast('Developer mode unlocked!', 'success')
            } else {
              showToast('Invalid authorization code', 'error')
            }
          }}
          className="w-full"
        >
          Authorize
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="secondary" className="mt-2 w-full">
            Cancel
          </Button>
        )}
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-white mb-4">Developer Controls</h3>
      <Button
        onClick={async () => {
          const res = await fetch('/api/_dev_7c29/seed', { method: 'POST' })
          if (res.ok) {
            showToast('Fake data seeded successfully!', 'success')
          } else {
            showToast('Seeding failed', 'error')
          }
        }}
        className="w-full"
      >
        Seed Fake Data
      </Button>
      {onClose && (
        <Button onClick={onClose} variant="secondary" className="mt-2 w-full">
          Close
        </Button>
      )}
    </div>
  )
}