import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const timeframe = searchParams.get('timeframe') || 'all'

        // Build date filter
        let dateFilter: Date | null = null
        const now = new Date()
        if (timeframe === 'week') {
            dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (timeframe === 'month') {
            dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        // Query published dreams with engagement stats
        let query = supabase
            .from('published_dreams')
            .select(`
                user_id,
                view_count,
                like_count,
                dream_id,
                users (id, email)
            `)
            .order('view_count', { ascending: false })
            .limit(200)

        if (dateFilter) {
            query = query.gte('published_at', dateFilter.toISOString())
        }

        const { data: publishedDreams, error } = await query

        if (error) {
            console.error('Error fetching leaderboard:', error)
            // Return empty leaderboard on error
            return NextResponse.json({ leaderboard: [] })
        }

        // Aggregate stats by user
        const userStats = new Map<string, {
            user_id: string
            username: string
            dream_count: number
            total_views: number
            total_likes: number
            avatar: string
        }>()

        for (const item of publishedDreams || []) {
            const userId = item.user_id
            const existing = userStats.get(userId) || {
                user_id: userId,
                username: (item.users as { email?: string })?.email?.split('@')[0] || 'Dreamer',
                dream_count: 0,
                total_views: 0,
                total_likes: 0,
                avatar: '🌙',
            }
            existing.dream_count++
            existing.total_views += item.view_count || 0
            existing.total_likes += item.like_count || 0
            userStats.set(userId, existing)
        }

        // Sort by total engagement and take top 50
        const leaderboard = Array.from(userStats.values())
            .map((user, index) => ({
                ...user,
                rank: index + 1,
                total_score: user.total_views + (user.total_likes * 5), // Likes worth more
            }))
            .sort((a, b) => b.total_score - a.total_score)
            .slice(0, 50)
            .map((user, index) => ({ ...user, rank: index + 1 }))

        return NextResponse.json({ leaderboard })
    } catch (error) {
        console.error('Error in leaderboard API:', error)
        return NextResponse.json(
            { error: 'Internal server error', leaderboard: [] },
            { status: 500 }
        )
    }
}
