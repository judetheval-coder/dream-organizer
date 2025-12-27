import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'

// Check if a dream is published (public endpoint, no auth required)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const dreamId = searchParams.get('dreamId')

    if (!dreamId) {
        return NextResponse.json({ error: 'Missing dreamId' }, { status: 400 })
    }

    try {
        const supabase = getClient()

        const { data, error } = await supabase
            .from('published_dreams')
            .select('id')
            .eq('dream_id', dreamId)
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('[API dream-published] Error:', error)
            return NextResponse.json({ published: false })
        }

        return NextResponse.json({ published: !!data })
    } catch (err) {
        console.error('[API dream-published] Unexpected error:', err)
        return NextResponse.json({ published: false })
    }
}
