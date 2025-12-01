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

        // TODO: Track in analytics
        console.log(`Dream ${dreamId} shared on ${platform} by ${userId || 'anonymous'}`)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error in track-share API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
