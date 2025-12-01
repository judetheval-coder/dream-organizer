import { NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

export async function GET() {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const supabase = getClient()

    // Get various counts
    const [
        { count: totalUsers },
        { count: totalDreams },
        { count: totalPanels },
        { count: totalGroups },
        { count: totalContests },
        { count: totalMedia },
        { count: totalFakeUsers },
        { count: totalComments },
        { count: totalGroupPosts },
        { count: totalAchievements },
        { count: totalSocialEvents }
    ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('dreams').select('*', { count: 'exact', head: true }),
        supabase.from('panels').select('*', { count: 'exact', head: true }),
        supabase.from('dream_groups').select('*', { count: 'exact', head: true }),
        supabase.from('contests').select('*', { count: 'exact', head: true }),
        supabase.from('public_media').select('*', { count: 'exact', head: true }),
        supabase.from('fake_users').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('group_posts').select('*', { count: 'exact', head: true }),
        supabase.from('user_achievements').select('*', { count: 'exact', head: true }),
        supabase.from('social_events').select('*', { count: 'exact', head: true })
    ])

    // Get recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const [
        { count: recentDreams },
        { count: recentPanels },
        { count: recentGroups },
        { count: recentContests },
        { count: recentMedia }
    ] = await Promise.all([
        supabase.from('dreams').select('*', { count: 'exact', head: true }).gte('created_at', yesterday),
        supabase.from('panels').select('*', { count: 'exact', head: true }).gte('created_at', yesterday),
        supabase.from('dream_groups').select('*', { count: 'exact', head: true }).gte('created_at', yesterday),
        supabase.from('contests').select('*', { count: 'exact', head: true }).gte('created_at', yesterday),
        supabase.from('public_media').select('*', { count: 'exact', head: true }).gte('created_at', yesterday)
    ])

    // Get engagement totals
    const { data: media } = await supabase
        .from('public_media')
        .select('view_count, like_count')

    const totalViews = media?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0
    const totalLikes = media?.reduce((sum, item) => sum + (item.like_count || 0), 0) || 0

    // Get simulation counts
    const [
        { count: totalGroupMembers },
        { count: totalContestEntries }
    ] = await Promise.all([
        supabase.from('group_members').select('*', { count: 'exact', head: true }),
        supabase.from('contest_entries').select('*', { count: 'exact', head: true })
    ])

    // Get online users count
    const { count: onlineUsers } = await supabase
        .from('user_online_status')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true)

    const stats = {
        totalUsers: totalUsers || 0,
        totalDreams: totalDreams || 0,
        totalPanels: totalPanels || 0,
        totalGroups: totalGroups || 0,
        totalContests: totalContests || 0,
        totalMedia: totalMedia || 0,
        totalFakeUsers: totalFakeUsers || 0,
        totalSimulatedMembers: totalGroupMembers || 0,
        totalSimulatedEntries: totalContestEntries || 0,
        totalSimulatedViews: totalViews,
        totalSimulatedLikes: totalLikes,
        totalSimulatedComments: totalComments || 0,
        totalSimulatedPosts: totalGroupPosts || 0,
        totalAchievements: totalAchievements || 0,
        totalSocialEvents: totalSocialEvents || 0,
        onlineUsers: onlineUsers || 0,
        engagementMultiplier: totalFakeUsers ? Math.round((totalViews + totalLikes + (totalComments || 0) + (totalGroupPosts || 0)) / Math.max(totalFakeUsers, 1)) : 0,
        recentDreams: recentDreams || 0,
        recentPanels: recentPanels || 0,
        recentGroups: recentGroups || 0,
        recentContests: recentContests || 0,
        recentMedia: recentMedia || 0,
        timestamp: new Date().toISOString()
    }

    return NextResponse.json({ stats })
}

export async function POST(request: Request) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    // Allow manual adjustment of stats (for simulation)
    const { statName, value } = await request.json()

    if (!statName || typeof value !== 'number') {
        return NextResponse.json({ error: 'statName and value required' }, { status: 400 })
    }

    // In a real implementation, you'd store these overrides in a separate table
    // For now, just return success
    return NextResponse.json({ success: true, adjusted: { [statName]: value } })
}