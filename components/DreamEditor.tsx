"use client"

import React, { useState, useEffect } from 'react'
import { saveDream, getDreamById, Dream } from '../lib/enhanced-store'

interface DreamEditorProps {
  dreamId?: string
  onSave?: (dream: Dream) => void
  darkMode?: boolean
}

export default function DreamEditor({ dreamId, onSave, darkMode = true }: DreamEditorProps) {
  const [dream, setDream] = useState<Dream | null>(null)
  const [notes, setNotes] = useState('')
  const [lucidityScore, setLucidityScore] = useState(5)
  const [moodScore, setMoodScore] = useState(5)
  const [tags, setTags] = useState<string[]>([])
  const [favorited, setFavorited] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (dreamId) {
      const loaded = getDreamById(dreamId)
      if (loaded) {
        setDream(loaded)
        setNotes(loaded.notes || '')
        setLucidityScore(loaded.lucidityScore || 5)
        setMoodScore(loaded.moodScore || 5)
        setTags(loaded.tags || [])
        setFavorited(loaded.favorited || false)
      }
    }
  }, [dreamId])

  const handleSave = async () => {
    if (!dream) return
    
    setSaving(true)
    const updated: Dream = {
      ...dream,
      notes,
      lucidityScore,
      moodScore,
      tags,
      favorited
    }
    
    saveDream(updated)
    onSave?.(updated)
    setSaving(false)
  }

  if (!dream) {
    return (
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>No dream selected</p>
      </div>
    )
  }

  return (
    <div className={`p-6 rounded-lg space-y-6 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
      {/* Dream Text */}
      <div>
        <h3 className="font-bold mb-2">Dream Description</h3>
        <p className={`p-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
          {dream.text}
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-bold mb-2">Your Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add personal notes or reflections..."
          rows={4}
          className={`w-full p-3 rounded border-2 resize-none ${
            darkMode
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        />
      </div>

      {/* Lucidity Score */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="font-bold">Lucidity Score</label>
          <span className="text-purple-500 font-bold">{lucidityScore}/10</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={lucidityScore}
          onChange={(e) => setLucidityScore(Number(e.target.value))}
          className="w-full accent-purple-600"
        />
        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          How aware were you that you were dreaming?
        </p>
      </div>

      {/* Mood Score */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="font-bold">Mood</label>
          <span className={`font-bold ${moodScore > 5 ? 'text-green-500' : moodScore < 5 ? 'text-red-500' : 'text-yellow-500'}`}>
            {moodScore < 5 ? '😢' : moodScore > 5 ? '😊' : '😐'} {moodScore}/10
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          value={moodScore}
          onChange={(e) => setMoodScore(Number(e.target.value))}
          className="w-full accent-pink-600"
        />
        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          0 = Negative, 10 = Positive
        </p>
      </div>

      {/* Favorite Toggle */}
      <div>
        <button
          onClick={() => setFavorited(!favorited)}
          className={`px-4 py-2 rounded font-bold transition-all ${
            favorited
              ? 'bg-yellow-500/30 text-yellow-300'
              : darkMode
              ? 'bg-slate-700 text-slate-400'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {favorited ? '⭐ Favorited' : '☆ Favorite'}
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 rounded font-bold transition-all ${
          saving
            ? 'opacity-50 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
        }`}
      >
        {saving ? '💾 Saving...' : '💾 Save Dream Details'}
      </button>
    </div>
  )
}
