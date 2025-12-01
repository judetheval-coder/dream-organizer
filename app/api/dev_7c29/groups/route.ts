import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

export async function GET() {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const supabase = getClient()
    const { data: groups, error } = await supabase
        .from('dream_groups')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ groups })
}

export async function POST(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { name, description, emoji, isPrivate, category, banner_url, icon_url } = await request.json()

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { data: group, error } = await supabase
        .from('dream_groups')
        .insert({
            name,
            description,
            emoji,
            is_private: isPrivate,
            category,
            banner_url,
            icon_url,
            created_by: 'admin' // or something
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ group })
}

export async function DELETE(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { id } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { error } = await supabase
        .from('dream_groups')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
