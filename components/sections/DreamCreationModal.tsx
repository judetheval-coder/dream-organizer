"use client"

import { colors, gradients, shadows } from '@/lib/design'
import VoiceInput from '@/components/VoiceInput'

interface DreamCreationModalProps {
  isOpen: boolean
  dreamText: string
  styleValue: string
  moodValue: string
  enhancing: boolean
  onClose: () => void
  onDreamTextChange: (value: string) => void
  onStyleChange: (value: string) => void
  onMoodChange: (value: string) => void
  onEnhance: () => Promise<void> | void
  onCreate: () => Promise<void> | void
}

export function DreamCreationModal({
  isOpen,
  dreamText,
  styleValue,
  moodValue,
  enhancing,
  onClose,
  onDreamTextChange,
  onStyleChange,
  onMoodChange,
  onEnhance,
  onCreate,
}: DreamCreationModalProps) {
  if (!isOpen) return null

  const headingId = 'create-dream-heading'
  const descriptionId = 'create-dream-description'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="rounded-2xl p-10 max-w-md w-full animate-modalIn"
        style={{
          background: colors.surface,
          border: `2px solid ${colors.purple}`,
          boxShadow: shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 id={headingId} className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              Create New Dream
            </h2>
            <p id={descriptionId} className="text-sm mt-1" style={{ color: colors.textMuted }}>
              Describe what you remember, pick a style and mood, then let AI turn it into panels.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create dream modal"
            className="text-xl"
            style={{ color: colors.textMuted }}
          >
            ✕
          </button>
        </div>

        <textarea
          value={dreamText}
          onChange={(e) => onDreamTextChange(e.target.value)}
          placeholder="Describe your dream..."
          className="w-full mt-6 mb-4 p-4 rounded-lg"
          rows={5}
          aria-label="Dream description"
          aria-required="true"
          aria-invalid={!dreamText.trim()}
          data-onboarding="dream-textarea"
          style={{
            background: colors.backgroundDark,
            color: colors.textPrimary,
            border: `1px solid ${colors.cyan}`,
          }}
        />

        {/* Voice input for hands-free dream recording */}
        <div className="mb-6">
          <VoiceInput
            onTranscript={onDreamTextChange}
            existingText=""
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2" data-onboarding="style-selector">
          <div>
            <label className="block text-sm mb-3 font-semibold" style={{ color: colors.textMuted }}>
              Style
            </label>
            <select
              value={styleValue}
              onChange={(e) => onStyleChange(e.target.value)}
              className="w-full p-3 rounded-lg"
              aria-label="Visual style"
              style={{
                background: colors.backgroundDark,
                color: colors.textPrimary,
                border: `1px solid ${colors.cyan}`,
              }}
            >
              <option>Anime</option>
              <option>Watercolor</option>
              <option>Oil Painting</option>
              <option>Abstract</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-3 font-semibold" style={{ color: colors.textMuted }}>
              Mood
            </label>
            <select
              value={moodValue}
              onChange={(e) => onMoodChange(e.target.value)}
              className="w-full p-3 rounded-lg"
              aria-label="Mood"
              style={{
                background: colors.backgroundDark,
                color: colors.textPrimary,
                border: `1px solid ${colors.cyan}`,
              }}
            >
              <option>Dreamy</option>
              <option>Dark</option>
              <option>Vibrant</option>
              <option>Peaceful</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 md:flex-row">
          <button
            type="button"
            onClick={onEnhance}
            disabled={enhancing || !dreamText.trim()}
            className="flex-1 py-3 rounded-lg font-semibold cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            style={{
              background: colors.cyan,
              color: colors.backgroundDark,
              border: 'none',
            }}
          >
            <span aria-live="polite">{enhancing ? '✨ Enhancing…' : '✨ Enhance with AI'}</span>
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={!dreamText.trim()}
            className="flex-1 py-3 rounded-lg font-semibold cursor-pointer disabled:opacity-50 transition-all hover:scale-105"
            data-onboarding="create-btn"
            style={{
              background: gradients.button,
              color: colors.white,
              border: 'none',
              boxShadow: shadows.glow,
            }}
          >
            🎨 Create Comic
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-lg cursor-pointer font-medium"
          style={{
            background: colors.backgroundDark,
            color: colors.textMuted,
            border: `1px solid ${colors.surface}`,
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
