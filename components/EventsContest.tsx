'use client'

import { useState } from 'react'
import { colors, gradients, shadows } from '@/lib/design'
import Card from '@/components/ui/Card'

interface ContestEntry {
  id: string
  username: string
  dreamTitle: string
  views: number
  likes: number
  rank: number
  avatar: string
}

// Mock leaderboard data - in production this would come from Supabase
const MOCK_LEADERBOARD: ContestEntry[] = [
  { id: '1', username: 'DreamWeaver42', dreamTitle: 'Flying Over Crystal Mountains', views: 2847, likes: 156, rank: 1, avatar: '🌟' },
  { id: '2', username: 'NightOwl_Luna', dreamTitle: 'The Underwater City', views: 2103, likes: 132, rank: 2, avatar: '🦉' },
  { id: '3', username: 'StarGazer99', dreamTitle: 'Chase Through Time', views: 1856, likes: 98, rank: 3, avatar: '⭐' },
  { id: '4', username: 'MoonDreamer', dreamTitle: 'Garden of Memories', views: 1432, likes: 87, rank: 4, avatar: '🌙' },
  { id: '5', username: 'CloudSurfer', dreamTitle: 'The Infinite Library', views: 1201, likes: 76, rank: 5, avatar: '☁️' },
  { id: '6', username: 'DreamCatcher_X', dreamTitle: 'Lost in the Mirror Maze', views: 987, likes: 65, rank: 6, avatar: '🔮' },
  { id: '7', username: 'NebulaNight', dreamTitle: 'Dancing with Shadows', views: 876, likes: 54, rank: 7, avatar: '🌌' },
  { id: '8', username: 'PhantomDreams', dreamTitle: 'The Clockwork Dragon', views: 743, likes: 43, rank: 8, avatar: '👻' },
  { id: '9', username: 'AuroraSkies', dreamTitle: 'Whispers of the Forest', views: 654, likes: 38, rank: 9, avatar: '🌈' },
  { id: '10', username: 'MysticVisions', dreamTitle: 'Portal to Nowhere', views: 521, likes: 29, rank: 10, avatar: '✨' },
]

const PRIZES = [
  { place: '🥇 1st Place', reward: '1 Month Premium FREE', description: 'Full access to all Premium features' },
  { place: '🥈 2nd Place', reward: '1 Month Pro FREE', description: 'Full access to all Pro features' },
  { place: '🥉 3rd Place', reward: '50% Off Pro (1 Month)', description: 'Half price on Pro subscription' },
  { place: '🏅 4th-10th', reward: 'Exclusive Badge', description: '"Top Dreamer" profile badge' },
]

const CONTEST_RULES = [
  'Share your dream publicly in the Gallery to enter',
  'Contest runs from the 1st to the last day of each month',
  'Views are counted from unique visitors only',
  'One entry per person - your highest-viewed dream counts',
  'Winners announced on the 1st of the following month',
  'Prize subscriptions activate automatically for winners',
]

