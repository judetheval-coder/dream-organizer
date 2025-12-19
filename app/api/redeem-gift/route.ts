import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { redeemGiftCode } from '@/lib/social'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { giftCode } = await req.json()

        if (!giftCode) {
            return NextResponse.json({ error: 'Gift code is required' }, { status: 400 })
        }

        const result = await redeemGiftCode(giftCode, userId)

        if (result.success) {
            return NextResponse.json({
                success: true,
                tier: result.tier,
                duration: result.duration,
                message: `Successfully redeemed ${result.tier} subscription for ${result.duration}`
            })
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to redeem gift code'
            }, { status: 400 })
        }
    } catch (error) {
        console.error('Redeem gift error:', error)
        return NextResponse.json({ error: 'Failed to redeem gift code' }, { status: 500 })
    }
}
