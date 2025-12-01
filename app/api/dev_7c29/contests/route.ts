import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

export async function GET() {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const supabase = getClient()
    const { data: contests, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contests })
}

export async function POST(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { title, description, rules, prize_info, start_date, end_date, status } = await request.json()

    if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { data: contest, error } = await supabase
        .from('contests')
        .insert({
            title,
            description,
            rules,
            prize_info,
            start_date,
            end_date,
            status: status || 'draft',
            created_by: 'admin'
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contest })
}

export async function PATCH(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { id, ...updates } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { data: contest, error } = await supabase
        .from('contests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ contest })
}

export async function DELETE(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { id } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { error } = await supabase
        .from('contests')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}