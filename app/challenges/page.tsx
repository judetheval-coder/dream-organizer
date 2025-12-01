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

    useEffect(() => {
        fetchChallenge()
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
                    <div className="animate-pulse text-6xl mb-4">🏆</div>
                    <p style={{ color: colors.textMuted }}>Loading today's challenge...</p>
                </div>
            </div>
        )
    }

    if (!challenge) {
        return (
            <div className="min-h-screen p-8" style={{ background: colors.backgroundDark }}>
                <div className="max-w-6xl mx-auto text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                        No Challenge Today
                    </h1>
                    <p style={{ color: colors.textMuted }}>
                        Check back tomorrow for a new challenge!
                    </p>
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
