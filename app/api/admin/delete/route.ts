import { auth, currentUser } from '@clerk/nextjs/server'
import { getClient } from '@/lib/supabase-server'
import { deleteDreamImages } from '@/lib/supabase-storage'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        const user = await currentUser()
        if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const role = (user.publicMetadata as any)?.role
        if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const body = await req.json()
        const dreamId = body?.dreamId as string
        if (!dreamId) return NextResponse.json({ error: 'Missing dreamId' }, { status: 400 })

        const admin = getClient()
        // Find dream (including owner id for storage cleanup)
        const { data: dreamData, error: dErr } = await admin.from('dreams').select('id, user_id').eq('id', dreamId).single()
        if (dErr || !dreamData) return NextResponse.json({ error: 'Dream not found' }, { status: 404 })

        // Delete panels
        const { error: panelErr } = await admin.from('panels').delete().eq('dream_id', dreamId)
        if (panelErr) console.warn('panel delete err', panelErr)

        // Delete dream
        const { error: dreamErr } = await admin.from('dreams').delete().eq('id', dreamId)
        if (dreamErr) return NextResponse.json({ error: dreamErr.message }, { status: 500 })

        try {
            // Remove images folder for dream
            await deleteDreamImages(dreamData.user_id, dreamId)
        } catch (e) {
            // Not fatal - log
            console.warn('Error deleting images:', e)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('admin/delete error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
