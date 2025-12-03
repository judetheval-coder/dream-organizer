import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get user details with all their dreams and panels
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('id')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Get user
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (userError) throw userError

        // Get user's dreams with panels
        const { data: dreams, error: dreamsError } = await supabase
            .from('dreams')
            .select(`
        *,
        panels (id, image_url, description, scene_number)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (dreamsError) throw dreamsError

        // Get user's badges
        const { data: badges } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId)

        // Get user's challenge submissions
        const { data: submissions } = await supabase
            .from('challenge_submissions')
            .select(`
        *,
        challenge:daily_challenges (prompt, challenge_date)
      `)
            .eq('user_id', userId)
            .order('submitted_at', { ascending: false })

        // Get user's referrals
        const { data: referrals } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_id', userId)

        return NextResponse.json({
            user,
            dreams: dreams || [],
            badges: badges || [],
            submissions: submissions || [],
            referrals: referrals || [],
            stats: {
                total_dreams: dreams?.length || 0,
                total_panels: dreams?.reduce((acc, d) => acc + (d.panels?.length || 0), 0) || 0,
                total_badges: badges?.length || 0,
                total_submissions: submissions?.length || 0,
                total_referrals: referrals?.length || 0
            }
        })
    } catch (error) {
        console.error('Error fetching user details:', error)
        return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 })
    }
}
