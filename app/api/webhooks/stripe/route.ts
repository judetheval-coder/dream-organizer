import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { captureException } from '@/lib/sentry'
import { supabase } from '@/lib/supabase'
import type { SubscriptionTier } from '@/lib/subscription-tiers'
import { checkRateLimit } from '@/lib/rate-limiter'

export const runtime = 'nodejs'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Map Stripe price IDs to subscription tiers
function getTierFromPriceId(priceId: string): SubscriptionTier {
  const proPrices = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ]
  const premiumPrices = [
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  ]

  if (proPrices.includes(priceId)) return 'pro'
  if (premiumPrices.includes(priceId)) return 'premium'
  return 'free'
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Server misconfigured: missing STRIPE_WEBHOOK_SECRET' }, { status: 500 })
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // lightweight rate limit based on Stripe event ID or IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0'
  const { allowed, headers } = checkRateLimit(`stripe_webhook:${ip}`, 60, 60_000)
  if (!allowed) {
    return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
      status: 429,
      headers,
    })
  }

  const stripe = getStripe()
  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    captureException(err)
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription as string

        if (userId && subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0]?.price.id
          const tier = getTierFromPriceId(priceId || '')

          // Update user's subscription tier
          await supabase
            .from('users')
            .update({ subscription_tier: tier })
            .eq('id', userId)

          // Store subscription in subscriptions table
          const periodStart = 'current_period_start' in subscription 
            ? new Date((subscription.current_period_start as number) * 1000).toISOString()
            : new Date().toISOString()
          const periodEnd = 'current_period_end' in subscription
            ? new Date((subscription.current_period_end as number) * 1000).toISOString()
            : new Date().toISOString()

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const userId = subscription.metadata?.userId
        const priceId = subscription.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId || '')

        if (userId) {
          // Update user's subscription tier
          await supabase
            .from('users')
            .update({ subscription_tier: tier })
            .eq('id', userId)

          // Extract period dates safely
          const subData = subscription as unknown as { current_period_start?: number; current_period_end?: number }
          const periodStart = subData.current_period_start
            ? new Date(subData.current_period_start * 1000).toISOString()
            : new Date().toISOString()
          const periodEnd = subData.current_period_end
            ? new Date(subData.current_period_end * 1000).toISOString()
            : new Date().toISOString()

          // Update subscription record
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
            })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata?.userId

        if (userId) {
          // Downgrade user to free tier
          await supabase
            .from('users')
            .update({ subscription_tier: 'free' })
            .eq('id', userId)

          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const invoiceData = invoice as unknown as { subscription?: string }
        const subscriptionId = invoiceData.subscription

        if (subscriptionId) {
          // Get subscription to find user
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.userId

          if (userId) {
            // Update subscription status
            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('stripe_subscription_id', subscriptionId)
          }
        }
        break
      }

      default:
        // Unhandled event types are silently ignored
        break
    }

    const res = NextResponse.json({ received: true })
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v))
    return res
  } catch (error) {
    captureException(error)
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
