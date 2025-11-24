"use client"

import { colors } from '@/lib/design'

interface AutoSaveIndicatorProps {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  className?: string
}

export default function AutoSaveIndicator({ 
  isSaving, 
  lastSaved, 
  error, 
  className = '' 
}: AutoSaveIndicatorProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 5000) return 'Just now'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (error) {
    return (
      <div 
        className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${className}`}
        style={{ background: '#dc262620', color: '#ef4444' }}
      >
        <span>⚠️</span>
        <span>Save failed</span>
      </div>
    )
  }

  if (isSaving) {
    return (
      <div 
        className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${className}`}
        style={{ background: colors.surface, color: colors.textMuted }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.cyan }} />
        <span>Saving...</span>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div 
        className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${className}`}
        style={{ background: colors.surface, color: colors.textMuted }}
      >
        <span style={{ color: colors.cyan }}>✓</span>
        <span>Saved {formatTime(lastSaved)}</span>
      </div>
    )
  }

  return null
}
