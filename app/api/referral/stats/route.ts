import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// Generate a unique referral code for user
function generateReferralCode(userId: string): string {
    return userId.substring(0, 8).toUpperCase()
}

export async function GET(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const referralCode = generateReferralCode(userId)

        // Get referral count
        const { count, error } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_user_id', userId)

        if (error) throw error

        return NextResponse.json({
            referralCode,
            referralCount: count || 0
        })
    } catch (error) {
        console.error('Error fetching referral stats:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
