import { auth, currentUser } from '@clerk/nextjs/server'
import { getClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const user = await currentUser()
        if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const role = (user.publicMetadata as any)?.role
        if (role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

        const body = await req.json()
        const flagId = body?.flagId as string
        if (!flagId) return NextResponse.json({ error: 'Missing flagId' }, { status: 400 })

        const admin = getClient()
        const { error } = await admin.from('flags').update({ resolved: true }).eq('id', flagId)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('admin/resolve-flag error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
