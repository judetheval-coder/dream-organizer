import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

export async function GET() {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const supabase = getClient()
    const { data: fakeUsers, error } = await supabase
        .from('fake_users')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ fakeUsers })
}

export async function POST(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { username, display_name, bio, profile_pic_url, follower_count, post_count } = await request.json()

    if (!username) {
        return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { data: fakeUser, error } = await supabase
        .from('fake_users')
        .insert({
            username,
            display_name,
            bio,
            profile_pic_url,
            follower_count: follower_count || 0,
            post_count: post_count || 0
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ fakeUser })
}

export async function PATCH(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { id, ...updates } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { data: fakeUser, error } = await supabase
        .from('fake_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ fakeUser })
}

export async function DELETE(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { id } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = getClient()
    const { error } = await supabase
        .from('fake_users')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

// Bulk create fake users
export async function PUT(request: NextRequest) {
    if (!devRoutesEnabled()) return disallowedDevResponse()

    const { count = 10, baseUsername = 'user', realistic = true } = await request.json()

    const supabase = getClient()
    const fakeUsers = []

    for (let i = 0; i < count; i++) {
        const username = realistic
            ? `${baseUsername}${Math.random().toString(36).substring(2, 8)}`
            : `${baseUsername}${i + 1}`

        const displayName = realistic
            ? `${['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'][Math.floor(Math.random() * 6)]} ${['Smith', 'Johnson', 'Brown', 'Davis', 'Miller'][Math.floor(Math.random() * 5)]}`
            : `User ${i + 1}`

        const bio = realistic
            ? ['Dream enthusiast', 'Creative mind', 'Storyteller', 'Artist at heart', 'Dream weaver', 'Imagination explorer'][Math.floor(Math.random() * 6)]
            : `Fake user ${i + 1}`

        const followerCount = realistic ? Math.floor(Math.random() * 500) + 10 : Math.floor(Math.random() * 100)
        const postCount = realistic ? Math.floor(Math.random() * 50) + 5 : Math.floor(Math.random() * 20)

        const fakeUser = {
            username,
            display_name: displayName,
            bio,
            profile_pic_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            follower_count: followerCount,
            post_count: postCount
        }

        fakeUsers.push(fakeUser)
    }

    const { data, error } = await supabase
        .from('fake_users')
        .insert(fakeUsers)
        .select()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ fakeUsers: data, count: data?.length || 0 })
}