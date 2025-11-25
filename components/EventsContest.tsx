'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { colors, gradients, shadows } from '@/lib/design'
import { Card, Chip, Button } from '@/components/ui/primitives'
import { LEADERBOARD, PRIZES, RULES, PAST_WINNERS } from '@/lib/mock-data'
import { enterContest, getContestEntries, type ContestEntry } from '@/lib/social'

const MEDAL = ['🥇', '🥈', '🥉']
const MEDAL_BG = ['linear-gradient(135deg, #ffd700, #ffed4a)', 'linear-gradient(135deg, #c0c0c0, #e8e8e8)', 'linear-gradient(135deg, #cd7f32, #daa06d)']

export default function EventsContest() {
  const { user } = useUser()
  const [tab, setTab] = useState<'leaderboard' | 'prizes' | 'rules'>('leaderboard')
  const [entries, setEntries] = useState<ContestEntry[]>([])
  const [showEnterModal, setShowEnterModal] = useState(false)
  const [dreamTitle, setDreamTitle] = useState('')
  
  const now = new Date()
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

  useEffect(() => {
    // Load contest entries
    const loadedEntries = getContestEntries()
    setEntries(loadedEntries)
  }, [])

  // Combine mock leaderboard with real entries
  const leaderboardData = entries.length > 0 
    ? entries.sort((a, b) => b.views - a.views).map((e, i) => ({ ...e, rank: i + 1 }))
    : LEADERBOARD

  const handleEnterContest = () => {
    if (!user || !dreamTitle.trim()) return
    const result = enterContest(
      `dream-${Date.now()}`,
      user.id,
      user.firstName || user.username || 'Dreamer',
      dreamTitle
    )
    if (result.success) {
      setShowEnterModal(false)
      setDreamTitle('')
      setEntries(getContestEntries())
      alert('🎉 Successfully entered the contest! Share your dream in the Gallery to get views.')
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Banner */}
      <div className="relative rounded-2xl p-8 overflow-hidden" style={{ background: `linear-gradient(135deg, ${colors.purple}20 0%, ${colors.cyan}20 100%)`, border: `2px solid ${colors.purple}`, boxShadow: shadows.glow }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🏆</span>
            <div>
              <h2 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>{now.toLocaleString('default', { month: 'long' })} Dream Views Contest</h2>
              <p style={{ color: colors.cyan }} className="font-semibold">Win Premium by getting the most views on your dream!</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-6">
            {[{ label: 'Time Remaining', value: `${daysLeft} days`, color: colors.cyan }, { label: 'Participants', value: `${LEADERBOARD.length}+`, color: colors.purple }, { label: 'Grand Prize', value: 'Premium 💎', color: colors.pink }].map(s => (
              <div key={s.label} className="px-6 py-3 rounded-xl" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>
                <p className="text-sm" style={{ color: colors.textMuted }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['leaderboard', 'prizes', 'rules'] as const).map(t => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t === 'leaderboard' ? '📊 Leaderboard' : t === 'prizes' ? '🎁 Prizes' : '📜 Rules'}
          </Chip>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <Card>
          <div className="space-y-3">
            {leaderboardData.map((e, i) => (
              <div key={('dreamId' in e ? e.dreamId : e.id) || i} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]" style={{ background: i < 3 ? `${MEDAL_BG[i].replace(')', ', 0.1)')}` : colors.backgroundDark, border: `1px solid ${i < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][i] : colors.border}` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl" style={{ background: i < 3 ? MEDAL_BG[i] : colors.surface, color: i < 3 ? colors.backgroundDark : colors.textMuted }}>{e.rank}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{e.avatar}</span>
                    <span className="font-bold" style={{ color: colors.textPrimary }}>{e.username}</span>
                    {i < 3 && <span className="text-lg">{MEDAL[i]}</span>}
                  </div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>&quot;{e.dreamTitle}&quot;</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: colors.cyan }}>{e.views.toLocaleString()} <span className="text-sm font-normal">views</span></p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>❤️ {e.likes}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button onClick={() => setShowEnterModal(true)}>🌟 Enter Contest - Share Your Dream</Button>
            <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>Share a dream publicly in the Gallery to compete</p>
          </div>
        </Card>
      )}

      {/* Enter Contest Modal */}
      {showEnterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full" style={{ background: colors.surface, border: `2px solid ${colors.purple}` }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>🏆 Enter Contest</h3>
              <button onClick={() => setShowEnterModal(false)} className="text-2xl" style={{ color: colors.textMuted }}>×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Dream Title</label>
                <input 
                  type="text" 
                  value={dreamTitle} 
                  onChange={e => setDreamTitle(e.target.value)} 
                  placeholder="My Epic Flying Dream" 
                  className="w-full px-4 py-3 rounded-xl border outline-none" 
                  style={{ background: colors.background, borderColor: colors.border, color: colors.textPrimary }} 
                />
              </div>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Your dream will be shared publicly in the Gallery where other users can view it. 
                The more views you get, the higher you&apos;ll rank!
              </p>
              <Button onClick={handleEnterContest} className="w-full">Submit Entry</Button>
            </div>
          </div>
        </div>
      )}

      {/* Prizes */}
      {tab === 'prizes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRIZES.map((p, i) => (
            <Card key={i}>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: i < 3 ? MEDAL_BG[i] : gradients.purpleCyan }}>{i < 3 ? MEDAL[i] : '🏅'}</div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{p.place}</h3>
                  <p className="text-lg font-semibold" style={{ color: colors.cyan }}>{p.reward}</p>
                  <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{p.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rules */}
      {tab === 'rules' && (
        <Card>
          <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>📜 Contest Rules</h3>
          <div className="space-y-3">
            {RULES.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: colors.backgroundDark }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: colors.purple, color: colors.white }}>{i + 1}</span>
                <p style={{ color: colors.textSecondary }}>{r}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl" style={{ background: `${colors.cyan}10`, border: `1px solid ${colors.cyan}30` }}>
            <p className="text-sm" style={{ color: colors.cyan }}>💡 <strong>Pro Tip:</strong> Dreams with eye-catching comic panels tend to get more views!</p>
          </div>
        </Card>
      )}

      {/* Past Winners */}
      <Card>
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.textPrimary }}>🏆 Past Winners</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PAST_WINNERS.map((w, i) => (
            <div key={i} className="p-4 rounded-xl text-center" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>
              <p className="text-sm" style={{ color: colors.textMuted }}>{w.month}</p>
              <div className="text-3xl my-2">{w.avatar}</div>
              <p className="font-bold" style={{ color: colors.textPrimary }}>{w.winner}</p>
              <p className="text-sm" style={{ color: colors.cyan }}>{w.views.toLocaleString()} views</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
