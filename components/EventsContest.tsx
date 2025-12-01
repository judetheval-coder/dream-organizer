'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useDreams } from '@/hooks/useDreams'
import { colors, gradients, shadows } from '@/lib/design'
import { Card, Chip, Button } from '@/components/ui/primitives'
import { LEADERBOARD, PRIZES, RULES, PAST_WINNERS } from '@/lib/mock-data'
import { enterContest, getContestEntries, isDreamPublished, publishDreamToGallery, type ContestEntry } from '@/lib/social'

const MEDAL = ['🥇', '🥈', '🥉']
const MEDAL_BG = ['linear-gradient(135deg, #ffd700, #ffed4a)', 'linear-gradient(135deg, #c0c0c0, #e8e8e8)', 'linear-gradient(135deg, #cd7f32, #daa06d)']

export default function EventsContest() {
  const { user } = useUser()
  const [tab, setTab] = useState<'leaderboard' | 'prizes' | 'rules'>('leaderboard')
  const [entries, setEntries] = useState<ContestEntry[]>([])
  const [showEnterModal, setShowEnterModal] = useState(false)
  const [dreamTitle, setDreamTitle] = useState('')
  const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null)
  const [isSelectedDreamPublished, setIsSelectedDreamPublished] = useState<boolean | null>(null)
  const { dreams } = useDreams()

  const now = new Date()
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

  useEffect(() => {
    // Load contest entries
    getContestEntries().then(loadedEntries => {
      setEntries(loadedEntries)
    })
  }, [])

  useEffect(() => {
    // Set default selected dream to first available
    if (dreams && dreams.length && !selectedDreamId) {
      setSelectedDreamId(dreams[0].id)
    }
  }, [dreams, selectedDreamId])

  useEffect(() => {
    // When selection changes, fetch published state
    async function checkPublished() {
      if (!selectedDreamId) return
      const published = await isDreamPublished(selectedDreamId)
      setIsSelectedDreamPublished(published)
    }
    checkPublished()
  }, [selectedDreamId])

  // Combine mock leaderboard with real entries
  const leaderboardData = entries.length > 0
    ? entries.sort((a, b) => b.views - a.views).map((e, i) => ({ ...e, rank: i + 1 }))
    : LEADERBOARD

  const handleEnterContest = async () => {
    if (!user || !selectedDreamId) return
    const dreamId = selectedDreamId
    // Ensure dream is published
    const published = await isDreamPublished(dreamId)
    if (!published) {
      alert('Please publish your dream to the public Gallery before entering the contest.')
      return
    }
    const selected = dreams?.find(d => d.id === dreamId)
    const title = selected?.text?.slice(0, 100) || dreamTitle || 'Untitled Dream'
    const result = await enterContest(
      dreamId,
      user.id,
      user.firstName || user.username || 'Dreamer',
      title
    )
    if (result.success) {
      setShowEnterModal(false)
      setDreamTitle('')
      setSelectedDreamId(null)
      const updated = await getContestEntries()
      setEntries(updated)
      alert('🎉 Successfully entered the contest! Share your dream in the Gallery to get views.')
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Banner */}
      <div className="relative rounded-3xl p-10 overflow-hidden shadow-xl" style={{ background: `linear-gradient(135deg, ${colors.purple}20 0%, ${colors.cyan}20 100%)`, border: `2px solid ${colors.purple}`, boxShadow: shadows.glow }}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">🏆</span>
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-1" style={{ color: colors.textPrimary }}>{now.toLocaleString('default', { month: 'long' })} Dream Views Contest</h2>
              <p style={{ color: colors.cyan }} className="font-semibold text-lg">Win Premium by getting the most views on your dream!</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 mt-8">
            {[{ label: 'Time Remaining', value: `${daysLeft} days`, color: colors.cyan }, { label: 'Participants', value: `${LEADERBOARD.length}+`, color: colors.purple }, { label: 'Grand Prize', value: 'Premium 💎', color: colors.pink }].map(s => (
              <div key={s.label} className="px-8 py-4 rounded-2xl shadow-sm" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>
                <p className="text-base font-medium" style={{ color: colors.textMuted }}>{s.label}</p>
                <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        {(['leaderboard', 'prizes', 'rules'] as const).map(t => (
          <Chip key={t} active={tab === t} onClick={() => setTab(t)}>
            {t === 'leaderboard' ? '📊 Leaderboard' : t === 'prizes' ? '🎁 Prizes' : '📜 Rules'}
          </Chip>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <Card className="rounded-2xl shadow-lg">
          <div className="space-y-4">
            {leaderboardData.map((e, i) => (
              <div key={String('dreamId' in e ? e.dreamId : e.id) || String(i)} className="flex items-center gap-6 p-5 rounded-2xl transition-all hover:scale-[1.01] shadow-sm" style={{ background: i < 3 ? `${MEDAL_BG[i].replace(')', ', 0.1)')}` : colors.backgroundDark, border: `1px solid ${i < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][i] : colors.border}` }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-2xl" style={{ background: i < 3 ? MEDAL_BG[i] : colors.surface, color: i < 3 ? colors.backgroundDark : colors.textMuted }}>{e.rank}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{e.avatar}</span>
                    <span className="font-extrabold text-lg" style={{ color: colors.textPrimary }}>{e.username}</span>
                    {i < 3 && <span className="text-xl">{MEDAL[i]}</span>}
                  </div>
                  <p className="text-base font-medium" style={{ color: colors.textMuted }}>&quot;{e.dreamTitle}&quot;</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold" style={{ color: colors.cyan }}>{e.views.toLocaleString()} <span className="text-base font-normal">views</span></p>
                  <p className="text-base font-medium" style={{ color: colors.textMuted }}>❤️ {e.likes}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button onClick={() => setShowEnterModal(true)} className="text-lg font-bold px-8 py-4 rounded-2xl shadow">🌟 Enter Contest - Share Your Dream</Button>
            <p className="mt-3 text-base font-medium" style={{ color: colors.textMuted }}>Share a dream publicly in the Gallery to compete</p>
          </div>
        </Card>
      )}

      {/* Enter Contest Modal */}
      {showEnterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl p-8 max-w-md w-full shadow-xl" style={{ background: colors.surface, border: `2px solid ${colors.purple}` }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: colors.textPrimary }}>🏆 Enter Contest</h3>
              <button onClick={() => setShowEnterModal(false)} className="text-2xl font-bold" style={{ color: colors.textMuted }}>&times;</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-base font-semibold mb-2" style={{ color: colors.textSecondary }}>Select a Dream</label>
                {dreams && dreams.length ? (
                  <select value={selectedDreamId || ''} onChange={async (e) => {
                    const id = e.target.value
                    setSelectedDreamId(id || null)
                    if (id) {
                      const published = await isDreamPublished(id)
                      setIsSelectedDreamPublished(published)
                    }
                  }} className="w-full px-5 py-3 rounded-2xl border outline-none text-lg font-medium" style={{ background: colors.background, borderColor: colors.border, color: colors.textPrimary }}>
                    {dreams.map(d => (
                      <option key={d.id} value={d.id}>{d.text?.slice(0, 70) || `Dream ${d.id.slice(0, 6)}`}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={dreamTitle}
                    onChange={e => setDreamTitle(e.target.value)}
                    placeholder="My Epic Flying Dream"
                    className="w-full px-5 py-3 rounded-2xl border outline-none text-lg font-medium"
                    style={{ background: colors.background, borderColor: colors.border, color: colors.textPrimary }}
                  />
                )}
                {selectedDreamId && isSelectedDreamPublished === false && (
                  <p className="text-sm mt-2" style={{ color: colors.textMuted }}>This dream isn't shared in the Gallery yet. You must publish it to enter the contest.</p>
                )}
              </div>
              <p className="text-base font-medium" style={{ color: colors.textMuted }}>
                Your dream will be shared publicly in the Gallery where other users can view it.
                The more views you get, the higher you&apos;ll rank!
              </p>
              <div className="flex gap-3">
                <Button onClick={handleEnterContest} className="flex-1 text-lg font-bold py-3 rounded-2xl">Submit Entry</Button>
                {selectedDreamId && isSelectedDreamPublished === false && (
                  <Button onClick={async () => {
                    if (!user || !selectedDreamId) return
                    const publishedRes = await publishDreamToGallery(selectedDreamId, user.id)
                    if (publishedRes.success) {
                      const res = await enterContest(selectedDreamId, user.id, user.firstName || user.username || 'Dreamer', dreams?.find(d => d.id === selectedDreamId)?.text || 'Untitled')
                      if (res.success) {
                        setShowEnterModal(false)
                        const updated = await getContestEntries()
                        setEntries(updated)
                        alert('🎉 Dream published and entered into the contest!')
                      } else {
                        alert(res.error)
                      }
                    } else {
                      alert(publishedRes.error || 'Failed to publish dream')
                    }
                  }} className="flex-1 text-sm py-3 rounded-2xl">Publish & Enter</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prizes */}
      {tab === 'prizes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRIZES.map((p, i) => (
            <Card key={i} className="rounded-2xl shadow-md">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: i < 3 ? MEDAL_BG[i] : gradients.purpleCyan }}>{i < 3 ? MEDAL[i] : '💭'}</div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: colors.textPrimary }}>{p.place}</h3>
                  <p className="text-lg font-semibold" style={{ color: colors.cyan }}>{p.reward}</p>
                  <p className="text-base mt-2 font-medium" style={{ color: colors.textMuted }}>{p.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Rules */}
      {tab === 'rules' && (
        <Card className="rounded-2xl shadow-md">
          <h3 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: colors.textPrimary }}>📜 Contest Rules</h3>
          <div className="space-y-4">
            {RULES.map((r, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ background: colors.backgroundDark }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0" style={{ background: colors.purple, color: colors.white }}>{i + 1}</span>
                <p className="text-base font-medium" style={{ color: colors.textSecondary }}>{r}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 p-5 rounded-2xl" style={{ background: `${colors.cyan}10`, border: `1px solid ${colors.cyan}30` }}>
            <p className="text-base font-medium" style={{ color: colors.cyan }}>💡 <strong>Pro Tip:</strong> Dreams with eye-catching comic panels tend to get more views!</p>
          </div>
        </Card>
      )}

      {/* Past Winners */}
      <Card className="rounded-2xl shadow-md">
        <h3 className="text-2xl font-extrabold mb-6 tracking-tight" style={{ color: colors.textPrimary }}>🏆 Past Winners</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAST_WINNERS.map((w, i) => (
            <div key={i} className="p-6 rounded-2xl text-center shadow-sm" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>
              <p className="text-base font-medium" style={{ color: colors.textMuted }}>{w.month}</p>
              <div className="text-4xl my-3">{w.avatar}</div>
              <p className="font-extrabold text-lg" style={{ color: colors.textPrimary }}>{w.winner}</p>
              <p className="text-lg font-semibold" style={{ color: colors.cyan }}>{w.views.toLocaleString()} views</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
