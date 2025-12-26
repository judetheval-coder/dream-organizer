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
        const { dreamId, title, description } = body

        if (!dreamId) {
            return NextResponse.json({ error: 'Missing dream ID' }, { status: 400 })
        }

        const supabase = getClient()

        // Verify the dream belongs to the user
        const { data: dream, error: dreamError } = await supabase
            .from('dreams')
            .select('id, user_id, panels(id, image_url)')
            .eq('id', dreamId)
            .single()

        if (dreamError || !dream) {
            return NextResponse.json({ error: 'Dream not found' }, { status: 404 })
        }

        if (dream.user_id !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Get the first panel's image as thumbnail
        const thumbnailUrl = dream.panels?.[0]?.image_url || null

        // Check if already published
        const { data: existing } = await supabase
            .from('published_dreams')
            .select('id')
            .eq('dream_id', dreamId)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Dream already published' }, { status: 409 })
        }

        // Create published dream entry
        const { data: published, error: publishError } = await supabase
            .from('published_dreams')
            .insert([{
                dream_id: dreamId,
                user_id: userId,
                title: title || null,
                description: description || null,
                thumbnail_url: thumbnailUrl,
            }])
            .select()
            .single()

        if (publishError) {
            console.error('[API publish-dream] Error publishing:', publishError)
            return NextResponse.json({ error: publishError.message }, { status: 500 })
        }

        // Mark the dream as public
        await supabase
            .from('dreams')
            .update({ is_public: true })
            .eq('id', dreamId)

        return NextResponse.json({ success: true, published })
    } catch (err) {
        console.error('[API publish-dream] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const dreamId = searchParams.get('dreamId')

        if (!dreamId) {
            return NextResponse.json({ error: 'Missing dream ID' }, { status: 400 })
        }

        const supabase = getClient()

        // Verify ownership and delete
        const { error } = await supabase
            .from('published_dreams')
            .delete()
            .eq('dream_id', dreamId)
            .eq('user_id', userId)

        if (error) {
            console.error('[API publish-dream] Error unpublishing:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Mark dream as private
        await supabase
            .from('dreams')
            .update({ is_public: false })
            .eq('id', dreamId)
            .eq('user_id', userId)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[API publish-dream] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
