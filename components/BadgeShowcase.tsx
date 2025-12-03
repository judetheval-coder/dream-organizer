'use client'

import { useEffect, useState, useMemo } from 'react'
import { colors, gradients } from '@/lib/design'
import {
    BADGES,
    RARITY_COLORS,
    RARITY_GRADIENTS,
    BADGE_CATEGORIES,
    type Badge,
    type BadgeRarity,
    type BadgeCategory
} from '@/lib/badges'

// Rarity configuration with display names
const RARITY_CONFIG: Record<BadgeRarity, { label: string; icon: string; glow: string }> = {
    common: { label: 'Common', icon: '⚪', glow: 'rgba(156, 163, 175, 0.3)' },
    uncommon: { label: 'Uncommon', icon: '🟢', glow: 'rgba(34, 197, 94, 0.3)' },
    rare: { label: 'Rare', icon: '🔵', glow: 'rgba(59, 130, 246, 0.4)' },
    epic: { label: 'Epic', icon: '🟣', glow: 'rgba(168, 85, 247, 0.5)' },
    legendary: { label: 'Legendary', icon: '🟠', glow: 'rgba(251, 191, 36, 0.5)' },
    mythic: { label: 'Mythic', icon: '🌈', glow: 'rgba(239, 68, 68, 0.6)' },
}

const RARITY_ORDER: BadgeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

interface BadgeCardProps {
    badge: Badge
    isUnlocked: boolean
    earnedAt?: string
    progress?: { current: number; target: number }
}

