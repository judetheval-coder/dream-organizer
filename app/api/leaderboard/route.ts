import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const timeframe = searchParams.get('timeframe') || 'all'

        // Build date filter
        let dateFilter = ''
        const now = new Date()
        if (timeframe === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            dateFilter = `AND d.created_at >= '${weekAgo.toISOString()}'`
        } else if (timeframe === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            dateFilter = `AND d.created_at >= '${monthAgo.toISOString()}'`
        }

        // Query leaderboard stats
        const { data, error } = await supabase.rpc('get_leaderboard', {
            date_filter: dateFilter
        })

        if (error) {
            console.error('Error fetching leaderboard:', error)
            // Fallback to basic query if RPC doesn't exist
            const { data: dreams, error: fallbackError } = await supabase
                .from('dreams')
                .select('user_id, share_count, view_count')
                .order('share_count', { ascending: false })
                .limit(100)

            if (fallbackError) throw fallbackError

            // Aggregate by user
            const userStats = new Map()
            dreams?.forEach((dream) => {
                const existing = userStats.get(dream.user_id) || {
                    user_id: dream.user_id,
                    dream_count: 0,
                    total_shares: 0,
                    total_views: 0,
                    total_likes: 0,
                }
                existing.dream_count++
                existing.total_shares += dream.share_count || 0
                existing.total_views += dream.view_count || 0
                userStats.set(dream.user_id, existing)
            })

            const leaderboard = Array.from(userStats.values())
                .sort((a, b) => (b.total_shares + b.total_likes + b.total_views) - (a.total_shares + a.total_likes + a.total_views))
                .slice(0, 50)

            return NextResponse.json({ leaderboard })
        }

        return NextResponse.json({ leaderboard: data })
    } catch (error) {
        console.error('Error in leaderboard API:', error)
        return NextResponse.json(
            { error: 'Internal server error', leaderboard: [] },
            { status: 500 }
        )
    }
}
