import { useState } from 'react'
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/subscription-tiers'
import { analytics } from '@/lib/analytics'

interface UpgradePromptProps {
  currentTier: SubscriptionTier
  onClose: () => void
}

export default function UpgradePrompt({ currentTier, onClose }: UpgradePromptProps) {
  const tiers: SubscriptionTier[] = ['free', 'pro', 'premium']
  const [loading, setLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === 'free') return

    setLoading(tier)
    try {
      const priceKey = tier === 'pro'
        ? (billingPeriod === 'monthly' ? 'pro_monthly' : 'pro_yearly')
        : (billingPeriod === 'monthly' ? 'premium_monthly' : 'premium_yearly')

      analytics.track('checkout_started', { plan: tier, billingPeriod })
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceKey }),
      })

      const data = await response.json()

      if (data.url) {
        analytics.track('checkout_redirect', { plan: tier })
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setCheckoutError('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-8 max-w-5xl w-full border border-purple-500/30 shadow-2xl"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Upgrade Your Plan
            </h2>
            <p className="text-gray-300 mt-2">Unlock more dreams and premium features</p>
            {checkoutError && (
              <p className="text-red-400 text-sm mt-2">{checkoutError}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/30 rounded-full p-1 flex gap-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${billingPeriod === 'monthly'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${billingPeriod === 'yearly'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Yearly <span className="text-cyan-400 text-xs">Save 17%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const tierData = SUBSCRIPTION_TIERS[tier]
            const isCurrent = tier === currentTier

            return (
              <div
                key={tier}
                className={`
                  rounded-xl p-6 border-2 transition-all
                  ${isCurrent
                    ? 'border-cyan-400 bg-cyan-400/10 scale-105'
                    : 'border-purple-500/30 bg-black/20 hover:border-purple-400/50'
                  }
                `}
              >
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {tierData.name}
                  </h3>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    ${billingPeriod === 'yearly' && tier !== 'free'
                      ? (tierData.price * 10).toFixed(0)
                      : tierData.price}
                    <span className="text-sm text-gray-400">
                      /{billingPeriod === 'yearly' ? 'year' : 'mo'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && tier !== 'free' && (
                    <p className="text-xs text-cyan-400 mt-1">
                      (${(tierData.price * 10 / 12).toFixed(2)}/mo)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {tierData.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-300">
                      <svg className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/30"
                  >
                    Current Plan
                  </button>
                ) : tier === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-lg bg-gray-600/20 text-gray-400 font-semibold"
                  >
                    Downgrade
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(tier)}
                    disabled={loading === tier}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
                  >
                    {loading === tier ? 'Loading...' : `Upgrade to ${tierData.name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          All plans include secure cloud storage and AI-powered dream analysis
        </p>
      </div>
    </div>
  )
}
