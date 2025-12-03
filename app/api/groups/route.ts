import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'

function getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
        lucid: '✨',
        nightmare: '👻',
        adventure: '🗺️',
        recurring: '🔄',
        flying: '🦅',
        prophetic: '🔮',
        fantasy: '🧙',
        spiritual: '🙏',
        general: '💭'
    }
    return emojiMap[category] || '💭'
}

// GET - Fetch all groups
export async function GET() {
    try {
        const { userId } = await auth()
        const supabase = getClient()

        const { data, error } = await supabase
            .from('dream_groups')
            .select('*')
            .order('member_count', { ascending: false })

        if (error) {
            console.error('[API groups] Error fetching groups:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Get joined groups if user is authenticated
        let joinedGroupIds: string[] = []
        if (userId) {
            const { data: memberships } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', userId)

            joinedGroupIds = memberships?.map(m => m.group_id) || []
        }

        const groups = (data || []).map(g => ({
            id: g.id,
            name: g.name,
            description: g.description || '',
            emoji: getCategoryEmoji(g.category),
            memberCount: g.member_count || 0,
            postCount: 0,
            isJoined: joinedGroupIds.includes(g.id),
            isPrivate: g.is_private || false,
            category: g.category,
            createdBy: g.created_by,
        }))

        return NextResponse.json({ groups })
    } catch (err) {
        console.error('[API groups] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new group
export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, description, category, isPrivate } = body

        if (!name) {
            return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
        }

        const supabase = getClient()

        // Check if user is premium
        const { data: userRow, error: userErr } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', userId)
            .single()

        if (userErr) {
            console.error('[API groups] Error checking user tier:', userErr)
            return NextResponse.json({ error: 'Could not verify user' }, { status: 500 })
        }

        if (!userRow || userRow.subscription_tier !== 'premium') {
            return NextResponse.json({ error: 'Only premium users can create groups' }, { status: 403 })
        }

        // Create the group
        const { data: group, error: groupError } = await supabase
            .from('dream_groups')
            .insert({
                name,
                description: description || '',
                category: category || 'general',
                is_private: isPrivate || false,
                created_by: userId,
                member_count: 1
            })
            .select()
            .single()

        if (groupError) {
            console.error('[API groups] Error creating group:', groupError)
            return NextResponse.json({ error: groupError.message }, { status: 500 })
        }

        // Auto-join the creator as admin
        await supabase
            .from('group_members')
            .insert({
                group_id: group.id,
                user_id: userId,
                role: 'leader'
            })

        return NextResponse.json({
            success: true,
            group: {
                id: group.id,
                name: group.name,
                description: group.description || '',
                emoji: getCategoryEmoji(group.category),
                memberCount: 1,
                postCount: 0,
                isJoined: true,
                isPrivate: group.is_private,
                category: group.category,
                createdBy: userId,
            }
        })
    } catch (err) {
        console.error('[API groups] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
