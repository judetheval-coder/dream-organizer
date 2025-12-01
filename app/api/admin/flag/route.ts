import { auth, currentUser } from '@clerk/nextjs/server'
import { getClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const user = await currentUser()
        if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json()
        const dreamId = body?.dreamId as string
        const reason = (body?.reason || '').toString().slice(0, 1000)

        if (!dreamId || !reason) return NextResponse.json({ error: 'Missing dreamId or reason' }, { status: 400 })

        const admin = getClient()
        const { data, error } = await admin.from('flags').insert([{ dream_id: dreamId, user_id: userId, reason }])
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true, flag: data?.[0] || null })
    } catch (error) {
        console.error('admin/flag error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
