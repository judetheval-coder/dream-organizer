import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe, STRIPE_PRICES, type StripePriceKey } from '@/lib/stripe'
import { captureException } from '@/lib/sentry'
import { supabase } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limiter'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Basic rate limiting per user/IP to protect checkout endpoint
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
    const key = `checkout:${userId || ip}`
    const { allowed, headers } = checkRateLimit(key, 5, 60_000)
    if (!allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers,
      })
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

    // Validate NEXT_PUBLIC_APP_URL for production
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      console.error('Checkout error: missing NEXT_PUBLIC_APP_URL')
      return NextResponse.json({ error: 'Server misconfigured: missing app url' }, { status: 500 })
    }
    try {
      new URL(appUrl)
    } catch (err) {
      console.error('Checkout error: invalid NEXT_PUBLIC_APP_URL', appUrl)
      return NextResponse.json({ error: 'Server misconfigured: invalid app url' }, { status: 500 })
    }

    const stripe = getStripe()

    // Create Stripe checkout session
    const successUrl = new URL('/dashboard', appUrl)
    successUrl.searchParams.set('tab', 'Subscription')
    successUrl.searchParams.set('success', 'true')

    const cancelUrl = new URL('/dashboard', appUrl)
    cancelUrl.searchParams.set('tab', 'Subscription')
    cancelUrl.searchParams.set('canceled', 'true')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICES[priceKey],
          quantity: 1,
        },
      ],
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
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

    const res = NextResponse.json({ url: session.url })
    // pass through rate limit headers for observability
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
    return res
  } catch (error) {
    captureException(error)
    console.error('Checkout error:', error);

    // Enhanced error logging with structured output
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else {
      console.error('Non-standard error object:', JSON.stringify(error, null, 2));
    }

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? { message: error.message, name: error.name } : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
