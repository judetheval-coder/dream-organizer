import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { text, style, mood, panels } = body

        if (!text || !panels || !Array.isArray(panels)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = getClient()

        // Create dream
        const { data: dream, error: dreamError } = await supabase
            .from('dreams')
            .insert([{
                user_id: userId,
                text,
                style: style || 'comic',
                mood: mood || 'neutral'
            }])
            .select()
            .single()

        if (dreamError) {
            console.error('[API dreams] Error creating dream:', dreamError)
            return NextResponse.json({ error: dreamError.message }, { status: 500 })
        }

        // Create panels
        const { data: createdPanels, error: panelsError } = await supabase
            .from('panels')
            .insert(
                panels.map((p: { description: string; scene_number: number; image_url?: string }) => ({
                    dream_id: dream.id,
                    description: p.description,
                    scene_number: p.scene_number,
                    image_url: p.image_url || null
                }))
            )
            .select()

        if (panelsError) {
            console.error('[API dreams] Error creating panels:', panelsError)
            // Dream was created but panels failed - still return the dream
            return NextResponse.json({ ...dream, panels: [] })
        }

        return NextResponse.json({ ...dream, panels: createdPanels })
    } catch (err) {
        console.error('[API dreams] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '10', 10)
        const cursor = searchParams.get('cursor')

        const supabase = getClient()

        let query = supabase
            .from('dreams')
            .select(`
        *,
        panels (*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (cursor) {
            query = query.lt('created_at', cursor)
        }

        const { data, error } = await query.limit(limit + 1)

        if (error) {
            console.error('[API dreams] Error fetching dreams:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        let nextCursor: string | undefined
        const items = data || []

        if (items.length > limit) {
            const last = items.pop()
            nextCursor = last?.created_at
        }

        return NextResponse.json({ dreams: items, nextCursor })
    } catch (err) {
        console.error('[API dreams] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