function BadgeCard({ badge, isUnlocked, earnedAt, progress }: BadgeCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const rarityColor = RARITY_COLORS[badge.rarity]
    const config = RARITY_CONFIG[badge.rarity]

    // For secret badges that are locked
    const displayName = badge.secret && !isUnlocked ? '???' : badge.name
    const displayEmoji = badge.secret && !isUnlocked ? '❓' : badge.emoji
    const displayDesc = badge.secret && !isUnlocked ? 'Secret badge - discover how to unlock!' : badge.description

    const hasProgress = progress && progress.target > 0 && !isUnlocked
    const progressPercent = hasProgress ? Math.min((progress.current / progress.target) * 100, 100) : 0

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Card */}
            <div
                className={`
                    relative overflow-hidden rounded-2xl p-4
                    transition-all duration-300 ease-out
                    ${isUnlocked ? 'cursor-pointer' : ''}
                    ${isHovered && isUnlocked ? 'scale-105 -translate-y-1' : ''}
                    ${isHovered && !isUnlocked ? 'scale-102' : ''}
                `}
                style={{
                    background: isUnlocked
                        ? `linear-gradient(145deg, ${rarityColor}15, ${rarityColor}05)`
                        : 'linear-gradient(145deg, rgba(30,30,45,0.9), rgba(20,20,35,0.95))',
                    border: isUnlocked
                        ? `2px solid ${rarityColor}60`
                        : '2px solid rgba(60,60,80,0.3)',
                    boxShadow: isHovered && isUnlocked
                        ? `0 20px 40px -10px ${config.glow}, 0 0 30px ${rarityColor}30`
                        : isUnlocked
                            ? `0 4px 20px -5px ${config.glow}`
                            : '0 4px 20px -5px rgba(0,0,0,0.3)',
                }}
            >
                {/* Animated glow border for epic+ when hovered */}
                {isUnlocked && isHovered && (badge.rarity === 'epic' || badge.rarity === 'legendary' || badge.rarity === 'mythic') && (
                    <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                            background: `conic-gradient(from 0deg, ${rarityColor}, transparent 40%, ${rarityColor})`,
                            animation: 'badge-border-spin 3s linear infinite',
                            opacity: 0.6,
                            filter: 'blur(2px)',
                            margin: '-2px',
                        }}
                    />
                )}

                {/* Inner content container */}
                <div className="relative z-10">
                    {/* Emoji + Rarity indicator */}
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className={`
                                relative w-14 h-14 rounded-xl flex items-center justify-center text-3xl
                                transition-all duration-300
                                ${isUnlocked ? '' : 'grayscale-[70%] opacity-60'}
                                ${isHovered && isUnlocked ? 'scale-110' : ''}
                            `}
                            style={{
                                background: isUnlocked
                                    ? `linear-gradient(135deg, ${rarityColor}30, ${rarityColor}10)`
                                    : 'rgba(40,40,55,0.8)',
                                boxShadow: isUnlocked && isHovered
                                    ? `0 0 20px ${rarityColor}50`
                                    : 'none',
                            }}
                        >
                            {displayEmoji}
                            {!isUnlocked && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg opacity-70">🔒</span>
                                </div>
                            )}
                        </div>

                        {/* Category icon */}
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                            style={{
                                background: isUnlocked ? `${rarityColor}20` : 'rgba(40,40,55,0.6)',
                                opacity: isUnlocked ? 1 : 0.5,
                            }}
                            title={BADGE_CATEGORIES[badge.category]?.name}
                        >
                            {BADGE_CATEGORIES[badge.category]?.icon}
                        </div>
                    </div>

                    {/* Badge name */}
                    <h4
                        className={`font-bold text-sm mb-1 transition-colors ${isUnlocked ? '' : 'opacity-50'}`}
                        style={{ color: isUnlocked ? colors.textPrimary : colors.textMuted }}
                    >
                        {displayName}
                    </h4>

                    {/* Description */}
                    <p
                        className={`text-xs leading-relaxed mb-3 line-clamp-2 ${isUnlocked ? '' : 'italic opacity-60'}`}
                        style={{ color: colors.textMuted }}
                    >
                        {displayDesc}
                    </p>

                    {/* Progress bar for locked badges with progress */}
                    {hasProgress && (
                        <div className="mb-2">
                            <div className="flex justify-between text-[10px] mb-1">
                                <span style={{ color: colors.textMuted }}>Progress</span>
                                <span style={{ color: rarityColor }}>{progress.current}/{progress.target}</span>
                            </div>
                            <div
                                className="h-1.5 rounded-full overflow-hidden"
                                style={{ background: 'rgba(60,60,80,0.5)' }}
                            >
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${progressPercent}%`,
                                        background: `linear-gradient(90deg, ${rarityColor}80, ${rarityColor})`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Rarity pill + earned date */}
                    <div className="flex items-center justify-between">
                        <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                            style={{
                                background: isUnlocked ? `${rarityColor}25` : 'rgba(60,60,80,0.4)',
                                color: isUnlocked ? rarityColor : colors.textMuted,
                                border: `1px solid ${isUnlocked ? `${rarityColor}40` : 'rgba(80,80,100,0.3)'}`,
                            }}
                        >
                            {badge.rarity}
                        </span>

                        {isUnlocked && earnedAt && (
                            <span className="text-[10px] flex items-center gap-1" style={{ color: `${rarityColor}cc` }}>
                                ✨ {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Nebula background effect for unlocked cards */}
                {isUnlocked && (
                    <div
                        className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                            background: `radial-gradient(circle at 80% 20%, ${rarityColor}30 0%, transparent 50%)`,
                        }}
                    />
                )}
            </div>

            {/* Hover tooltip for animated badges */}
            {isHovered && isUnlocked && badge.animated && (
                <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap z-30 animate-fade-in"
                    style={{
                        background: 'rgba(20,20,35,0.95)',
                        border: `1px solid ${rarityColor}60`,
                        color: rarityColor,
                        boxShadow: `0 4px 20px ${config.glow}`,
                    }}
                >
                    ✨ Animated Badge
                </div>
            )}
        </div>
    )
}

interface RarityColumnProps {
    rarity: BadgeRarity
    badges: Badge[]
    earnedBadges: Record<string, string>
    badgeProgress: Record<string, { current: number; target: number }>
}

function RarityColumn({ rarity, badges, earnedBadges, badgeProgress }: RarityColumnProps) {
    const config = RARITY_CONFIG[rarity]
    const rarityColor = RARITY_COLORS[rarity]
    const unlockedCount = badges.filter(b => earnedBadges[b.id]).length

    return (
        <div className="flex-1 min-w-[280px]">
            {/* Column header */}
            <div
                className="sticky top-0 z-20 mb-4 p-3 rounded-xl backdrop-blur-md"
                style={{
                    background: `linear-gradient(135deg, ${rarityColor}15, ${rarityColor}05)`,
                    border: `1px solid ${rarityColor}30`,
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{config.icon}</span>
                        <h3 className="font-bold text-base" style={{ color: rarityColor }}>
                            {config.label}
                        </h3>
                    </div>
                    <div
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                            background: `${rarityColor}20`,
                            color: rarityColor,
                        }}
                    >
                        {unlockedCount}/{badges.length}
                    </div>
                </div>

                {/* Mini progress bar */}
                <div
                    className="mt-2 h-1 rounded-full overflow-hidden"
                    style={{ background: `${rarityColor}15` }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${badges.length > 0 ? (unlockedCount / badges.length) * 100 : 0}%`,
                            background: rarityColor,
                        }}
                    />
                </div>
            </div>

            {/* Badges */}
            <div className="space-y-3">
                {badges.map(badge => (
                    <BadgeCard
                        key={badge.id}
                        badge={badge}
                        isUnlocked={!!earnedBadges[badge.id]}
                        earnedAt={earnedBadges[badge.id]}
                        progress={badgeProgress[badge.id]}
                    />
                ))}
            </div>

            {badges.length === 0 && (
                <div
                    className="p-6 rounded-xl text-center"
                    style={{ background: 'rgba(30,30,45,0.5)' }}
                >
                    <span className="text-2xl opacity-50">🔮</span>
                    <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                        No badges in this tier
                    </p>
                </div>
            )}
        </div>
    )
}

