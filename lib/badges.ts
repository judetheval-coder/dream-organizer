// ============================================
// MEGA BADGE SYSTEM - 50+ Badges!
// ============================================

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
export type BadgeCategory = 'creation' | 'social' | 'exploration' | 'streaks' | 'special' | 'seasonal' | 'secret'

export interface Badge {
    id: string
    name: string
    description: string
    emoji: string
    rarity: BadgeRarity
    category: BadgeCategory
    animated?: boolean  // Has special animation
    secret?: boolean    // Hidden until unlocked
}

export const BADGES: Record<string, Badge> = {
    // ========== CREATION BADGES (Dream making) ==========
    FIRST_DREAM: {
        id: 'first_dream',
        name: 'Dream Weaver',
        description: 'Created your first dream',
        emoji: '🌟',
        rarity: 'common',
        category: 'creation'
    },
    FIVE_DREAMS: {
        id: 'five_dreams',
        name: 'Dream Explorer',
        description: 'Created 5 dreams',
        emoji: '🗺️',
        rarity: 'common',
        category: 'creation'
    },
    TEN_DREAMS: {
        id: 'ten_dreams',
        name: 'Dream Collector',
        description: 'Created 10 dreams',
        emoji: '📚',
        rarity: 'uncommon',
        category: 'creation'
    },
    TWENTY_FIVE_DREAMS: {
        id: 'twenty_five_dreams',
        name: 'Dreamsmith',
        description: 'Created 25 dreams',
        emoji: '⚒️',
        rarity: 'uncommon',
        category: 'creation'
    },
    FIFTY_DREAMS: {
        id: 'fifty_dreams',
        name: 'Dream Master',
        description: 'Created 50 dreams',
        emoji: '🏆',
        rarity: 'rare',
        category: 'creation'
    },
    HUNDRED_DREAMS: {
        id: 'hundred_dreams',
        name: 'Dream Sage',
        description: 'Created 100 dreams',
        emoji: '🧙',
        rarity: 'epic',
        category: 'creation',
        animated: true
    },
    FIVE_HUNDRED_DREAMS: {
        id: 'five_hundred_dreams',
        name: 'Dream Oracle',
        description: 'Created 500 dreams',
        emoji: '🔮',
        rarity: 'legendary',
        category: 'creation',
        animated: true
    },
    THOUSAND_DREAMS: {
        id: 'thousand_dreams',
        name: 'Dream God',
        description: 'Created 1,000 dreams',
        emoji: '👑',
        rarity: 'mythic',
        category: 'creation',
        animated: true
    },

    // ========== STYLE BADGES ==========
    STYLE_EXPLORER: {
        id: 'style_explorer',
        name: 'Style Shifter',
        description: 'Used 3 different art styles',
        emoji: '🎨',
        rarity: 'common',
        category: 'creation'
    },
    STYLE_MASTER: {
        id: 'style_master',
        name: 'Style Master',
        description: 'Used every art style',
        emoji: '🖌️',
        rarity: 'rare',
        category: 'creation'
    },
    MOOD_MIXER: {
        id: 'mood_mixer',
        name: 'Mood Mixer',
        description: 'Used 5 different moods',
        emoji: '🎭',
        rarity: 'uncommon',
        category: 'creation'
    },

    // ========== SOCIAL BADGES ==========
    FIRST_SHARE: {
        id: 'first_share',
        name: 'Sharing is Caring',
        description: 'Shared your first dream',
        emoji: '🚀',
        rarity: 'common',
        category: 'social'
    },
    TEN_SHARES: {
        id: 'ten_shares',
        name: 'Broadcaster',
        description: 'Shared 10 dreams',
        emoji: '📡',
        rarity: 'uncommon',
        category: 'social'
    },
    FIFTY_SHARES: {
        id: 'fifty_shares',
        name: 'Viral Creator',
        description: 'Shared 50 dreams',
        emoji: '🔥',
        rarity: 'rare',
        category: 'social'
    },
    HUNDRED_VIEWS: {
        id: 'hundred_views',
        name: 'Rising Star',
        description: 'Got 100 views on a dream',
        emoji: '⭐',
        rarity: 'uncommon',
        category: 'social'
    },
    THOUSAND_VIEWS: {
        id: 'thousand_views',
        name: 'Dream Celebrity',
        description: 'Got 1,000 views on a dream',
        emoji: '💫',
        rarity: 'rare',
        category: 'social'
    },
    TEN_THOUSAND_VIEWS: {
        id: 'ten_thousand_views',
        name: 'Dream Legend',
        description: 'Got 10,000 views on a dream',
        emoji: '🌠',
        rarity: 'epic',
        category: 'social',
        animated: true
    },
    TEN_LIKES: {
        id: 'ten_likes',
        name: 'Crowd Pleaser',
        description: 'Got 10 likes on a dream',
        emoji: '❤️',
        rarity: 'uncommon',
        category: 'social'
    },
    HUNDRED_LIKES: {
        id: 'hundred_likes',
        name: 'Heart Stealer',
        description: 'Got 100 likes on a dream',
        emoji: '💝',
        rarity: 'rare',
        category: 'social'
    },
    THOUSAND_LIKES: {
        id: 'thousand_likes',
        name: 'Love Magnet',
        description: 'Got 1,000 likes on a dream',
        emoji: '💖',
        rarity: 'epic',
        category: 'social',
        animated: true
    },
    FIRST_COMMENT: {
        id: 'first_comment',
        name: 'Conversationalist',
        description: 'Left your first comment',
        emoji: '💬',
        rarity: 'common',
        category: 'social'
    },
    FIFTY_COMMENTS: {
        id: 'fifty_comments',
        name: 'Chatterbox',
        description: 'Left 50 comments',
        emoji: '🗣️',
        rarity: 'uncommon',
        category: 'social'
    },
    FIRST_FOLLOWER: {
        id: 'first_follower',
        name: 'Followed',
        description: 'Got your first follower',
        emoji: '👤',
        rarity: 'common',
        category: 'social'
    },
    HUNDRED_FOLLOWERS: {
        id: 'hundred_followers',
        name: 'Influencer',
        description: 'Got 100 followers',
        emoji: '👥',
        rarity: 'rare',
        category: 'social'
    },
    THOUSAND_FOLLOWERS: {
        id: 'thousand_followers',
        name: 'Dream Influencer',
        description: 'Got 1,000 followers',
        emoji: '🌟',
        rarity: 'legendary',
        category: 'social',
        animated: true
    },

    // ========== STREAK BADGES ==========
    STREAK_THREE: {
        id: 'streak_three',
        name: 'Warming Up',
        description: '3 day creation streak',
        emoji: '🌡️',
        rarity: 'common',
        category: 'streaks'
    },
    STREAK_SEVEN: {
        id: 'streak_seven',
        name: 'Weekly Warrior',
        description: '7 day creation streak',
        emoji: '🔥',
        rarity: 'uncommon',
        category: 'streaks'
    },
    STREAK_FOURTEEN: {
        id: 'streak_fourteen',
        name: 'Fortnight Fury',
        description: '14 day creation streak',
        emoji: '⚡',
        rarity: 'rare',
        category: 'streaks'
    },
    STREAK_THIRTY: {
        id: 'streak_thirty',
        name: 'Monthly Master',
        description: '30 day creation streak',
        emoji: '💪',
        rarity: 'rare',
        category: 'streaks'
    },
    STREAK_SIXTY: {
        id: 'streak_sixty',
        name: 'Unstoppable',
        description: '60 day creation streak',
        emoji: '🚂',
        rarity: 'epic',
        category: 'streaks',
        animated: true
    },
    STREAK_HUNDRED: {
        id: 'streak_hundred',
        name: 'Century Dreamer',
        description: '100 day creation streak',
        emoji: '💯',
        rarity: 'legendary',
        category: 'streaks',
        animated: true
    },
    STREAK_YEAR: {
        id: 'streak_year',
        name: 'Dream Devotee',
        description: '365 day creation streak',
        emoji: '🏛️',
        rarity: 'mythic',
        category: 'streaks',
        animated: true
    },

    // ========== EXPLORATION BADGES ==========
    DICTIONARY_READER: {
        id: 'dictionary_reader',
        name: 'Symbol Seeker',
        description: 'Looked up 10 dream symbols',
        emoji: '📖',
        rarity: 'common',
        category: 'exploration'
    },
    PATTERN_FINDER: {
        id: 'pattern_finder',
        name: 'Pattern Finder',
        description: 'Discovered a recurring pattern',
        emoji: '🔍',
        rarity: 'uncommon',
        category: 'exploration'
    },
    NIGHT_OWL: {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Created a dream after midnight',
        emoji: '🦉',
        rarity: 'common',
        category: 'exploration'
    },
    EARLY_BIRD: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Created a dream before 6 AM',
        emoji: '🐦',
        rarity: 'common',
        category: 'exploration'
    },
    LUCID_LOGGER: {
        id: 'lucid_logger',
        name: 'Lucid Logger',
        description: 'Tagged a dream as lucid',
        emoji: '✨',
        rarity: 'uncommon',
        category: 'exploration'
    },
    NIGHTMARE_SURVIVOR: {
        id: 'nightmare_survivor',
        name: 'Nightmare Survivor',
        description: 'Logged 10 nightmare-tagged dreams',
        emoji: '👻',
        rarity: 'uncommon',
        category: 'exploration'
    },
    CALENDAR_COMPLETE: {
        id: 'calendar_complete',
        name: 'Full Moon',
        description: 'Filled an entire month in the calendar',
        emoji: '🌕',
        rarity: 'rare',
        category: 'exploration'
    },
    GROUP_JOINER: {
        id: 'group_joiner',
        name: 'Group Hopper',
        description: 'Joined 3 dream groups',
        emoji: '👥',
        rarity: 'common',
        category: 'exploration'
    },
    GROUP_LEADER: {
        id: 'group_leader',
        name: 'Group Founder',
        description: 'Created a dream group',
        emoji: '🎯',
        rarity: 'uncommon',
        category: 'exploration'
    },

    // ========== SPECIAL BADGES ==========
    EARLY_ADOPTER: {
        id: 'early_adopter',
        name: 'Pioneer',
        description: 'Joined in the first 1000 users',
        emoji: '🎖️',
        rarity: 'legendary',
        category: 'special',
        animated: true
    },
    BETA_TESTER: {
        id: 'beta_tester',
        name: 'Beta Tester',
        description: 'Helped test the app',
        emoji: '🧪',
        rarity: 'epic',
        category: 'special'
    },
    REFERRAL_FIRST: {
        id: 'referral_first',
        name: 'Recruiter',
        description: 'Invited your first friend',
        emoji: '🤝',
        rarity: 'common',
        category: 'special'
    },
    REFERRAL_FIVE: {
        id: 'referral_five',
        name: 'Ambassador',
        description: 'Invited 5 friends',
        emoji: '🎁',
        rarity: 'uncommon',
        category: 'special'
    },
    REFERRAL_TWENTY: {
        id: 'referral_twenty',
        name: 'Dream Evangelist',
        description: 'Invited 20 friends',
        emoji: '📢',
        rarity: 'rare',
        category: 'special'
    },
    PRO_MEMBER: {
        id: 'pro_member',
        name: 'Pro Dreamer',
        description: 'Upgraded to Pro',
        emoji: '⚡',
        rarity: 'uncommon',
        category: 'special'
    },
    PREMIUM_MEMBER: {
        id: 'premium_member',
        name: 'Premium Elite',
        description: 'Upgraded to Premium',
        emoji: '💎',
        rarity: 'rare',
        category: 'special'
    },
    CONTEST_WINNER: {
        id: 'contest_winner',
        name: 'Contest Champion',
        description: 'Won a monthly contest',
        emoji: '🥇',
        rarity: 'epic',
        category: 'special',
        animated: true
    },
    CONTEST_PODIUM: {
        id: 'contest_podium',
        name: 'Top 3 Finisher',
        description: 'Placed top 3 in a contest',
        emoji: '🏅',
        rarity: 'rare',
        category: 'special'
    },
    BUG_HUNTER: {
        id: 'bug_hunter',
        name: 'Bug Hunter',
        description: 'Reported a bug that got fixed',
        emoji: '🐛',
        rarity: 'rare',
        category: 'special'
    },
    FEEDBACK_HERO: {
        id: 'feedback_hero',
        name: 'Feedback Hero',
        description: 'Submitted helpful feedback',
        emoji: '📝',
        rarity: 'uncommon',
        category: 'special'
    },

    // ========== SEASONAL BADGES ==========
    HALLOWEEN_2024: {
        id: 'halloween_2024',
        name: 'Spooky Dreamer',
        description: 'Halloween 2024 Event',
        emoji: '🎃',
        rarity: 'rare',
        category: 'seasonal'
    },
    WINTER_2024: {
        id: 'winter_2024',
        name: 'Winter Wonderland',
        description: 'Winter 2024 Event',
        emoji: '❄️',
        rarity: 'rare',
        category: 'seasonal'
    },
    NEW_YEAR_2025: {
        id: 'new_year_2025',
        name: 'New Year Dreamer',
        description: 'New Year 2025 Event',
        emoji: '🎆',
        rarity: 'rare',
        category: 'seasonal'
    },
    VALENTINES_2025: {
        id: 'valentines_2025',
        name: 'Love Dreamer',
        description: 'Valentine\'s 2025 Event',
        emoji: '💘',
        rarity: 'rare',
        category: 'seasonal'
    },
    SUMMER_2025: {
        id: 'summer_2025',
        name: 'Summer Dreamer',
        description: 'Summer 2025 Event',
        emoji: '☀️',
        rarity: 'rare',
        category: 'seasonal'
    },
    ANNIVERSARY_2025: {
        id: 'anniversary_2025',
        name: 'Anniversary Dreamer',
        description: 'First Anniversary Event',
        emoji: '🎂',
        rarity: 'legendary',
        category: 'seasonal',
        animated: true
    },

    // ========== SECRET BADGES ==========
    MIDNIGHT_DREAMER: {
        id: 'midnight_dreamer',
        name: '???',
        description: 'Create a dream at exactly midnight',
        emoji: '🌙',
        rarity: 'epic',
        category: 'secret',
        secret: true
    },
    DREAM_PALINDROME: {
        id: 'dream_palindrome',
        name: '???',
        description: 'Create a dream on a palindrome date',
        emoji: '🔄',
        rarity: 'epic',
        category: 'secret',
        secret: true
    },
    FIBONACCI_DREAMS: {
        id: 'fibonacci_dreams',
        name: '???',
        description: 'Have 1, 1, 2, 3, 5, 8, 13 dreams',
        emoji: '🐚',
        rarity: 'legendary',
        category: 'secret',
        secret: true,
        animated: true
    },
    THE_CHOSEN_ONE: {
        id: 'the_chosen_one',
        name: '???',
        description: 'Be the 1000th user',
        emoji: '👁️',
        rarity: 'mythic',
        category: 'secret',
        secret: true,
        animated: true
    },
} as const

