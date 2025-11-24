"use client"

import React, { useState } from 'react'

interface DreamAnalysisProps {
  dreamText: string
  darkMode?: boolean
}

export default function DreamAnalysis({ dreamText, darkMode = true }: DreamAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeWithAI = async () => {
    if (!dreamText) {
      setError('Please enter a dream description first')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Call a backend API that uses Claude or similar
      const response = await fetch('/api/analyze-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError('Failed to analyze dream. Try again later.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-6 rounded-lg space-y-4 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          🧠 Dream Analysis
        </h3>
        <button
          onClick={analyzeWithAI}
          disabled={loading || !dreamText}
          className={`px-4 py-2 rounded font-bold transition-all ${
            loading
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
          }`}
        >
          {loading ? '🔄 Analyzing...' : '✨ Analyze Dream'}
        </button>
      </div>

      {error && (
        <div className={`p-3 rounded text-sm ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
          {error}
        </div>
      )}

      {!analysis ? (
        <div className={`p-4 text-center rounded ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
          <p className="text-sm">Click "Analyze Dream" to get psychological insights</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Themes */}
          {analysis.themes && (
            <div>
              <h4 className={`font-bold mb-2 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                Recurring Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme: string, i: number) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded text-sm font-bold ${
                      darkMode ? 'bg-cyan-900/30 text-cyan-300' : 'bg-cyan-100 text-cyan-700'
                    }`}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Symbols */}
          {analysis.symbols && (
            <div>
              <h4 className={`font-bold mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Symbolic Meanings
              </h4>
              <div className="space-y-2">
                {Object.entries(analysis.symbols).map(([symbol, meaning]: [string, any], i) => (
                  <div key={i} className={`p-2 rounded text-sm ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <p className={`font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      {symbol}
                    </p>
                    <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                      {meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotional Insights */}
          {analysis.emotionalInsights && (
            <div>
              <h4 className={`font-bold mb-2 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                Emotional Insights
              </h4>
              <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {analysis.emotionalInsights}
              </p>
            </div>
          )}

          {/* Psychological Interpretation */}
          {analysis.interpretation && (
            <div>
              <h4 className={`font-bold mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Psychological Interpretation
              </h4>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {analysis.interpretation}
              </p>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions && (
            <div>
              <h4 className={`font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                Suggestions
              </h4>
              <ul className="space-y-1">
                {analysis.suggestions.map((suggestion: string, i: number) => (
                  <li key={i} className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
