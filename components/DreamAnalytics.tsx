"use client"

import React, { useEffect, useState } from 'react'
import { calculateDreamStats, DreamStats } from '../lib/enhanced-store'

interface AnalyticsProps {
  darkMode?: boolean
}

export default function DreamAnalytics({ darkMode = true }: AnalyticsProps) {
  const [stats, setStats] = useState<DreamStats | null>(null)

  useEffect(() => {
    setStats(calculateDreamStats())
  }, [])

  if (!stats) {
    return <div className="p-6">Loading analytics...</div>
  }

  const lucidityPercentage = stats.totalDreams > 0 ? (stats.totalLucidDreams / stats.totalDreams) * 100 : 0
  const nightmarePercentage = stats.totalDreams > 0 ? (stats.totalNightmares / stats.totalDreams) * 100 : 0

  return (
    <div className={`p-8 space-y-6 rounded-2xl ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <h2 className={`text-4xl font-black mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        Dream Analytics
      </h2>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Dreams */}
        <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-purple-500/30' : 'bg-white border-purple-300'}`}>
          <div className={`text-3xl font-black mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {stats.totalDreams}
          </div>
          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Total Dreams</p>
        </div>

        {/* Lucid Dreams */}
        <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-blue-500/30' : 'bg-white border-blue-300'}`}>
          <div className={`text-3xl font-black mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {stats.totalLucidDreams}
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Lucid Dreams ({lucidityPercentage.toFixed(1)}%)
          </p>
        </div>

        {/* Nightmares */}
        <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-red-500/30' : 'bg-white border-red-300'}`}>
          <div className={`text-3xl font-black mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {stats.totalNightmares}
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Nightmares ({nightmarePercentage.toFixed(1)}%)
          </p>
        </div>

        {/* Dream Streak */}
        <div className={`p-6 rounded-xl border-2 ${darkMode ? 'bg-slate-800 border-orange-500/30' : 'bg-white border-orange-300'}`}>
          <div className={`text-3xl font-black mb-2 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
            {stats.dreamStreak}
          </div>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Day Streak
          </p>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lucidity Score */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Average Lucidity
          </h3>
          <div className="flex items-end gap-4">
            <div className={`text-4xl font-black ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {stats.averageLucidityScore.toFixed(1)}
            </div>
            <div className={`flex-1 h-12 rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
                style={{ width: `${(stats.averageLucidityScore / 10) * 100}%` }}
              />
            </div>
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>/10</span>
          </div>
        </div>

        {/* Mood Score */}
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Average Mood
          </h3>
          <div className="flex items-end gap-4">
            <div className={`text-4xl font-black ${
              stats.averageMoodScore > 5 ? (darkMode ? 'text-green-400' : 'text-green-600') :
              stats.averageMoodScore < 5 ? (darkMode ? 'text-red-400' : 'text-red-600') :
              (darkMode ? 'text-yellow-400' : 'text-yellow-600')
            }`}>
              {stats.averageMoodScore.toFixed(1)}
            </div>
            <div className={`flex-1 h-12 rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <div
                className={`h-full transition-all ${
                  stats.averageMoodScore > 5 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                  stats.averageMoodScore < 5 ? 'bg-gradient-to-r from-red-600 to-red-400' :
                  'bg-gradient-to-r from-yellow-600 to-yellow-400'
                }`}
                style={{ width: `${(stats.averageMoodScore / 10) * 100}%` }}
              />
            </div>
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>/10</span>
          </div>
        </div>
      </div>

      {/* Tag Breakdown */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Dream Tags Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.tagBreakdown).map(([tag, count]) => (
            <div key={tag} className="flex items-center gap-3">
              <span className={`capitalize font-bold text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {tag}
              </span>
              <div className={`flex-1 h-8 rounded overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all"
                  style={{ width: `${(count / Math.max(1, stats.totalDreams)) * 100}%` }}
                />
              </div>
              <span className={`font-bold w-8 text-right ${darkMode ? 'text-slate-300' : 'text-slate-900'}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Milestones
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.totalDreams >= 1 && (
            <div className={`p-4 rounded text-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="text-2xl mb-1">🎬</div>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>First Dream</p>
            </div>
          )}
          {stats.totalDreams >= 5 && (
            <div className={`p-4 rounded text-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="text-2xl mb-1">📚</div>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>5 Dreams</p>
            </div>
          )}
          {stats.totalDreams >= 20 && (
            <div className={`p-4 rounded text-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="text-2xl mb-1">⭐</div>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>20 Dreams</p>
            </div>
          )}
          {stats.totalLucidDreams >= 1 && (
            <div className={`p-4 rounded text-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="text-2xl mb-1">🌙</div>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Lucid Dream</p>
            </div>
          )}
          {stats.dreamStreak >= 7 && (
            <div className={`p-4 rounded text-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="text-2xl mb-1">🔥</div>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>7 Day Streak</p>
            </div>
          )}
          {stats.dreamStreak >= 30 && (
            <div className={`p-4 rounded text-center ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <div className="text-2xl mb-1">🏆</div>
              <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>30 Day Streak</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
