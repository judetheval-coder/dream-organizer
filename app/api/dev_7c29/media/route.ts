import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

export async function GET() {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const supabase = getClient()
    const { data: media, error } = await supabase
        .from('public_media')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ media })
}

export async function POST(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { user_id, title, description, media_url, media_type, is_featured } = await request.json()

    if (!media_url) {
        return NextResponse.json({ error: 'Media URL is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { data: media, error } = await supabase
        .from('public_media')
        .insert({
            user_id,
            title,
            description,
            media_url,
            media_type: media_type || 'image',
            is_featured: is_featured || false
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ media })
}

export async function PATCH(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { id, ...updates } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { data: media, error } = await supabase
        .from('public_media')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ media })
}

export async function DELETE(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { id } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { error } = await supabase
        .from('public_media')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}