export type BadgeId = keyof typeof BADGES

// Rarity colors with gradients for badges
export const RARITY_COLORS: Record<BadgeRarity, string> = {
    common: '#94a3b8',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
    mythic: '#ef4444'
}

// Gradient backgrounds for each rarity
export const RARITY_GRADIENTS: Record<BadgeRarity, string> = {
    common: 'linear-gradient(135deg, #64748b 0%, #94a3b8 50%, #64748b 100%)',
    uncommon: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)',
    rare: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #2563eb 100%)',
    epic: 'linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #9333ea 100%)',
    legendary: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #d97706 100%)',
    mythic: 'linear-gradient(135deg, #dc2626 0%, #ef4444 30%, #fbbf24 50%, #ef4444 70%, #dc2626 100%)'
}

// Frame styles for each rarity (border patterns)
export const RARITY_FRAMES: Record<BadgeRarity, { border: string; shadow: string; animation?: string }> = {
    common: {
        border: '3px solid #94a3b8',
        shadow: '0 0 10px rgba(148, 163, 184, 0.3)'
    },
    uncommon: {
        border: '3px solid #22c55e',
        shadow: '0 0 15px rgba(34, 197, 94, 0.4)'
    },
    rare: {
        border: '4px solid #3b82f6',
        shadow: '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(59, 130, 246, 0.2)'
    },
    epic: {
        border: '4px solid #a855f7',
        shadow: '0 0 25px rgba(168, 85, 247, 0.6), inset 0 0 15px rgba(168, 85, 247, 0.3)',
        animation: 'badge-pulse-epic 2s ease-in-out infinite'
    },
    legendary: {
        border: '5px solid transparent',
        shadow: '0 0 30px rgba(245, 158, 11, 0.7), inset 0 0 20px rgba(245, 158, 11, 0.4)',
        animation: 'badge-glow-legendary 3s ease-in-out infinite'
    },
    mythic: {
        border: '6px solid transparent',
        shadow: '0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(251, 191, 36, 0.5), inset 0 0 30px rgba(239, 68, 68, 0.5)',
        animation: 'badge-rainbow-mythic 4s linear infinite'
    }
}

