"use client"

import { useState } from 'react'
import { useDevMode } from '@/hooks/useDevMode'
import { useToast } from '@/contexts/ToastContext'
import { Button } from './ui/primitives'

export function DevPanel() {
  const { unlocked, unlock } = useDevMode()
  const { showToast } = useToast()
  const [secret, setSecret] = useState('')

  if (!unlocked) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg mt-4">
        <input
          type="password"
          placeholder="Dev Secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="mb-2 p-2 bg-gray-700 text-white rounded w-full"
        />
        <Button
          onClick={async () => {
            const success = await unlock(secret)
            if (success) {
              showToast('Dev mode unlocked!', 'success')
            } else {
              showToast('Invalid secret', 'error')
            }
          }}
          className="w-full"
        >
          Unlock
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg mt-4">
      <h3 className="text-white mb-4">Dev Controls</h3>
      <Button
        onClick={async () => {
          const res = await fetch('/api/_dev_7c29/seed', { method: 'POST' })
          if (res.ok) {
            showToast('Fake data seeded!', 'success')
          } else {
            showToast('Seeding failed', 'error')
          }
        }}
        className="w-full"
      >
        Seed Fake Data
      </Button>
    </div>
  )
}