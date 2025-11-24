"use client"

import { colors, gradients, motion } from '@/lib/design'
import AutoSaveIndicator from '@/components/AutoSaveIndicator'

interface ActionBarProps {
  onCreate: () => void
  onAnalyze: () => void
  disableAnalysis?: boolean
  analyzing?: boolean
  isSaving?: boolean
  lastSaved?: Date | null
  saveError?: string | null
}

export function ActionBar({ 
  onCreate, 
  onAnalyze, 
  disableAnalysis, 
  analyzing,
  isSaving = false,
  lastSaved = null,
  saveError = null,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onCreate}
        className="px-6 py-3 rounded-2xl font-semibold flex items-center gap-2"
        style={{
          background: gradients.button,
          color: colors.white,
          boxShadow: '0 10px 30px rgba(124,58,237,0.4)',
          transition: `transform ${motion.base}`,
        }}
      >
        ✨ New Dream
      </button>
      <button
        type="button"
        onClick={onAnalyze}
        disabled={disableAnalysis}
        className="px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 disabled:opacity-60"
        style={{
          background: colors.surface,
          color: colors.textPrimary,
          border: `1px solid ${colors.border}`,
          transition: `transform ${motion.base}`,
        }}
      >
        {analyzing ? '🔄 Analyzing...' : '🔍 Analyze Dreams'}
      </button>
      
      {/* Auto-save status indicator */}
      <div className="ml-auto">
        <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} error={saveError} />
      </div>
    </div>
  )
}

export default ActionBar