// Category info
export const BADGE_CATEGORIES: Record<BadgeCategory, { name: string; icon: string; description: string }> = {
    creation: { name: 'Creation', icon: '✨', description: 'Badges for creating dreams' },
    social: { name: 'Social', icon: '💬', description: 'Badges for community engagement' },
    exploration: { name: 'Exploration', icon: '🔍', description: 'Badges for discovering features' },
    streaks: { name: 'Streaks', icon: '🔥', description: 'Badges for consistency' },
    special: { name: 'Special', icon: '⭐', description: 'Unique achievement badges' },
    seasonal: { name: 'Seasonal', icon: '🎄', description: 'Limited-time event badges' },
    secret: { name: 'Secret', icon: '🔮', description: 'Hidden badges to discover' }
}

export async function checkAndAwardBadges(userId: string, dreamCount: number, shareCount: number) {
    const badgesToAward: BadgeId[] = []

    // Check dream count badges
    if (dreamCount === 1) badgesToAward.push('FIRST_DREAM')
    if (dreamCount === 5) badgesToAward.push('FIVE_DREAMS')
    if (dreamCount === 10) badgesToAward.push('TEN_DREAMS')
    if (dreamCount === 25) badgesToAward.push('TWENTY_FIVE_DREAMS')
    if (dreamCount === 50) badgesToAward.push('FIFTY_DREAMS')
    if (dreamCount === 100) badgesToAward.push('HUNDRED_DREAMS')
    if (dreamCount === 500) badgesToAward.push('FIVE_HUNDRED_DREAMS')
    if (dreamCount === 1000) badgesToAward.push('THOUSAND_DREAMS')

    // Check share badges
    if (shareCount === 1) badgesToAward.push('FIRST_SHARE')
    if (shareCount === 10) badgesToAward.push('TEN_SHARES')
    if (shareCount === 50) badgesToAward.push('FIFTY_SHARES')

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
