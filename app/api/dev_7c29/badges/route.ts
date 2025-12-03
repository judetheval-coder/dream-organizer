import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// All available badges in the system
const ALL_BADGES = [
    { id: 'first_dream', name: 'First Dream', description: 'Record your first dream', rarity: 'common', emoji: '🌟' },
    { id: 'dream_weaver', name: 'Dream Weaver', description: 'Record 10 dreams', rarity: 'uncommon', emoji: '🕸️' },
    { id: 'dream_master', name: 'Dream Master', description: 'Record 50 dreams', rarity: 'rare', emoji: '👑' },
    { id: 'dream_legend', name: 'Dream Legend', description: 'Record 100 dreams', rarity: 'legendary', emoji: '🌌' },
    { id: 'first_comic', name: 'Comic Creator', description: 'Generate your first comic', rarity: 'common', emoji: '🎨' },
    { id: 'comic_master', name: 'Comic Master', description: 'Generate 25 comics', rarity: 'rare', emoji: '🖼️' },
    { id: 'streak_3', name: 'Consistent Dreamer', description: '3 day streak', rarity: 'common', emoji: '🔥' },
    { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', rarity: 'uncommon', emoji: '⚡' },
    { id: 'streak_30', name: 'Monthly Marvel', description: '30 day streak', rarity: 'epic', emoji: '💫' },
    { id: 'streak_100', name: 'Century Dreamer', description: '100 day streak', rarity: 'legendary', emoji: '🏆' },
    { id: 'challenge_champion', name: 'Challenge Champion', description: 'Win a daily challenge', rarity: 'epic', emoji: '🥇' },
    { id: 'challenge_participant', name: 'Challenger', description: 'Submit to a challenge', rarity: 'common', emoji: '🎯' },
    { id: 'referral_1', name: 'Friend Finder', description: 'Refer 1 friend', rarity: 'common', emoji: '🤝' },
    { id: 'referral_5', name: 'Social Butterfly', description: 'Refer 5 friends', rarity: 'uncommon', emoji: '🦋' },
    { id: 'referral_10', name: 'Influencer', description: 'Refer 10 friends', rarity: 'rare', emoji: '📣' },
    { id: 'night_owl', name: 'Night Owl', description: 'Record a dream after midnight', rarity: 'uncommon', emoji: '🦉' },
    { id: 'early_bird', name: 'Early Bird', description: 'Record a dream before 6am', rarity: 'uncommon', emoji: '🐦' },
    { id: 'pro_member', name: 'Pro Dreamer', description: 'Upgrade to Pro', rarity: 'rare', emoji: '💎' },
    { id: 'premium_member', name: 'Premium Legend', description: 'Upgrade to Premium', rarity: 'legendary', emoji: '👸' },
    { id: 'lucid_dreamer', name: 'Lucid Dreamer', description: 'Tag a dream as lucid', rarity: 'uncommon', emoji: '🧠' },
    { id: 'nightmare_survivor', name: 'Nightmare Survivor', description: 'Record 5 nightmares', rarity: 'rare', emoji: '😱' },
    { id: 'beta_tester', name: 'Beta Tester', description: 'Early adopter badge', rarity: 'legendary', emoji: '🧪' },
]

// GET - Get badge stats and list users with badges
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const action = searchParams.get('action')

        if (action === 'stats') {
            // Get badge distribution
            const { data: userBadges, error } = await supabase
                .from('user_badges')
                .select('badge_id, user_id, earned_at')

            if (error) throw error

            // Count badges by type
            const badgeCounts: Record<string, number> = {}
            const recentUnlocks: Array<{ badge_id: string; user_id: string; earned_at: string }> = []

            userBadges?.forEach(ub => {
                badgeCounts[ub.badge_id] = (badgeCounts[ub.badge_id] || 0) + 1
                recentUnlocks.push(ub)
            })

            // Sort recent unlocks
            recentUnlocks.sort((a, b) =>
                new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
            )

            // Get user emails for recent unlocks
            const recentUserIds = [...new Set(recentUnlocks.slice(0, 20).map(u => u.user_id))]
            const { data: users } = await supabase
                .from('users')
                .select('id, email')
                .in('id', recentUserIds)

            const userMap: Record<string, string> = {}
            users?.forEach(u => { userMap[u.id] = u.email })

            const recentWithEmail = recentUnlocks.slice(0, 20).map(u => ({
                ...u,
                email: userMap[u.user_id] || 'Unknown',
                badge: ALL_BADGES.find(b => b.id === u.badge_id)
            }))

            return NextResponse.json({
                allBadges: ALL_BADGES,
                badgeCounts,
                totalAwarded: userBadges?.length || 0,
                uniqueUsers: [...new Set(userBadges?.map(ub => ub.user_id))].length,
                recentUnlocks: recentWithEmail
            })
        }

        // Default: return all badges
        return NextResponse.json({ badges: ALL_BADGES })
    } catch (error) {
        console.error('Error fetching badges:', error)
        return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 })
    }
}

// POST - Award a badge to a user
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { user_id, badge_id } = body

        if (!user_id || !badge_id) {
            return NextResponse.json({ error: 'User ID and Badge ID are required' }, { status: 400 })
        }

        // Verify badge exists
        const badge = ALL_BADGES.find(b => b.id === badge_id)
        if (!badge) {
            return NextResponse.json({ error: 'Invalid badge ID' }, { status: 400 })
        }

        // Verify user exists
        const { data: user } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', user_id)
            .single()

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Award the badge (upsert to avoid duplicates)
        const { data, error } = await supabase
            .from('user_badges')
            .upsert({
                user_id,
                badge_id,
                earned_at: new Date().toISOString()
            }, { onConflict: 'user_id,badge_id' })
            .select()

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: `Awarded "${badge.name}" badge to ${user.email}`,
            badge,
            data
        })
    } catch (error) {
        console.error('Error awarding badge:', error)
        return NextResponse.json({ error: 'Failed to award badge' }, { status: 500 })
    }
}

// DELETE - Remove a badge from a user
export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const { user_id, badge_id } = body

        if (!user_id || !badge_id) {
            return NextResponse.json({ error: 'User ID and Badge ID are required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('user_badges')
            .delete()
            .eq('user_id', user_id)
            .eq('badge_id', badge_id)

        if (error) throw error

        return NextResponse.json({ success: true, message: 'Badge removed' })
    } catch (error) {
        console.error('Error removing badge:', error)
        return NextResponse.json({ error: 'Failed to remove badge' }, { status: 500 })
    }
}
