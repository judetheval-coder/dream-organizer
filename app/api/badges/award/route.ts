import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { badges } = await req.json()

        if (!badges || !Array.isArray(badges)) {
            return NextResponse.json({ error: 'Invalid badges array' }, { status: 400 })
        }

        // Insert badges (ignore duplicates due to UNIQUE constraint)
        const badgeRecords = badges.map(badgeType => ({
            user_id: userId,
            badge_type: badgeType
        }))

        const { data, error } = await supabase
            .from('user_badges')
            .upsert(badgeRecords, { onConflict: 'user_id,badge_type', ignoreDuplicates: true })
            .select()

        if (error) {
            console.error('Error awarding badges:', error)
            return NextResponse.json({ error: 'Failed to award badges' }, { status: 500 })
        }

        return NextResponse.json({ success: true, newBadges: data })
    } catch (error) {
        console.error('Error in badge award API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET user's badges
export async function GET(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })

        if (error) throw error

        return NextResponse.json({ badges: data })
    } catch (error) {
        console.error('Error fetching badges:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
