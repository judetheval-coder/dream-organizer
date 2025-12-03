import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get comprehensive database health and stats
export async function GET() {
    try {
        const tables = [
            'users',
            'dreams',
            'panels',
            'subscriptions',
            'daily_challenges',
            'challenge_submissions',
            'dream_groups',
            'group_members',
            'contests',
            'contest_entries',
            'fake_users',
            'public_media',
            'comments',
            'group_posts',
            'user_achievements',
            'user_online_status',
            'social_events',
            'user_badges',
            'referrals'
        ]

        const counts: Record<string, number | string> = {}
        const errors: string[] = []

        // Get count for each table
        for (const table of tables) {
            try {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true })

                if (error) {
                    counts[table] = 'error'
                    errors.push(`${table}: ${error.message}`)
                } else {
                    counts[table] = count || 0
                }
            } catch (e) {
                counts[table] = 'missing'
                errors.push(`${table}: Table may not exist`)
            }
        }

        // Get recent activity
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: recentDreams } = await supabase
            .from('dreams')
            .select('id')
            .gte('created_at', oneDayAgo)

        const { data: recentUsers } = await supabase
            .from('users')
            .select('id')
            .gte('created_at', oneDayAgo)

        const { data: recentPanels } = await supabase
            .from('panels')
            .select('id')
            .gte('created_at', oneDayAgo)

        // Storage bucket info (if accessible)
        let storageInfo = null
        try {
            const { data: buckets } = await supabase.storage.listBuckets()
            storageInfo = buckets?.map(b => ({ name: b.name, public: b.public }))
        } catch {
            storageInfo = 'Could not access storage'
        }

        // Get subscription tier distribution
        const { data: tierData } = await supabase
            .from('users')
            .select('subscription_tier')

        const tierCounts: Record<string, number> = { free: 0, pro: 0, premium: 0 }
        tierData?.forEach(u => {
            const tier = u.subscription_tier || 'free'
            tierCounts[tier] = (tierCounts[tier] || 0) + 1
        })

        return NextResponse.json({
            status: errors.length === 0 ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            tableCounts: counts,
            errors: errors.length > 0 ? errors : null,
            recent24h: {
                dreams: recentDreams?.length || 0,
                users: recentUsers?.length || 0,
                panels: recentPanels?.length || 0
            },
            subscriptionDistribution: tierCounts,
            storage: storageInfo,
            connection: 'OK'
        })
    } catch (error) {
        console.error('Error checking database health:', error)
        return NextResponse.json({
            status: 'error',
            error: 'Failed to check database health',
            connection: 'FAILED'
        }, { status: 500 })
    }
}

// POST - Run database maintenance actions
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { action } = body

        if (action === 'cleanup_orphans') {
            // Find panels without dreams
            const { data: orphanPanels, error: panelError } = await supabase
                .from('panels')
                .select('id, dream_id')
                .is('dream_id', null)

            if (panelError) throw panelError

            // Delete orphan panels
            if (orphanPanels && orphanPanels.length > 0) {
                await supabase
                    .from('panels')
                    .delete()
                    .is('dream_id', null)
            }

            return NextResponse.json({
                success: true,
                message: `Cleaned up ${orphanPanels?.length || 0} orphan panels`
            })
        }

        if (action === 'reset_monthly_counters') {
            const { error } = await supabase
                .from('users')
                .update({ panels_generated_this_month: 0 })
                .neq('id', '')

            if (error) throw error

            return NextResponse.json({
                success: true,
                message: 'Reset monthly panel counters for all users'
            })
        }

        if (action === 'verify_counts') {
            // Recalculate dreams_count for all users
            const { data: users } = await supabase
                .from('users')
                .select('id')

            let updated = 0
            for (const user of users || []) {
                const { count } = await supabase
                    .from('dreams')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                await supabase
                    .from('users')
                    .update({ dreams_count: count || 0 })
                    .eq('id', user.id)

                updated++
            }

            return NextResponse.json({
                success: true,
                message: `Verified and updated dream counts for ${updated} users`
            })
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    } catch (error) {
        console.error('Error running maintenance:', error)
        return NextResponse.json({ error: 'Maintenance action failed' }, { status: 500 })
    }
}
