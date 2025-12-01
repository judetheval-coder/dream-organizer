import { auth, currentUser } from '@clerk/nextjs/server'
import { getClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { userId } = await auth()
        const user = await currentUser()
        if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const role = (user.publicMetadata as any)?.role
        if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const url = new URL(req.url)
        const dreamId = url.searchParams.get('dreamId')
        const admin = getClient()
        let query = admin.from('flags').select('id, dream_id, user_id, reason, resolved, created_at')
        if (dreamId) query = query.eq('dream_id', dreamId)
        const { data, error } = await query
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ flags: data })
    } catch (error) {
        console.error('admin/flags error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
