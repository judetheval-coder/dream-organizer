'use client'

import { useEffect, useState } from 'react'
import { colors } from '@/lib/design'
import Card from '@/components/ui/Card'
import Panel from '@/components/Panel'

interface DailyChallenge {
    id: number
    prompt: string
    style: string
    mood: string
    challenge_date: string
}

interface Submission {
    id: number
    dream_id: number
    votes: number
    user_id: string
    dream?: {
        text: string
        panels: Array<{ image_url: string; description: string }>
    }
}

export default function DailyChallengePage() {
    const [challenge, setChallenge] = useState<DailyChallenge | null>(null)
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        fetchChallenge()

        // Countdown timer to next challenge (midnight UTC)
        const updateCountdown = () => {
            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
            tomorrow.setUTCHours(0, 0, 0, 0)

            const diff = tomorrow.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeUntilNext({ hours, minutes, seconds })
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
    }, [])

    const fetchChallenge = async () => {
        try {
            const response = await fetch('/api/challenge/today')
            const data = await response.json()
            setChallenge(data.challenge)
            setSubmissions(data.submissions || [])
            setHasSubmitted(data.hasSubmitted || false)
        } catch (error) {
            console.error('Error fetching challenge:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVote = async (submissionId: number) => {
        try {
            await fetch('/api/challenge/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId })
            })

            // Refresh submissions
            fetchChallenge()
        } catch (error) {
            console.error('Error voting:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: colors.backgroundDark }}>
                <div className="max-w-6xl mx-auto text-center py-12">
                    <div className="loading-dream-dust mb-4">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <p style={{ color: colors.textMuted }}>Loading today's challenge...</p>
                </div>
            </div>
        )
    }

    // Sample upcoming challenge themes
    const upcomingThemes = [
        { theme: 'Flying Dreams', icon: '🦋', day: 'Tomorrow', description: 'Soar through dreamscapes' },
        { theme: 'Underwater Adventure', icon: '🌊', day: 'Wednesday', description: 'Explore ocean depths' },
        { theme: 'Space Exploration', icon: '🚀', day: 'Thursday', description: 'Journey to the stars' },
        { theme: 'Enchanted Forest', icon: '🌲', day: 'Friday', description: 'Mystical woodland tales' },
    ]

    if (!challenge) {
        return (
            <div className="min-h-screen p-8" style={{ background: colors.backgroundDark }}>
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Hero Section */}
                    <div 
                        className="relative overflow-hidden rounded-3xl p-10"
                        style={{
                            background: `linear-gradient(135deg, ${colors.backgroundDark} 0%, rgba(124,58,237,0.15) 50%, rgba(6,182,212,0.15) 100%)`,
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        {/* Animated background blobs */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div 
                                className="absolute top-10 left-10 w-40 h-40 rounded-full blur-3xl opacity-30 animate-pulse"
                                style={{ background: colors.purple }}
                            />
                            <div 
                                className="absolute bottom-10 right-10 w-48 h-48 rounded-full blur-3xl opacity-30 animate-pulse"
                                style={{ background: colors.cyan, animationDelay: '1s' }}
                            />
                            <div 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full blur-3xl opacity-20 animate-pulse"
                                style={{ background: colors.pink, animationDelay: '2s' }}
                            />
                        </div>

                        <div className="relative z-10 text-center">
                            {/* Trophy animation */}
                            <div className="relative inline-block mb-8">
                                <div className="text-8xl float-gentle">🏆</div>
                                <div className="absolute -top-4 -right-4 text-3xl animate-pulse">✨</div>
                                <div className="absolute -bottom-2 -left-4 text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
                                <div className="absolute top-0 right-8 text-xl animate-pulse" style={{ animationDelay: '1s' }}>💫</div>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                                Challenge Incoming!
                            </h1>
                            <p className="text-xl mb-8 max-w-xl mx-auto" style={{ color: colors.textMuted }}>
                                A new creative challenge is being crafted. Prepare your imagination and get ready to compete!
                            </p>

                            {/* Countdown Timer */}
                            <div className="mb-10">
                                <p className="text-sm mb-4 uppercase tracking-widest font-semibold" style={{ color: colors.purple }}>
                                    ⏰ Next Challenge Drops In
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    {[
                                        { value: timeUntilNext.hours, label: 'Hours' },
                                        { value: timeUntilNext.minutes, label: 'Minutes' },
                                        { value: timeUntilNext.seconds, label: 'Seconds' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="text-center">
                                            <div 
                                                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold mb-2 transition-all hover:scale-105"
                                                style={{
                                                    background: `linear-gradient(135deg, ${colors.purple}40, ${colors.cyan}40)`,
                                                    border: `2px solid ${colors.purple}60`,
                                                    color: colors.textPrimary,
                                                    boxShadow: `0 8px 32px ${colors.purple}30`,
                                                }}
                                            >
                                                {String(item.value).padStart(2, '0')}
                                            </div>
                                            <span className="text-sm uppercase tracking-wide font-medium" style={{ color: colors.textMuted }}>
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    className="px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.purple}, ${colors.pink})`,
                                        color: 'white',
                                        boxShadow: `0 8px 32px ${colors.purple}40`,
                                    }}
                                >
                                    <span>🔔</span> Get Notified
                                </button>
                                <a
                                    href="/dashboard"
                                    className="px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
                                    style={{
                                        background: 'transparent',
                                        color: colors.textPrimary,
                                        border: `2px solid ${colors.border}`,
                                    }}
                                >
                                    Practice Creating Dreams →
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Themes */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: colors.textPrimary }}>
                            <span>📅</span> Upcoming Challenge Themes
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {upcomingThemes.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 rounded-xl transition-all hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group"
                                    style={{
                                        background: colors.surface,
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                                            style={{ 
                                                background: `linear-gradient(135deg, ${colors.purple}25, ${colors.cyan}25)`,
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg" style={{ color: colors.textPrimary }}>{item.theme}</p>
                                            <p className="text-sm" style={{ color: colors.textMuted }}>{item.description}</p>
                                        </div>
                                        <div 
                                            className="px-3 py-1 rounded-full text-xs font-medium"
                                            style={{ 
                                                background: `${colors.purple}20`,
                                                color: colors.purple 
                                            }}
                                        >
                                            {item.day}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hall of Fame */}
                    <div 
                        className="p-8 rounded-2xl text-center"
                        style={{
                            background: `linear-gradient(135deg, rgba(234,179,8,0.15), rgba(236,72,153,0.15))`,
                            border: `1px solid rgba(234,179,8,0.3)`,
                        }}
                    >
                        <div className="text-5xl mb-4">🥇🥈🥉</div>
                        <h3 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                            Hall of Fame Awaits
                        </h3>
                        <p className="text-lg mb-4 max-w-lg mx-auto" style={{ color: colors.textMuted }}>
                            Win challenges to earn the exclusive <span className="font-bold" style={{ color: '#f59e0b' }}>Challenge Champion</span> badge and eternal glory!
                        </p>
                        <div 
                            className="inline-flex items-center gap-3 px-5 py-3 rounded-full"
                            style={{ 
                                background: 'rgba(245,158,11,0.2)',
                                border: '1px solid rgba(245,158,11,0.4)'
                            }}
                        >
                            <span className="text-3xl">🏅</span>
                            <span className="font-bold" style={{ color: '#f59e0b' }}>Epic Rarity Badge</span>
                        </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                            className="p-5 rounded-xl flex items-start gap-4"
                            style={{
                                background: `${colors.purple}15`,
                                border: `1px solid ${colors.purple}30`,
                            }}
                        >
                            <span className="text-3xl">💡</span>
                            <div>
                                <p className="font-bold mb-1" style={{ color: colors.textPrimary }}>Pro Tip</p>
                                <p className="text-sm" style={{ color: colors.textMuted }}>
                                    Practice creating dreams before challenges to improve your skills and speed!
                                </p>
                            </div>
                        </div>
                        <div 
                            className="p-5 rounded-xl flex items-start gap-4"
                            style={{
                                background: `${colors.cyan}15`,
                                border: `1px solid ${colors.cyan}30`,
                            }}
                        >
                            <span className="text-3xl">🎯</span>
                            <div>
                                <p className="font-bold mb-1" style={{ color: colors.textPrimary }}>How to Win</p>
                                <p className="text-sm" style={{ color: colors.textMuted }}>
                                    Create unique, creative interpretations that match the prompt's mood and style.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8" style={{ background: colors.backgroundDark }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏆</div>
                    <h1 className="text-4xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                        Daily Dream Challenge
                    </h1>
                    <p className="text-lg" style={{ color: colors.textMuted }}>
                        {new Date(challenge.challenge_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Challenge Prompt */}
                <Card className="mb-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                            Today's Prompt
                        </h2>
                        <p className="text-xl mb-4" style={{ color: colors.cyan }}>
                            "{challenge.prompt}"
                        </p>
                        <div className="flex items-center justify-center gap-4 text-sm" style={{ color: colors.textMuted }}>
                            <span>🎨 Style: {challenge.style}</span>
                            <span>•</span>
                            <span>💭 Mood: {challenge.mood}</span>
                        </div>

                        {!hasSubmitted && (
                            <a
                                href="/dashboard?tab=Dashboard"
                                className="mt-6 inline-block px-8 py-3 rounded-lg font-bold transition-all hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                                    color: 'white'
                                }}
                            >
                                Create Your Entry ✨
                            </a>
                        )}

                        {hasSubmitted && (
                            <div className="mt-6 p-4 rounded-lg" style={{ background: colors.backgroundDark, border: `1px solid ${colors.cyan}` }}>
                                <p style={{ color: colors.cyan }}>
                                    ✅ You've submitted an entry! Check the submissions below.
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Top Submissions */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                        🎨 Top Submissions
                    </h2>
                </div>

                {submissions.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">🌟</div>
                            <p style={{ color: colors.textMuted }}>
                                No submissions yet. Be the first!
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {submissions.map((submission, index) => (
                            <Card key={submission.id} className="relative">
                                {index < 3 && (
                                    <div className="absolute top-4 left-4 z-10 text-3xl">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                    </div>
                                )}

                                {submission.dream?.panels?.[0] && (
                                    <div className="mb-4">
                                        <Panel
                                            image={submission.dream.panels[0].image_url}
                                            description={submission.dream.panels[0].description}
                                            style={challenge.style}
                                            mood={challenge.mood}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                            Creator {submission.user_id.substring(0, 8)}
                                        </p>
                                        <p className="text-xs" style={{ color: colors.textMuted }}>
                                            {submission.votes} votes
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleVote(submission.id)}
                                        className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                                        style={{
                                            background: colors.surface,
                                            color: colors.cyan,
                                            border: `1px solid ${colors.border}`
                                        }}
                                    >
                                        ❤️ Vote
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
