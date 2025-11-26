"use client"

import { useState, useEffect } from 'react'

export function useDevMode() {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    // Check if already unlocked
    fetch('/api/_dev_7c29/unlock')
      .then(res => res.json())
      .then(data => setUnlocked(data.unlocked))
      .catch(() => setUnlocked(false))
  }, [])

  const unlock = async (secret: string) => {
    const res = await fetch('/api/_dev_7c29/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret })
    })
    const data = await res.json()
    if (data.unlocked) {
      setUnlocked(true)
      return true
    }
    return false
  }

  return { unlocked, unlock }
}