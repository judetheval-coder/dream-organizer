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
  onShowShortcuts?: () => void
  onStartTour?: () => void
}

export function ActionBar({
  onCreate,
  onAnalyze,
  disableAnalysis,
  analyzing,
  isSaving = false,
  lastSaved = null,
  saveError = null,
  onShowShortcuts,
  onStartTour,
}: ActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onCreate}
        data-tour="new-dream"
        data-action="new-dream"
        data-onboarding="new-dream-btn"
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

      {/* Help buttons */}
      <div className="flex gap-2">
        {onShowShortcuts && (
          <button
            type="button"
            onClick={onShowShortcuts}
            className="p-3 rounded-xl transition-all hover:scale-105"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
            }}
            title="Keyboard shortcuts (?)"
          >
            ⌨️
          </button>
        )}
        {onStartTour && (
          <button
            type="button"
            onClick={onStartTour}
            className="p-3 rounded-xl transition-all hover:scale-105"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.textSecondary,
            }}
            title="Take a tour"
          >
            ❓
          </button>
        )}
      </div>

      {/* Auto-save status indicator */}
      <div className="ml-auto">
        <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} error={saveError} />
      </div>
    </div>
  )
}

export default ActionBar
