"use client"

import { useState } from 'react'

export default function AIToolsModal({ dream }: { dream: string }) {
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState<any>(null)
  const [mood, setMood] = useState<any>(null)

  const generateRoadmap = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream })
      })
      const data = await res.json()
      setRoadmap(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeMood = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mood-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: dream })
      })
      const data = await res.json()
      setMood(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={generateRoadmap}
          disabled={loading}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-[#5B2CFC] to-[#8A2BE2] text-white rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? '⏳ Generating...' : '🗺️ Generate Roadmap'}
        </button>
        <button
          onClick={analyzeMood}
          disabled={loading}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-[#8A2BE2] to-[#03DAC6] text-white rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? '⏳ Analyzing...' : '😊 Analyze Mood'}
        </button>
      </div>

      {roadmap && (
        <div className="bg-[rgba(30,30,30,0.9)] border border-[rgba(138,43,226,0.3)] rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">🗺️ AI-Generated Roadmap</h3>
          <div className="space-y-3 mb-4">
            {roadmap.roadmap.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-[#B0B0B0]">
                <span className="text-[#03DAC6] font-bold">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-[#666]">⏱️ {roadmap.estimatedTime}</span>
            <span className="text-[#666]">📊 {roadmap.difficulty}</span>
          </div>
        </div>
      )}

      {mood && (
        <div className="bg-[rgba(30,30,30,0.9)] border border-[rgba(138,43,226,0.3)] rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{mood.emoji}</span>
            <div>
              <h3 className="text-2xl font-bold text-white">Mood: {mood.mood}</h3>
              <p className="text-[#666]">{mood.confidence}% confidence</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[#B0B0B0] font-medium">Suggestions:</p>
            {mood.suggestions.map((suggestion: string, i: number) => (
              <p key={i} className="text-[#666]">• {suggestion}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
