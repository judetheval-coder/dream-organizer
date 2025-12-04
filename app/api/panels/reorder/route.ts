import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'

// POST - Reorder panels for a dream
export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { dreamId, panelOrder } = await req.json()

        if (!dreamId || !Array.isArray(panelOrder)) {
            return NextResponse.json(
                { error: 'dreamId and panelOrder array required' },
                { status: 400 }
            )
        }

        const supabase = getClient()

        // Verify the dream belongs to the user
        const { data: dream, error: dreamError } = await supabase
            .from('dreams')
            .select('id')
            .eq('id', dreamId)
            .eq('user_id', userId)
            .single()

        if (dreamError || !dream) {
            return NextResponse.json(
                { error: 'Dream not found or unauthorized' },
                { status: 404 }
            )
        }

        // Update each panel's scene_number based on new order
        const updates = panelOrder.map((panelId: string, index: number) =>
            supabase
                .from('panels')
                .update({ scene_number: index + 1 })
                .eq('id', panelId)
                .eq('dream_id', dreamId)
        )

        // Execute all updates
        const results = await Promise.all(updates)

        // Check for any errors
        const errors = results.filter(r => r.error)
        if (errors.length > 0) {
            console.error('[API panels/reorder] Errors:', errors.map(e => e.error))
            return NextResponse.json(
                { error: 'Failed to reorder some panels' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[API panels/reorder] Unexpected error:', err)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
