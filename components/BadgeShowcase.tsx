'use client'

import { useEffect, useState } from 'react'
import { colors } from '@/lib/design'
import { BADGES, RARITY_COLORS, type BadgeId } from '@/lib/badges'

// Define unlock requirements for each badge
const UNLOCK_REQUIREMENTS: Record<string, string> = {
    first_dream: 'Create your first dream',
    five_dreams: 'Create 5 dreams',
    ten_dreams: 'Create 10 dreams',
    fifty_dreams: 'Create 50 dreams',
    first_share: 'Share your first dream',
    ten_shares: 'Share 10 dreams',
    hundred_views: 'Get 100 views on a dream',
    thousand_views: 'Get 1,000 views on a dream',
    ten_likes: 'Get 10 likes on a dream',
    hundred_likes: 'Get 100 likes on a dream',
    early_adopter: 'Be among the first 1000 users',
    referral_master: 'Invite 5 friends',
    challenge_winner: 'Win a daily challenge',
    streak_seven: 'Log dreams for 7 days in a row',
    streak_thirty: 'Log dreams for 30 days in a row',
}

// Rarity order for sorting
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary']

interface BadgeDisplayProps {
    badge: typeof BADGES[keyof typeof BADGES]
    isUnlocked: boolean
    earnedAt?: string
    size?: 'small' | 'medium' | 'large'
}

