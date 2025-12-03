import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getClient } from '@/lib/supabase-server'

// POST - Join a group
export async function POST(
    req: Request,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { groupId } = await params
        const supabase = getClient()

        // Check if already a member
        const { data: existing } = await supabase
            .from('group_memberships')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .single()

        if (existing) {
            return NextResponse.json({ success: true, message: 'Already a member' })
        }

        // Join the group
        const { error } = await supabase
            .from('group_memberships')
            .insert({
                group_id: groupId,
                user_id: userId,
                role: 'member'
            })

        if (error) {
            console.error('[API groups/join] Error joining group:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Increment member count
        await supabase.rpc('increment_group_member_count', { group_id: groupId })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[API groups/join] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Leave a group
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { groupId } = await params
        const supabase = getClient()

        const { error } = await supabase
            .from('group_memberships')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', userId)

        if (error) {
            console.error('[API groups/leave] Error leaving group:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Decrement member count
        await supabase.rpc('decrement_group_member_count', { group_id: groupId })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[API groups/leave] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
