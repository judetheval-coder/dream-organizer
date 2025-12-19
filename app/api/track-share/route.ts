import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const { dreamId, platform } = await req.json()

        if (!dreamId || !platform) {
            return NextResponse.json(
                { error: 'Dream ID and platform required' },
                { status: 400 }
            )
        }

        // Get current share count and increment
        const { data: dream, error: fetchError } = await supabase
            .from('dreams')
            .select('share_count')
            .eq('id', dreamId)
            .single()

        if (fetchError) {
            console.error('Error fetching dream:', fetchError)
            return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
        }

        const { error } = await supabase
            .from('dreams')
            .update({ share_count: (dream?.share_count || 0) + 1 })
            .eq('id', dreamId)

        if (error) {
            console.error('Error tracking share:', error)
            return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
        }

        // Track in analytics (PostHog if available on server, or log for now)
        const shareEvent = {
            event: 'dream_shared',
            dreamId,
            platform,
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString()
        }
        console.log('Share tracked:', shareEvent)

        // Record to share_events table if it exists (ignore errors if table absent)
        try {
            await supabase.from('share_events').insert({
                dream_id: dreamId,
                user_id: userId || null,
                platform,
                shared_at: new Date().toISOString(),
            })
        } catch (err) {
            // Table might not exist or insert failed; ignore silently
            console.debug('share_events insert ignored:', err)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in track-share API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
