'use client'

import { useEffect, useState } from 'react'
import { colors } from '@/lib/design'
import { 
    BADGES, 
    RARITY_COLORS, 
    RARITY_GRADIENTS, 
    RARITY_FRAMES,
    BADGE_CATEGORIES,
    type Badge,
    type BadgeRarity,
    type BadgeCategory 
} from '@/lib/badges'

// Rarity order for sorting
const RARITY_ORDER: BadgeRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

interface BadgeDisplayProps {
    badge: Badge
    isUnlocked: boolean
    earnedAt?: string
    size?: 'small' | 'medium' | 'large'
    showDetails?: boolean
}

export function BadgeDisplay({ badge, isUnlocked, earnedAt, size = 'medium', showDetails = true }: BadgeDisplayProps) {
    const [isHovered, setIsHovered] = useState(false)
    
    const sizes = {
        small: { emoji: 'text-2xl', container: 'w-16 h-16', text: 'text-xs', ring: 'w-20 h-20' },
        medium: { emoji: 'text-4xl', container: 'w-24 h-24', text: 'text-sm', ring: 'w-28 h-28' },
        large: { emoji: 'text-6xl', container: 'w-32 h-32', text: 'text-base', ring: 'w-36 h-36' },
    }

    const s = sizes[size]
    const rarityColor = RARITY_COLORS[badge.rarity]
    const rarityGradient = RARITY_GRADIENTS[badge.rarity]
    const rarityFrame = RARITY_FRAMES[badge.rarity]
    
    // Determine animation class
    const getAnimationClass = () => {
        if (!isUnlocked) return ''
        if (badge.rarity === 'mythic') return 'badge-mythic'
        if (badge.rarity === 'legendary') return 'badge-legendary'
        if (badge.animated || badge.rarity === 'epic') return 'badge-animated'
        return ''
    }

    // For secret badges that are locked, show mystery
    const displayName = badge.secret && !isUnlocked ? '???' : badge.name
    const displayEmoji = badge.secret && !isUnlocked ? '❓' : badge.emoji

    return (
        <div 
            className={`text-center group relative ${isUnlocked ? '' : 'opacity-85'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badge container */}
            <div className="relative mx-auto mb-3">
                {/* Outer spinning ring for epic+ badges */}
                {isUnlocked && (badge.rarity === 'epic' || badge.rarity === 'legendary' || badge.rarity === 'mythic') && (
                    <div
                        className={`absolute inset-0 ${s.ring} mx-auto rounded-full`}
                        style={{
                            background: `conic-gradient(from 0deg, ${rarityColor}, transparent, ${rarityColor})`,
                            animation: 'badge-spin-slow 8s linear infinite',
                            opacity: 0.5,
                        }}
                    />
                )}
                
                {/* Glow effect for unlocked badges */}
                {isUnlocked && (
                    <div
                        className={`absolute inset-0 rounded-full blur-xl opacity-50 ${badge.rarity === 'mythic' ? 'animate-pulse' : ''}`}
                        style={{ 
                            background: rarityGradient,
                            transform: 'scale(1.2)'
                        }}
                    />
                )}

                {/* Particle effects for animated badges */}
                {isUnlocked && badge.animated && (
                    <>
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 rounded-full"
                                    style={{
                                        background: rarityColor,
                                        left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                                        top: `${50 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
                                        animation: `badge-particles 2s ease-out infinite`,
                                        animationDelay: `${i * 0.3}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Main badge circle */}
                <div
                    className={`${s.container} mx-auto rounded-full flex items-center justify-center relative transition-all duration-300 ${getAnimationClass()} ${
                        isUnlocked ? 'hover:scale-110 cursor-pointer badge-shimmer' : 'grayscale-[80%]'
                    }`}
                    style={{
                        background: isUnlocked
                            ? `linear-gradient(135deg, ${rarityColor}40 0%, ${rarityColor}15 100%)`
                            : 'linear-gradient(135deg, rgba(30,30,40,0.9) 0%, rgba(20,20,30,0.95) 100%)',
                        border: isUnlocked ? rarityFrame.border : '3px solid rgba(60,60,80,0.4)',
                        boxShadow: isUnlocked ? rarityFrame.shadow : 'inset 0 0 30px rgba(0,0,0,0.6)',
                        ...(isUnlocked && badge.rarity === 'legendary' && {
                            borderImage: 'linear-gradient(135deg, #d97706, #fbbf24, #d97706) 1',
                        }),
                        ...(isUnlocked && badge.rarity === 'mythic' && {
                            borderImage: 'linear-gradient(135deg, #ef4444, #fbbf24, #22c55e, #3b82f6, #a855f7, #ef4444) 1',
                        }),
                    }}
                >
                    {/* Inner glow ring */}
                    {isUnlocked && (
                        <div
                            className="absolute inset-1 rounded-full opacity-30"
                            style={{
                                background: `radial-gradient(circle, ${rarityColor}50 0%, transparent 70%)`,
                            }}
                        />
                    )}
                    
                    {/* Emoji */}
                    <span className={`${s.emoji} ${isUnlocked ? 'drop-shadow-lg' : 'opacity-25 blur-[1px]'} select-none relative z-10`}>
                        {displayEmoji}
                    </span>

                    {/* Locked overlay */}
                    {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                            {/* Crossed chains */}
                            <div className="absolute inset-0">
                                <div
                                    className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent top-1/2 -translate-y-1/2"
                                    style={{ transform: 'rotate(45deg)' }}
                                />
                                <div
                                    className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/50 to-transparent top-1/2 -translate-y-1/2"
                                    style={{ transform: 'rotate(-45deg)' }}
                                />
                            </div>

                            {/* Lock icon */}
                            <div
                                className="absolute w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm z-10"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(40,40,50,0.95), rgba(25,25,35,0.98))',
                                    border: '2px solid rgba(80,80,100,0.4)',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                }}
                            >
                                <span className="text-base">🔒</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rarity badge */}
                <div
                    className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isUnlocked ? '' : 'opacity-40'
                    }`}
                    style={{
                        background: isUnlocked ? rarityGradient : 'rgba(60,60,80,0.8)',
                        color: 'white',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        boxShadow: isUnlocked ? `0 2px 10px ${rarityColor}50` : 'none',
                        border: isUnlocked ? `1px solid ${rarityColor}80` : '1px solid rgba(80,80,100,0.3)',
                    }}
                >
                    {badge.rarity}
                </div>

                {/* Category icon (top right) */}
                {showDetails && (
                    <div
                        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isUnlocked ? '' : 'opacity-40'
                        }`}
                        style={{
                            background: isUnlocked ? colors.surface : 'rgba(40,40,50,0.9)',
                            border: `1px solid ${isUnlocked ? colors.border : 'rgba(60,60,80,0.4)'}`,
                        }}
                        title={BADGE_CATEGORIES[badge.category].name}
                    >
                        {BADGE_CATEGORIES[badge.category].icon}
                    </div>
                )}
            </div>

            {/* Badge name */}
            {showDetails && (
                <>
                    <div
                        className={`font-bold ${s.text} mb-0.5 ${isUnlocked ? '' : 'opacity-50'}`}
                        style={{ color: isUnlocked ? colors.textPrimary : colors.textMuted }}
                    >
                        {displayName}
                    </div>

                    {/* Description */}
                    <div
                        className={`${s.text} px-1 leading-tight ${isUnlocked ? '' : 'italic opacity-60'}`}
                        style={{ color: colors.textMuted, fontSize: '11px' }}
                    >
                        {badge.secret && !isUnlocked ? 'Secret badge - discover how to unlock!' : badge.description}
                    </div>

                    {/* Earned date */}
                    {isUnlocked && earnedAt && (
                        <div className="text-[10px] mt-1.5 flex items-center justify-center gap-1" style={{ color: rarityColor }}>
                            <span>✨</span>
                            {new Date(earnedAt).toLocaleDateString()}
                        </div>
                    )}
                </>
            )}

            {/* Hover tooltip for more info */}
            {isHovered && isUnlocked && badge.animated && (
                <div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] whitespace-nowrap z-20"
                    style={{
                        background: colors.surface,
                        border: `1px solid ${rarityColor}50`,
                        color: rarityColor,
                    }}
                >
                    ✨ Animated Badge
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
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState<BadgeCategory | 'all'>('all')
    const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)

    useEffect(() => {
        async function fetchBadges() {
            try {
                const response = await fetch('/api/badges/award')
                const data = await response.json()
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

    // Get all badges
    const allBadges = Object.values(BADGES)
    
    // Filter by category
    const filteredBadges = activeCategory === 'all' 
        ? allBadges 
        : allBadges.filter(b => b.category === activeCategory)
    
    // Filter by unlock status if needed
    const displayBadges = showUnlockedOnly 
        ? filteredBadges.filter(b => earnedBadges[b.id])
        : filteredBadges

    // Sort by rarity
    const sortedBadges = displayBadges.sort((a, b) => {
        const aOrder = RARITY_ORDER.indexOf(a.rarity)
        const bOrder = RARITY_ORDER.indexOf(b.rarity)
        return aOrder - bOrder
    })

    const unlockedCount = Object.keys(earnedBadges).length
    const totalCount = allBadges.length

    // Stats by rarity
    const rarityStats = RARITY_ORDER.map(rarity => ({
        rarity,
        total: allBadges.filter(b => b.rarity === rarity).length,
        unlocked: allBadges.filter(b => b.rarity === rarity && earnedBadges[b.id]).length,
    }))

    if (loading) {
        return (
            <div className="text-center py-16">
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
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                    🏆 Badge Collection
                </h2>
                <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                    Collect {totalCount} unique badges across {Object.keys(BADGE_CATEGORIES).length} categories
                </p>

                {/* Main progress */}
                <div className="max-w-lg mx-auto mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span style={{ color: colors.textMuted }}>Collection Progress</span>
                        <span className="font-bold text-lg" style={{ color: colors.purple }}>
                            {unlockedCount} / {totalCount}
                        </span>
                    </div>
                    <div
                        className="h-4 rounded-full overflow-hidden relative"
                        style={{ background: colors.surface }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-700 progress-bar-fill relative overflow-hidden"
                            style={{
                                width: `${(unlockedCount / totalCount) * 100}%`,
                                background: `linear-gradient(90deg, ${colors.purple}, ${colors.cyan}, ${colors.pink})`,
                            }}
                        >
                            {/* Shimmer effect */}
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                    animation: 'badge-shimmer 2s ease-in-out infinite',
                                }}
                            />
                        </div>
                        <span 
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold"
                            style={{ color: colors.textMuted }}
                        >
                            {Math.round((unlockedCount / totalCount) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Rarity breakdown */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {rarityStats.map(({ rarity, total, unlocked }) => (
                        <div
                            key={rarity}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                                background: `${RARITY_COLORS[rarity]}20`,
                                border: `1px solid ${RARITY_COLORS[rarity]}40`,
                                color: RARITY_COLORS[rarity],
                            }}
                        >
                            <span className="uppercase">{rarity}</span>
                            <span className="ml-1 opacity-80">{unlocked}/{total}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-2">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                        activeCategory === 'all' ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                    }`}
                    style={{
                        background: activeCategory === 'all' 
                            ? `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})`
                            : colors.surface,
                        color: activeCategory === 'all' ? 'white' : colors.textSecondary,
                        border: `1px solid ${colors.border}`,
                    }}
                >
                    🎯 All ({totalCount})
                </button>
                {(Object.entries(BADGE_CATEGORIES) as [BadgeCategory, typeof BADGE_CATEGORIES[BadgeCategory]][]).map(([key, cat]) => {
                    const count = allBadges.filter(b => b.category === key).length
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                                activeCategory === key ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                            }`}
                            style={{
                                background: activeCategory === key 
                                    ? `linear-gradient(135deg, ${colors.purple}, ${colors.cyan})`
                                    : colors.surface,
                                color: activeCategory === key ? 'white' : colors.textSecondary,
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            {cat.icon} {cat.name} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Toggle unlocked only */}
            <div className="flex justify-center">
                <button
                    onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
                    style={{
                        background: showUnlockedOnly ? `${colors.purple}30` : 'transparent',
                        color: showUnlockedOnly ? colors.purple : colors.textMuted,
                        border: `1px solid ${showUnlockedOnly ? colors.purple : colors.border}`,
                    }}
                >
                    <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            showUnlockedOnly ? 'bg-purple-500 border-purple-500' : ''
                        }`}
                        style={{ borderColor: showUnlockedOnly ? colors.purple : colors.textMuted }}
                    >
                        {showUnlockedOnly && <span className="text-white text-xs">✓</span>}
                    </div>
                    Show unlocked only
                </button>
            </div>

            {/* Badge grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {sortedBadges.map((badge) => (
                    <BadgeDisplay
                        key={badge.id}
                        badge={badge}
                        isUnlocked={!!earnedBadges[badge.id]}
                        earnedAt={earnedBadges[badge.id]}
                        size="medium"
                    />
                ))}
            </div>

            {/* Empty state */}
            {sortedBadges.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-5xl mb-4">🔍</div>
                    <p style={{ color: colors.textMuted }}>
                        {showUnlockedOnly 
                            ? "You haven't unlocked any badges in this category yet!"
                            : "No badges found in this category."}
                    </p>
                </div>
            )}

            {/* Tips section */}
            {unlockedCount < totalCount && (
                <div
                    className="p-6 rounded-2xl"
                    style={{
                        background: `linear-gradient(135deg, ${colors.purple}10, ${colors.cyan}10)`,
                        border: `1px solid ${colors.border}`,
                    }}
                >
                    <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: colors.textPrimary }}>
                        <span>💡</span> How to Unlock More Badges
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                            <span>✨</span>
                            <span style={{ color: colors.textMuted }}>Create dreams regularly to build streaks</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>🚀</span>
                            <span style={{ color: colors.textMuted }}>Share your dreams to the gallery</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>💬</span>
                            <span style={{ color: colors.textMuted }}>Engage with the community</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>🎨</span>
                            <span style={{ color: colors.textMuted }}>Try different art styles and moods</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>🔮</span>
                            <span style={{ color: colors.textMuted }}>Look for hidden secret badges!</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span>🎉</span>
                            <span style={{ color: colors.textMuted }}>Participate in seasonal events</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievement unlocked animation placeholder */}
            <style jsx>{`
                @keyframes badge-spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

