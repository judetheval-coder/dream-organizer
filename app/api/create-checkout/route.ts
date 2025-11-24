import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe, STRIPE_PRICES, type StripePriceKey } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { priceKey } = body as { priceKey: StripePriceKey }

    if (!priceKey || !STRIPE_PRICES[priceKey]) {
      return NextResponse.json({ error: 'Invalid price key' }, { status: 400 })
    }

    // Get user email from Supabase
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    const stripe = getStripe()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICES[priceKey],
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?tab=Subscription&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?tab=Subscription&canceled=true`,
      customer_email: userData?.email,
      metadata: {
        userId,
        priceKey,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
