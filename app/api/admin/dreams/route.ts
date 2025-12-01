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
        const q = (url.searchParams.get('q') || '').trim()
        const limit = Number(url.searchParams.get('limit') || '20')
        const offset = Number(url.searchParams.get('offset') || '0')
        const sort = url.searchParams.get('sort') || 'created_at'
        const order = (url.searchParams.get('order') || 'desc').toLowerCase() === 'asc'

        const admin = getClient()
        // Build base query and count
        let base = admin.from('dreams')
        if (q) {
            // search by text containing q (case-insensitive)
            base = base.ilike('text', `%${q}%`)
        }

        const countRes = await base.select('id', { count: 'exact', head: true })
        const total = (countRes.count as number) || 0

        // Fetch page with panels.image_url for thumbnails
        // server supports sorting by created_at only. Derived fields are sorted client-side.
        const serverSort = sort === 'created_at' ? 'created_at' : 'created_at'
        let query = admin.from('dreams').select(`id, user_id, text, created_at, panels ( id, image_url )`)
        if (q) {
            query = query.ilike('text', `%${q}%`)
        }
        query = query.order(serverSort, { ascending: order }).range(offset, offset + limit - 1)
        const { data, error } = await query

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        // Count flags for each dream
        const dreams = await Promise.all(
            (data as any[]).map(async (d) => {
                const { count } = await admin.from('flags').select('*', { count: 'exact' }).eq('dream_id', d.id)
                return {
                    ...d,
                    panels_count: (d.panels || []).length,
                    flags_count: (count as number) || 0,
                }
            })
        )
        return NextResponse.json({ dreams, total })
    } catch (error) {
        console.error('admin/dreams error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
