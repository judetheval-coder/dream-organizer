import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all users with stats
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const search = searchParams.get('search') || ''

        let query = supabase
            .from('users')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (search) {
            query = query.ilike('email', `%${search}%`)
        }

        const { data: users, error, count } = await query

        if (error) throw error

        // Get dream counts for each user
        const userIds = users?.map(u => u.id) || []

        const { data: dreamCounts } = await supabase
            .from('dreams')
            .select('user_id')
            .in('user_id', userIds)

        const counts: Record<string, number> = {}
        dreamCounts?.forEach(d => {
            counts[d.user_id] = (counts[d.user_id] || 0) + 1
        })

        // Get panel counts
        const { data: panelData } = await supabase
            .from('panels')
            .select('dream_id, dreams!inner(user_id)')
            .in('dreams.user_id', userIds)

        const panelCounts: Record<string, number> = {}
        panelData?.forEach((p: any) => {
            const userId = p.dreams?.user_id
            if (userId) {
                panelCounts[userId] = (panelCounts[userId] || 0) + 1
            }
        })        // Merge stats with users
        const usersWithStats = users?.map(u => ({
            ...u,
            actual_dreams_count: counts[u.id] || 0,
            panels_count: panelCounts[u.id] || 0
        }))

        return NextResponse.json({
            users: usersWithStats || [],
            total: count || 0,
            limit,
            offset
        })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

// PATCH - Update user (subscription tier, etc.)
export async function PATCH(req: Request) {
    try {
        const body = await req.json()
        const { id, subscription_tier, action } = body

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        if (action === 'upgrade_to_pro') {
            const { data, error } = await supabase
                .from('users')
                .update({ subscription_tier: 'pro' })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ user: data, message: 'Upgraded to Pro!' })
        }

        if (action === 'upgrade_to_premium') {
            const { data, error } = await supabase
                .from('users')
                .update({ subscription_tier: 'premium' })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ user: data, message: 'Upgraded to Premium!' })
        }

        if (action === 'reset_to_free') {
            const { data, error } = await supabase
                .from('users')
                .update({ subscription_tier: 'free' })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return NextResponse.json({ user: data, message: 'Reset to Free tier' })
        }

        // Generic update
        const updateData: Record<string, string> = {}
        if (subscription_tier) updateData.subscription_tier = subscription_tier

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ user: data })
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}

// DELETE - Delete user and all their data
export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const { id, confirm } = body

        if (!id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        if (!confirm) {
            return NextResponse.json({ error: 'Confirm deletion required' }, { status: 400 })
        }

        // Delete cascades through foreign keys, but let's be explicit
        // Dreams and panels will be deleted via CASCADE

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true, message: 'User deleted' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}
