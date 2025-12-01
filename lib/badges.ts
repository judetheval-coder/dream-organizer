export const BADGES = {
    FIRST_DREAM: {
        id: 'first_dream',
        name: 'Dream Weaver',
        description: 'Created your first dream',
        emoji: '🌟',
        rarity: 'common'
    },
    FIVE_DREAMS: {
        id: 'five_dreams',
        name: 'Dream Explorer',
        description: 'Created 5 dreams',
        emoji: '🗺️',
        rarity: 'common'
    },
    TEN_DREAMS: {
        id: 'ten_dreams',
        name: 'Dream Collector',
        description: 'Created 10 dreams',
        emoji: '📚',
        rarity: 'uncommon'
    },
    FIFTY_DREAMS: {
        id: 'fifty_dreams',
        name: 'Dream Master',
        description: 'Created 50 dreams',
        emoji: '🏆',
        rarity: 'rare'
    },
    FIRST_SHARE: {
        id: 'first_share',
        name: 'Sharing is Caring',
        description: 'Shared your first dream',
        emoji: '🚀',
        rarity: 'common'
    },
    TEN_SHARES: {
        id: 'ten_shares',
        name: 'Viral Creator',
        description: 'Shared 10 dreams',
        emoji: '🔥',
        rarity: 'uncommon'
    },
    HUNDRED_VIEWS: {
        id: 'hundred_views',
        name: 'Rising Star',
        description: 'Got 100 views on a dream',
        emoji: '⭐',
        rarity: 'uncommon'
    },
    THOUSAND_VIEWS: {
        id: 'thousand_views',
        name: 'Dream Celebrity',
        description: 'Got 1,000 views on a dream',
        emoji: '💫',
        rarity: 'rare'
    },
    TEN_LIKES: {
        id: 'ten_likes',
        name: 'Crowd Pleaser',
        description: 'Got 10 likes on a dream',
        emoji: '❤️',
        rarity: 'uncommon'
    },
    HUNDRED_LIKES: {
        id: 'hundred_likes',
        name: 'Dream Sensation',
        description: 'Got 100 likes on a dream',
        emoji: '💝',
        rarity: 'rare'
    },
    EARLY_ADOPTER: {
        id: 'early_adopter',
        name: 'Early Dreamer',
        description: 'Joined in the first 1000 users',
        emoji: '🎖️',
        rarity: 'rare'
    },
    REFERRAL_MASTER: {
        id: 'referral_master',
        name: 'Dream Ambassador',
        description: 'Invited 5 friends',
        emoji: '🎁',
        rarity: 'uncommon'
    },
    CHALLENGE_WINNER: {
        id: 'challenge_winner',
        name: 'Challenge Champion',
        description: 'Won a daily challenge',
        emoji: '🥇',
        rarity: 'epic'
    },
    STREAK_SEVEN: {
        id: 'streak_seven',
        name: 'Weekly Dreamer',
        description: '7 day creation streak',
        emoji: '🔥',
        rarity: 'uncommon'
    },
    STREAK_THIRTY: {
        id: 'streak_thirty',
        name: 'Dream Devotee',
        description: '30 day creation streak',
        emoji: '💪',
        rarity: 'rare'
    },
} as const

export type BadgeId = keyof typeof BADGES

export const RARITY_COLORS = {
    common: '#94a3b8',
    uncommon: '#3b82f6',
    rare: '#a855f7',
    epic: '#f59e0b',
    legendary: '#ef4444'
}

export async function checkAndAwardBadges(userId: string, dreamCount: number, shareCount: number) {
    const badgesToAward: BadgeId[] = []

    // Check dream count badges
    if (dreamCount === 1) badgesToAward.push('FIRST_DREAM')
    if (dreamCount === 5) badgesToAward.push('FIVE_DREAMS')
    if (dreamCount === 10) badgesToAward.push('TEN_DREAMS')
    if (dreamCount === 50) badgesToAward.push('FIFTY_DREAMS')

    // Check share badges
    if (shareCount === 1) badgesToAward.push('FIRST_SHARE')
    if (shareCount === 10) badgesToAward.push('TEN_SHARES')

    // Award badges via API
    if (badgesToAward.length > 0) {
        await fetch('/api/badges/award', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, badges: badgesToAward.map(b => BADGES[b].id) })
        })
    }

    return badgesToAward
}