export function BadgeDisplay({ badge, isUnlocked, earnedAt, size = 'medium' }: BadgeDisplayProps) {
    const sizes = {
        small: { emoji: 'text-2xl', container: 'w-20 h-20', text: 'text-xs', chain: 'text-lg' },
        medium: { emoji: 'text-4xl', container: 'w-28 h-28', text: 'text-sm', chain: 'text-2xl' },
        large: { emoji: 'text-6xl', container: 'w-36 h-36', text: 'text-base', chain: 'text-3xl' },
    }

    const s = sizes[size]
    const rarityColor = RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS]

    return (
        <div className={`text-center group relative ${isUnlocked ? '' : 'opacity-90'}`}>
            {/* Badge container */}
            <div className="relative mx-auto mb-3">
                {/* Glow effect for unlocked badges */}
                {isUnlocked && (
                    <div
                        className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse"
                        style={{ background: rarityColor }}
                    />
                )}

                {/* Main badge circle */}
                <div
                    className={`${s.container} mx-auto rounded-full flex items-center justify-center relative transition-all duration-300 ${isUnlocked
                            ? 'hover:scale-110 cursor-pointer'
                            : 'grayscale'
                        }`}
                    style={{
                        background: isUnlocked
                            ? `linear-gradient(135deg, ${rarityColor}50 0%, ${rarityColor}20 100%)`
                            : 'linear-gradient(135deg, rgba(30,30,40,0.8) 0%, rgba(20,20,30,0.9) 100%)',
                        border: `3px solid ${isUnlocked ? rarityColor : 'rgba(60,60,80,0.5)'}`,
                        boxShadow: isUnlocked
                            ? `0 0 20px ${rarityColor}40, inset 0 0 20px ${rarityColor}20`
                            : 'inset 0 0 30px rgba(0,0,0,0.5)',
                    }}
                >
                    {/* Emoji */}
                    <span className={`${s.emoji} ${isUnlocked ? '' : 'opacity-30 blur-[2px]'} select-none`}>
                        {badge.emoji}
                    </span>

                    {/* Locked overlay with chains */}
                    {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* Chain pattern overlay */}
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                {/* Diagonal chains */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-gray-500/60 to-transparent"
                                        style={{ transform: 'rotate(45deg)' }}
                                    />
                                    <div
                                        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-gray-500/60 to-transparent"
                                        style={{ transform: 'rotate(-45deg)' }}
                                    />
                                </div>

                                {/* Lock icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(40,40,50,0.9), rgba(30,30,40,0.95))',
                                            border: '2px solid rgba(80,80,100,0.5)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                                        }}
                                    >
                                        <span className="text-xl">🔒</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chain links around the edge */}
                            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                                <span className={`${s.chain} opacity-60`}>⛓️</span>
                            </div>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 rotate-180">
                                <span className={`${s.chain} opacity-60`}>⛓️</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rarity indicator */}
                <div
                    className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${isUnlocked ? '' : 'opacity-50'
                        }`}
                    style={{
                        background: `linear-gradient(135deg, ${rarityColor}90, ${rarityColor}70)`,
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        boxShadow: `0 2px 8px ${rarityColor}40`
                    }}
                >
                    {badge.rarity}
                </div>
            </div>

            {/* Badge name */}
            <div
                className={`font-bold ${s.text} mb-1 ${isUnlocked ? '' : 'opacity-60'}`}
                style={{ color: isUnlocked ? colors.textPrimary : colors.textMuted }}
            >
                {badge.name}
            </div>

            {/* Description or unlock requirement */}
            <div
                className={`${s.text} px-2 leading-tight ${isUnlocked ? '' : 'italic'}`}
                style={{ color: colors.textMuted }}
            >
                {isUnlocked ? (
                    badge.description
                ) : (
                    <span className="flex items-center justify-center gap-1">
                        <span className="text-xs">🎯</span>
                        {UNLOCK_REQUIREMENTS[badge.id] || badge.description}
                    </span>
                )}
            </div>

            {/* Earned date for unlocked badges */}
            {isUnlocked && earnedAt && (
                <div className="text-xs mt-2 flex items-center justify-center gap-1" style={{ color: colors.cyan }}>
                    <span>✨</span>
                    Unlocked {new Date(earnedAt).toLocaleDateString()}
                </div>
            )}
        </div>
    )
}

interface BadgeShowcaseProps {
    userId?: string
}

export function BadgeShowcase({ userId }: BadgeShowcaseProps) {
    const [earnedBadges, setEarnedBadges] = useState<Record<string, string>>({}) // badge_id -> earned_at
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBadges() {
            try {
                const response = await fetch('/api/badges/award')
                const data = await response.json()
                // Convert to a map of badge_id -> earned_at
                const badgeMap: Record<string, string> = {}
                for (const badge of (data.badges || [])) {
                    badgeMap[badge.badge_type] = badge.earned_at
                }
                setEarnedBadges(badgeMap)
            } catch (error) {
                console.error('Error fetching badges:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBadges()
    }, [userId])

    // Get all badges sorted by rarity
    const allBadges = Object.values(BADGES).sort((a, b) => {
        const aOrder = RARITY_ORDER.indexOf(a.rarity)
        const bOrder = RARITY_ORDER.indexOf(b.rarity)
        return aOrder - bOrder
    })

    const unlockedCount = Object.keys(earnedBadges).length
    const totalCount = allBadges.length

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="loading-dream-dust mb-4">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p style={{ color: colors.textMuted }}>Loading your badge collection...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header with progress */}
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                    🏅 Badge Collection
                </h2>
                <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                    Unlock badges by creating dreams, sharing, and being part of the community
                </p>

                {/* Progress bar */}
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span style={{ color: colors.textMuted }}>Progress</span>
                        <span className="font-bold" style={{ color: colors.purple }}>
                            {unlockedCount}/{totalCount} Unlocked
                        </span>
                    </div>
                    <div
                        className="h-3 rounded-full overflow-hidden"
                        style={{ background: colors.surface }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-500 progress-bar-fill"
                            style={{
                                width: `${(unlockedCount / totalCount) * 100}%`,
                                background: `linear-gradient(90deg, ${colors.purple}, ${colors.cyan})`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Unlocked badges section */}
            {unlockedCount > 0 && (
                <div>
                    <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: colors.textPrimary }}
                    >
                        <span>✨</span> Your Badges
                        <span
                            className="text-sm font-normal px-2 py-0.5 rounded-full"
                            style={{ background: `${colors.purple}30`, color: colors.purple }}
                        >
                            {unlockedCount}
                        </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {allBadges
                            .filter(badge => earnedBadges[badge.id])
                            .map((badge) => (
                                <BadgeDisplay
                                    key={badge.id}
                                    badge={badge}
                                    isUnlocked={true}
                                    earnedAt={earnedBadges[badge.id]}
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Locked badges section */}
            <div>
                <h3
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: colors.textMuted }}
                >
                    <span>🔒</span> Badges to Unlock
                    <span
                        className="text-sm font-normal px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(100,100,120,0.3)', color: colors.textMuted }}
                    >
                        {totalCount - unlockedCount}
                    </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {allBadges
                        .filter(badge => !earnedBadges[badge.id])
                        .map((badge) => (
                            <BadgeDisplay
                                key={badge.id}
                                badge={badge}
                                isUnlocked={false}
                            />
                        ))}
                </div>
            </div>

            {/* Motivational footer */}
            {unlockedCount < totalCount && (
                <div
                    className="text-center py-6 rounded-xl"
                    style={{
                        background: `linear-gradient(135deg, ${colors.purple}10, ${colors.cyan}10)`,
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                        💡 <strong>Tip:</strong> Create and share dreams to unlock more badges!
                    </p>
                </div>
            )}
        </div>
    )
}

