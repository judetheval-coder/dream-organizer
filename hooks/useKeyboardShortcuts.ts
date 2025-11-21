"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Search (would open search modal)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        searchInput?.focus()
      }

      // N: New dream (only when not typing)
      if (e.key === 'n' && !isTyping(e)) {
        e.preventDefault()
        const newDreamButton = document.querySelector('[data-action="new-dream"]') as HTMLButtonElement
        newDreamButton?.click()
      }

      // Esc: Close modals
      if (e.key === 'Escape') {
        const closeButton = document.querySelector('[data-action="close-modal"]') as HTMLButtonElement
        closeButton?.click()
      }

      // D: Dashboard
      if (e.key === 'd' && !isTyping(e)) {
        e.preventDefault()
        router.push('/dashboard')
      }

      // C: Comics
      if (e.key === 'c' && !isTyping(e)) {
        e.preventDefault()
        router.push('/')
      }

      // A: Achievements
      if (e.key === 'a' && !isTyping(e)) {
        e.preventDefault()
        router.push('/achievements')
      }
    }

    const isTyping = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])
}