export default function EventsContest() {
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'prizes' | 'rules'>('leaderboard')
  
  // Calculate days remaining in contest
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysRemaining = endOfMonth.getDate() - now.getDate()
  
  const currentMonth = now.toLocaleString('default', { month: 'long' })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Contest Banner */}
      <div
        className="relative rounded-2xl p-8 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.purple}20 0%, ${colors.cyan}20 100%)`,
          border: `2px solid ${colors.purple}`,
          boxShadow: shadows.glow,
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: `radial-gradient(circle, ${colors.cyan} 0%, transparent 70%)` }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h2 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
                {currentMonth} Dream Views Contest
              </h2>
              <p style={{ color: colors.cyan }} className="font-semibold">
                Win Premium by getting the most views on your dream!
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 mt-6">
            <div
              className="px-6 py-3 rounded-xl"
              style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}
            >
              <p className="text-sm" style={{ color: colors.textMuted }}>Time Remaining</p>
              <p className="text-2xl font-bold" style={{ color: colors.cyan }}>
                {daysRemaining} days
              </p>
            </div>
            
            <div
              className="px-6 py-3 rounded-xl"
              style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}
            >
              <p className="text-sm" style={{ color: colors.textMuted }}>Total Participants</p>
              <p className="text-2xl font-bold" style={{ color: colors.purple }}>
                {MOCK_LEADERBOARD.length}+
              </p>
            </div>
            
            <div
              className="px-6 py-3 rounded-xl"
              style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}
            >
              <p className="text-sm" style={{ color: colors.textMuted }}>Grand Prize</p>
              <p className="text-2xl font-bold" style={{ color: colors.pink }}>
                Premium 💎
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {[
          { key: 'leaderboard', label: '📊 Leaderboard', icon: '📊' },
          { key: 'prizes', label: '🎁 Prizes', icon: '🎁' },
          { key: 'rules', label: '📜 Rules', icon: '📜' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
            className="px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              background: selectedTab === tab.key ? gradients.button : colors.surface,
              color: selectedTab === tab.key ? colors.white : colors.textMuted,
              border: `1px solid ${selectedTab === tab.key ? colors.purple : colors.border}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Tab */}
      {selectedTab === 'leaderboard' && (
        <Card>
          <div className="space-y-3">
            {MOCK_LEADERBOARD.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{
                  background: index < 3 
                    ? `linear-gradient(90deg, ${index === 0 ? 'rgba(255,215,0,0.1)' : index === 1 ? 'rgba(192,192,192,0.1)' : 'rgba(205,127,50,0.1)'} 0%, transparent 100%)`
                    : colors.backgroundDark,
                  border: `1px solid ${index < 3 ? (index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32') : colors.border}`,
                }}
              >
                {/* Rank */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl"
                  style={{
                    background: index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4a)' 
                      : index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)'
                      : index === 2 ? 'linear-gradient(135deg, #cd7f32, #daa06d)'
                      : colors.surface,
                    color: index < 3 ? colors.backgroundDark : colors.textMuted,
                  }}
                >
                  {entry.rank}
                </div>

                {/* Avatar & Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{entry.avatar}</span>
                    <span className="font-bold" style={{ color: colors.textPrimary }}>
                      {entry.username}
                    </span>
                    {index < 3 && (
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    "{entry.dreamTitle}"
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: colors.cyan }}>
                    {entry.views.toLocaleString()} <span className="text-sm font-normal">views</span>
                  </p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    ❤️ {entry.likes}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: gradients.button,
                color: colors.white,
                boxShadow: shadows.glow,
              }}
            >
              🌟 Enter Contest - Share Your Dream
            </button>
            <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>
              Share a dream publicly in the Gallery to compete
            </p>
          </div>
        </Card>
      )}

      {/* Prizes Tab */}
      {selectedTab === 'prizes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRIZES.map((prize, index) => (
            <Card key={index}>
              <div className="flex items-start gap-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                  style={{
                    background: index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4a)'
                      : index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)'
                      : index === 2 ? 'linear-gradient(135deg, #cd7f32, #daa06d)'
                      : gradients.purpleCyan,
                  }}
                >
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                    {prize.place}
                  </h3>
                  <p className="text-lg font-semibold" style={{ color: colors.cyan }}>
                    {prize.reward}
                  </p>
                  <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                    {prize.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rules Tab */}
      {selectedTab === 'rules' && (
        <Card>
          <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
            📜 Contest Rules
          </h3>
          <div className="space-y-3">
            {CONTEST_RULES.map((rule, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: colors.backgroundDark }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: colors.purple, color: colors.white }}
                >
                  {index + 1}
                </span>
                <p style={{ color: colors.textSecondary }}>{rule}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-6 p-4 rounded-xl"
            style={{ background: `${colors.cyan}10`, border: `1px solid ${colors.cyan}30` }}
          >
            <p className="text-sm" style={{ color: colors.cyan }}>
              💡 <strong>Pro Tip:</strong> Dreams with eye-catching comic panels and detailed descriptions tend to get more views. Make your dream stand out!
            </p>
          </div>
        </Card>
      )}

      {/* Past Winners Section */}
      <Card>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>
          🏆 Past Winners
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { month: 'October 2025', winner: 'CosmicDreamer', views: 4521, avatar: '🚀' },
            { month: 'September 2025', winner: 'MidnightMuse', views: 3876, avatar: '🎭' },
            { month: 'August 2025', winner: 'DreamArchitect', views: 3245, avatar: '🏗️' },
          ].map((past, index) => (
            <div
              key={index}
              className="p-4 rounded-xl text-center"
              style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}
            >
              <p className="text-sm" style={{ color: colors.textMuted }}>{past.month}</p>
              <div className="text-3xl my-2">{past.avatar}</div>
              <p className="font-bold" style={{ color: colors.textPrimary }}>{past.winner}</p>
              <p className="text-sm" style={{ color: colors.cyan }}>{past.views.toLocaleString()} views</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