interface BadgeShowcaseProps {
    userId?: string
}

export function BadgeShowcase({ userId }: BadgeShowcaseProps) {
    const [earnedBadges, setEarnedBadges] = useState<Record<string, string>>({})
    const [badgeProgress, setBadgeProgress] = useState<Record<string, { current: number; target: number }>>({})
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'all'>('all')
    const [viewMode, setViewMode] = useState<'columns' | 'grid'>('columns')

    useEffect(() => {
        async function fetchBadges() {
            try {
                const response = await fetch('/api/badges/award')
                const data = await response.json()
                const badgeMap: Record<string, string> = {}
                const progressMap: Record<string, { current: number; target: number }> = {}

                for (const badge of (data.badges || [])) {
                    badgeMap[badge.badge_type] = badge.earned_at
                }

                setEarnedBadges(badgeMap)
                setBadgeProgress(progressMap)
            } catch (error) {
                console.error('Error fetching badges:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchBadges()
    }, [userId])

    // Memoized badge calculations
    const allBadges = useMemo(() => Object.values(BADGES), [])

    const filteredBadges = useMemo(() => {
        return activeCategory === 'all'
            ? allBadges
            : allBadges.filter(b => b.category === activeCategory)
    }, [allBadges, activeCategory])

    const badgesByRarity = useMemo(() => {
        const grouped: Record<BadgeRarity, Badge[]> = {
            common: [], uncommon: [], rare: [], epic: [], legendary: [], mythic: []
        }
        for (const badge of filteredBadges) {
            grouped[badge.rarity].push(badge)
        }
        // Sort each group: unlocked first, then by name
        for (const rarity of RARITY_ORDER) {
            grouped[rarity].sort((a, b) => {
                const aUnlocked = !!earnedBadges[a.id]
                const bUnlocked = !!earnedBadges[b.id]
                if (aUnlocked !== bUnlocked) return bUnlocked ? 1 : -1
                return a.name.localeCompare(b.name)
            })
        }
        return grouped
    }, [filteredBadges, earnedBadges])

    const stats = useMemo(() => {
        const total = allBadges.length
        const unlocked = Object.keys(earnedBadges).length
        return { total, unlocked, percent: total > 0 ? Math.round((unlocked / total) * 100) : 0 }
    }, [allBadges, earnedBadges])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="relative w-16 h-16 mb-4">
                    <div
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ background: colors.purple }}
                    />
                    <div
                        className="absolute inset-2 rounded-full animate-pulse"
                        style={{ background: `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">🏆</span>
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                    Loading your badge collection...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <div
                className="relative overflow-hidden rounded-3xl p-8"
                style={{
                    background: `linear-gradient(135deg, ${colors.purple}15 0%, ${colors.cyan}10 50%, ${colors.pink}15 100%)`,
                    border: `1px solid ${colors.border}`,
                }}
            >
                {/* Background decoration */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 20% 30%, ${colors.purple}40 0%, transparent 40%),
                                          radial-gradient(circle at 80% 70%, ${colors.cyan}30 0%, transparent 40%),
                                          radial-gradient(circle at 50% 50%, ${colors.pink}20 0%, transparent 60%)`,
                    }}
                />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                            <h2
                                className="text-3xl md:text-4xl font-bold mb-2"
                                style={{
                                    background: gradients.purpleCyan,
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    color: 'transparent',
                                }}
                            >
                                🏆 Badge Collection
                            </h2>
                            <p className="text-sm md:text-base" style={{ color: colors.textMuted }}>
                                Collect {stats.total} unique badges across {Object.keys(BADGE_CATEGORIES).length} categories
                            </p>
                        </div>

                        {/* Stats circle */}
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="42"
                                        fill="none"
                                        stroke={`${colors.purple}20`}
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="48" cy="48" r="42"
                                        fill="none"
                                        stroke={`url(#progressGradient)`}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${stats.percent * 2.64} 264`}
                                        className="transition-all duration-1000"
                                    />
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor={colors.purple} />
                                            <stop offset="50%" stopColor={colors.cyan} />
                                            <stop offset="100%" stopColor={colors.pink} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                                        {stats.percent}%
                                    </span>
                                    <span className="text-[10px]" style={{ color: colors.textMuted }}>
                                        {stats.unlocked}/{stats.total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rarity quick stats */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-6">
                        {RARITY_ORDER.map(rarity => {
                            const count = badgesByRarity[rarity].length
                            const unlocked = badgesByRarity[rarity].filter(b => earnedBadges[b.id]).length
                            return (
                                <div
                                    key={rarity}
                                    className="p-2 rounded-xl text-center"
                                    style={{
                                        background: `${RARITY_COLORS[rarity]}10`,
                                        border: `1px solid ${RARITY_COLORS[rarity]}30`,
                                    }}
                                >
                                    <span className="text-sm">{RARITY_CONFIG[rarity].icon}</span>
                                    <div className="text-xs font-semibold" style={{ color: RARITY_COLORS[rarity] }}>
                                        {unlocked}/{count}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Category filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105`}
                        style={{
                            background: activeCategory === 'all'
                                ? `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})`
                                : colors.surface,
                            color: activeCategory === 'all' ? 'white' : colors.textSecondary,
                            border: `1px solid ${activeCategory === 'all' ? 'transparent' : colors.border}`,
                            boxShadow: activeCategory === 'all' ? `0 4px 15px ${colors.purple}40` : 'none',
                        }}
                    >
                        🎯 All
                    </button>
                    {(Object.entries(BADGE_CATEGORIES) as [BadgeCategory, typeof BADGE_CATEGORIES[BadgeCategory]][]).map(([key, cat]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                            style={{
                                background: activeCategory === key
                                    ? `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})`
                                    : colors.surface,
                                color: activeCategory === key ? 'white' : colors.textSecondary,
                                border: `1px solid ${activeCategory === key ? 'transparent' : colors.border}`,
                                boxShadow: activeCategory === key ? `0 4px 15px ${colors.purple}40` : 'none',
                            }}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* View toggle */}
                <div
                    className="flex rounded-xl overflow-hidden"
                    style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
                >
                    <button
                        onClick={() => setViewMode('columns')}
                        className="px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            background: viewMode === 'columns' ? `${colors.purple}30` : 'transparent',
                            color: viewMode === 'columns' ? colors.purple : colors.textMuted,
                        }}
                    >
                        ≡ Columns
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className="px-4 py-2 text-sm font-medium transition-colors"
                        style={{
                            background: viewMode === 'grid' ? `${colors.purple}30` : 'transparent',
                            color: viewMode === 'grid' ? colors.purple : colors.textMuted,
                        }}
                    >
                        ⊞ Grid
                    </button>
                </div>
            </div>

            {/* Badges display */}
            {viewMode === 'columns' ? (
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                    {RARITY_ORDER.map(rarity => (
                        <RarityColumn
                            key={rarity}
                            rarity={rarity}
                            badges={badgesByRarity[rarity]}
                            earnedBadges={earnedBadges}
                            badgeProgress={badgeProgress}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredBadges
                        .sort((a, b) => {
                            // Sort by: unlocked first, then by rarity (higher first)
                            const aUnlocked = !!earnedBadges[a.id]
                            const bUnlocked = !!earnedBadges[b.id]
                            if (aUnlocked !== bUnlocked) return bUnlocked ? 1 : -1
                            return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
                        })
                        .map(badge => (
                            <BadgeCard
                                key={badge.id}
                                badge={badge}
                                isUnlocked={!!earnedBadges[badge.id]}
                                earnedAt={earnedBadges[badge.id]}
                                progress={badgeProgress[badge.id]}
                            />
                        ))}
                </div>
            )}

            {/* Empty state */}
            {filteredBadges.length === 0 && (
                <div className="text-center py-16">
                    <span className="text-6xl">🔍</span>
                    <p className="mt-4" style={{ color: colors.textMuted }}>
                        No badges found in this category.
                    </p>
                </div>
            )}

            {/* Tips section */}
            {stats.unlocked < stats.total && (
                <div
                    className="p-6 rounded-2xl"
                    style={{
                        background: `linear-gradient(135deg, ${colors.purple}08, ${colors.cyan}08)`,
                        border: `1px solid ${colors.border}`,
                    }}
                >
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                        💡 How to Unlock More Badges
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { icon: '✨', tip: 'Create dreams regularly to build streaks' },
                            { icon: '🚀', tip: 'Share your dreams to the public gallery' },
                            { icon: '💬', tip: 'Engage with the community through comments' },
                            { icon: '🎨', tip: 'Experiment with different art styles' },
                            { icon: '🔮', tip: 'Look for hidden secret badges!' },
                            { icon: '🎉', tip: 'Participate in seasonal events' },
                        ].map(({ icon, tip }) => (
                            <div
                                key={tip}
                                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-102"
                                style={{ background: 'rgba(30,30,45,0.4)' }}
                            >
                                <span className="text-xl">{icon}</span>
                                <span className="text-sm" style={{ color: colors.textMuted }}>{tip}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes badge-border-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes animate-fade-in {
                    from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                .animate-fade-in {
                    animation: animate-fade-in 0.2s ease-out;
                }
                .scale-102 {
                    transform: scale(1.02);
                }
                .hover\\:scale-102:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    )
}

// Export individual badge card for use elsewhere
export { BadgeCard as BadgeDisplay }

