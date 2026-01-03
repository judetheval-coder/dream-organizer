'use client'

import { useState } from 'react'
import { colors } from '@/lib/design'
import Card from '@/components/ui/Card'

interface StructuredDreamPostProps {
  dream: any
  onSubmit: (data: {
    dream_id: string
    dream_title: string
    dream_type: string
    dream_mood: string
    vividness: number
    tags: string[]
  }) => Promise<void>
  onCancel: () => void
}

const DREAM_TYPES = [
  { value: 'flying', label: '🪽 Flying', emoji: '🪽' },
  { value: 'falling', label: '⬇️ Falling', emoji: '⬇️' },
  { value: 'lucid', label: '🔮 Lucid', emoji: '🔮' },
  { value: 'nightmare', label: '😨 Nightmare', emoji: '😨' },
  { value: 'recurring', label: '🔄 Recurring', emoji: '🔄' },
  { value: 'prophetic', label: '🔮 Prophetic', emoji: '🔮' },
  { value: 'adventure', label: '🗺️ Adventure', emoji: '🗺️' },
  { value: 'mystical', label: '✨ Mystical', emoji: '✨' },
  { value: 'other', label: '💭 Other', emoji: '💭' },
]

const DREAM_MOODS = [
  { value: 'calm', label: '🌙 Calm', emoji: '🌙' },
  { value: 'fear', label: '😨 Fear', emoji: '😨' },
  { value: 'euphoric', label: '✨ Euphoric', emoji: '✨' },
  { value: 'confusing', label: '🌀 Confusing', emoji: '🌀' },
  { value: 'peaceful', label: '🕊️ Peaceful', emoji: '🕊️' },
  { value: 'anxious', label: '😰 Anxious', emoji: '😰' },
  { value: 'joyful', label: '😊 Joyful', emoji: '😊' },
  { value: 'mysterious', label: '🌑 Mysterious', emoji: '🌑' },
]

const COMMON_TAGS = ['sky', 'freedom', 'water', 'flight', 'darkness', 'light', 'ocean', 'forest', 'city', 'animals', 'people', 'strange', 'beautiful', 'terrifying']

export default function StructuredDreamPost({ dream, onSubmit, onCancel }: StructuredDreamPostProps) {
  const [dreamTitle, setDreamTitle] = useState(dream.text?.slice(0, 60) || '')
  const [dreamType, setDreamType] = useState('')
  const [dreamMood, setDreamMood] = useState('')
  const [vividness, setVividness] = useState(5)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.toLowerCase().trim().replace(/\s+/g, '_')
    if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
      setTags([...tags, cleanTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async () => {
    if (!dreamTitle.trim() || !dreamType || !dreamMood) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        dream_id: dream.id,
        dream_title: dreamTitle,
        dream_type: dreamType,
        dream_mood: dreamMood,
        vividness,
        tags
      })
    } catch (err) {
      console.error('Error submitting dream:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Dream Preview */}
      {dream.panels?.[0]?.image_url && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-purple-500/20">
          <img src={dream.panels[0].image_url} alt="Dream preview" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Dream Title */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
          Dream Title *
        </label>
        <input
          type="text"
          value={dreamTitle}
          onChange={(e) => setDreamTitle(e.target.value)}
          placeholder="Give your dream a title..."
          className="w-full px-4 py-3 rounded-xl border"
          style={{ background: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
          maxLength={100}
        />
      </div>

      {/* Dream Type */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
          Dream Type *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DREAM_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setDreamType(type.value)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                dreamType === type.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="text-2xl mb-1">{type.emoji}</div>
              <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {type.label.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dream Mood */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
          Mood *
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DREAM_MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setDreamMood(mood.value)}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                dreamMood === mood.value
                  ? 'border-cyan-500 bg-cyan-500/20'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs font-medium" style={{ color: colors.textSecondary }}>
                {mood.label.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Vividness Slider */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
          Vividness: {vividness}/10
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={vividness}
            onChange={(e) => setVividness(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #5B2CFC 0%, #5B2CFC ${(vividness - 1) * 11.11}%, rgba(124, 58, 237, 0.2) ${(vividness - 1) * 11.11}%, rgba(124, 58, 237, 0.2) 100%)`
            }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: colors.textMuted }}>
            <span>Faint</span>
            <span>Vivid</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
          Tags (optional, max 5)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
              style={{ background: colors.purple + '20', color: colors.textPrimary }}
            >
              #{tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddTag(tagInput)
              }
            }}
            placeholder="Add tag..."
            className="flex-1 px-4 py-2 rounded-xl border text-sm"
            style={{ background: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {COMMON_TAGS.filter(t => !tags.includes(t)).slice(0, 6).map((tag) => (
            <button
              key={tag}
              onClick={() => handleAddTag(tag)}
              className="px-2 py-1 rounded-lg text-xs"
              style={{ background: colors.surface, color: colors.textSecondary }}
            >
              + #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl font-semibold"
          style={{ background: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !dreamTitle.trim() || !dreamType || !dreamMood}
          className="flex-1 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #5B2CFC, #8A2BE2)', color: 'white' }}
        >
          {submitting ? 'Sharing...' : '✨ Share Dream'}
        </button>
      </div>
    </div>
  )
}

