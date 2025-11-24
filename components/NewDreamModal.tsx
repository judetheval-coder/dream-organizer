"use client"

import { useState, FormEvent } from 'react'

type MoodOption = 'happy' | 'neutral' | 'anxious' | 'scared' | 'excited' | 'sad' | 'peaceful'

type NewDreamFormState = {
  title: string
  description: string
  sleepDate: string
  vividness: number
  mood: MoodOption
  category: string
  emoji: string
  isLucid: boolean
  isNightmare: boolean
  isRecurring: boolean
  tags: string
  people: string
  places: string
}

type DraftDream = Omit<NewDreamFormState, 'tags' | 'people' | 'places'> & {
  id: number
  tags: string[]
  people: string[]
  places: string[]
  status: 'recent'
  notes: string[]
  createdAt: string
  updatedAt: string
}

type NewDreamModalProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (dream: DraftDream) => void
}

export default function NewDreamModal({ isOpen, onClose, onSave }: NewDreamModalProps) {
  const [formData, setFormData] = useState<NewDreamFormState>({
    title: '',
    description: '',
    sleepDate: new Date().toISOString().split('T')[0],
    vividness: 3,
    mood: 'neutral',
    category: 'Adventure',
    emoji: '💭',
    isLucid: false,
    isNightmare: false,
    isRecurring: false,
    tags: '',
    people: '',
    places: ''
  })

  const emojis = ['💭', '🌙', '✨', '🦋', '🌈', '🔮', '🌟', '🦅', '🌊', '🏔️']
  const categories = ['Adventure', 'Mystery', 'Nightmare', 'Memory', 'Fantasy', 'Lucid', 'Symbolic', 'Flying', 'Other']
  const moods: MoodOption[] = ['happy', 'neutral', 'anxious', 'scared', 'excited', 'sad', 'peaceful']
  
  const moodEmojis: Record<MoodOption, string> = {
    happy: '😊',
    neutral: '😐',
    anxious: '😰',
    scared: '😱',
    excited: '🤩',
    sad: '😢',
    peaceful: '😌'
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      id: Date.now(),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      people: formData.people.split(',').map(p => p.trim()).filter(p => p),
      places: formData.places.split(',').map(p => p.trim()).filter(p => p),
      status: 'recent',
      notes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    setFormData({ 
      title: '', 
      description: '', 
      sleepDate: new Date().toISOString().split('T')[0],
      vividness: 3,
      mood: 'neutral',
      category: 'Adventure', 
      emoji: '💭',
      isLucid: false,
      isNightmare: false,
      isRecurring: false,
      tags: '',
      people: '',
      places: ''
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1E1E1E] border border-[rgba(138,43,226,0.3)] rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#5B2CFC] to-[#03DAC6] bg-clip-text text-transparent">
            ✨ Record New Dream
          </h2>
          <button onClick={onClose} className="text-[#B0B0B0] hover:text-white text-2xl transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emoji Picker */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">Choose Icon</label>
            <div className="flex gap-3 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                    formData.emoji === emoji 
                      ? 'bg-gradient-to-br from-[#5B2CFC] to-[#8A2BE2] scale-110' 
                      : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">Dream Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Flying Over the City"
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white placeholder-[#666] focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what happened in your dream..."
              rows={4}
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white placeholder-[#666] focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            />
          </div>

          {/* Sleep Date */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">When did you have this dream?</label>
            <input
              type="date"
              required
              value={formData.sleepDate}
              onChange={(e) => setFormData({ ...formData, sleepDate: e.target.value })}
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            />
          </div>

          {/* Vividness Slider */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">
              Vividness ({formData.vividness}/5) {'⭐'.repeat(formData.vividness)}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={formData.vividness}
              onChange={(e) => setFormData({ ...formData, vividness: parseInt(e.target.value) })}
              className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-lg appearance-none cursor-pointer accent-[#8A2BE2]"
            />
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">Mood</label>
            <div className="flex gap-2 flex-wrap">
              {moods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood })}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    formData.mood === mood 
                      ? 'bg-gradient-to-br from-[#5B2CFC] to-[#8A2BE2] scale-105' 
                      : 'bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)]'
                  }`}
                >
                  <span className="text-xl">{moodEmojis[mood]}</span>
                  <span className="text-sm capitalize">{mood}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Dream Type Checkboxes */}
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isLucid}
                onChange={(e) => setFormData({ ...formData, isLucid: e.target.checked })}
                className="w-5 h-5 rounded accent-[#8A2BE2]"
              />
              <span className="text-white">✨ Lucid Dream</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNightmare}
                onChange={(e) => setFormData({ ...formData, isNightmare: e.target.checked })}
                className="w-5 h-5 rounded accent-red-500"
              />
              <span className="text-white">😱 Nightmare</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="w-5 h-5 rounded accent-purple-500"
              />
              <span className="text-white">🔁 Recurring</span>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., flying, city, colors, supernatural"
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white placeholder-[#666] focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            />
          </div>

          {/* People */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">People in Dream (comma-separated)</label>
            <input
              type="text"
              value={formData.people}
              onChange={(e) => setFormData({ ...formData, people: e.target.value })}
              placeholder="e.g., Mom, old friend, stranger"
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white placeholder-[#666] focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            />
          </div>

          {/* Places */}
          <div>
            <label className="block text-sm font-semibold text-[#03DAC6] tracking-wide uppercase mb-3">Places/Locations (comma-separated)</label>
            <input
              type="text"
              value={formData.places}
              onChange={(e) => setFormData({ ...formData, places: e.target.value })}
              placeholder="e.g., beach, childhood home, unknown city"
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl p-4 text-white placeholder-[#666] focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#5B2CFC] to-[#03DAC6] hover:from-[#6B3CFF] hover:to-[#13EAD6] text-white font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-105 shadow-lg shadow-[rgba(91,44,252,0.5)]"
          >
            💾 Save Dream
          </button>
        </form>
      </div>
    </div>
  )
}
