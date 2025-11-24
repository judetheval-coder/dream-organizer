"use client"

import { useState } from 'react'
import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'

type GiftDuration = '1_month' | '3_months' | '6_months' | '1_year'

interface GiftOption {
  duration: GiftDuration
  label: string
  months: number
  discount: number  // percentage discount
  popular?: boolean
}

const GIFT_OPTIONS: GiftOption[] = [
  { duration: '1_month', label: '1 Month', months: 1, discount: 0 },
  { duration: '3_months', label: '3 Months', months: 3, discount: 10 },
  { duration: '6_months', label: '6 Months', months: 6, discount: 15, popular: true },
  { duration: '1_year', label: '1 Year', months: 12, discount: 20 },
]

interface GiftSubscriptionsProps {
  onPurchase?: (tier: string, duration: GiftDuration, recipientEmail: string, message: string) => void
}

export default function GiftSubscriptions({ onPurchase }: GiftSubscriptionsProps) {
  const [selectedTier, setSelectedTier] = useState<'pro' | 'premium'>('pro')
  const [selectedDuration, setSelectedDuration] = useState<GiftDuration>('3_months')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [personalMessage, setPersonalMessage] = useState('')
  const [deliveryDate, setDeliveryDate] = useState<'now' | 'scheduled'>('now')
  const [scheduledDate, setScheduledDate] = useState('')

  // Get price based on tier and duration
  const getPrice = () => {
    const tier = selectedTier === 'pro' ? SUBSCRIPTION_TIERS.pro : SUBSCRIPTION_TIERS.premium
    const option = GIFT_OPTIONS.find(o => o.duration === selectedDuration)!
    const basePrice = tier.price * option.months
    const discountAmount = basePrice * (option.discount / 100)
    return {
      original: basePrice,
      discounted: basePrice - discountAmount,
      savings: discountAmount,
    }
  }

  const price = getPrice()
  const selectedOption = GIFT_OPTIONS.find(o => o.duration === selectedDuration)!

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <span className="text-5xl mb-4 block">🎁</span>
        <h2 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Gift a Dream Subscription
        </h2>
        <p className="text-lg mt-2" style={{ color: colors.textMuted }}>
          Help someone turn their dreams into beautiful comics
        </p>
      </div>

      {/* Tier Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          1. Choose a Plan
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pro Tier */}
          <Card 
            className={`${selectedTier === 'pro' ? 'ring-2 ring-purple-500' : ''}`}
            interactive
            onClick={() => setSelectedTier('pro')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <h4 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                    Pro
                  </h4>
                </div>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                  50 dreams/month • Priority generation
                </p>
              </div>
              <p className="text-xl font-bold" style={{ color: colors.purple }}>
                ${SUBSCRIPTION_TIERS.pro.price}/mo
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {SUBSCRIPTION_TIERS.pro.features.slice(0, 4).map((feature, i) => (
                <li key={i} className="text-sm flex items-center gap-2" style={{ color: colors.textSecondary }}>
                  <span style={{ color: colors.cyan }}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </Card>

          {/* Premium Tier */}
          <Card 
            className={`${selectedTier === 'premium' ? 'ring-2 ring-cyan-500' : ''}`}
            style={{ 
              background: `linear-gradient(135deg, ${colors.purple}20, ${colors.cyan}20)`,
            }}
            interactive
            onClick={() => setSelectedTier('premium')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💎</span>
                  <h4 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                    Premium
                  </h4>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: colors.cyan, color: colors.background }}
                  >
                    BEST VALUE
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                  Unlimited dreams • All features
                </p>
              </div>
              <p className="text-xl font-bold" style={{ color: colors.cyan }}>
                ${SUBSCRIPTION_TIERS.premium.price}/mo
              </p>
            </div>
            <ul className="mt-4 space-y-2">
              {SUBSCRIPTION_TIERS.premium.features.slice(0, 4).map((feature, i) => (
                <li key={i} className="text-sm flex items-center gap-2" style={{ color: colors.textSecondary }}>
                  <span style={{ color: colors.cyan }}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {/* Duration Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          2. Choose Duration
        </h3>
        <div className="grid gap-3 sm:grid-cols-4">
          {GIFT_OPTIONS.map(option => (
            <button
              key={option.duration}
              onClick={() => setSelectedDuration(option.duration)}
              className={`p-4 rounded-xl border transition-all relative ${selectedDuration === option.duration ? 'ring-2' : ''}`}
              style={{
                background: selectedDuration === option.duration ? `${colors.purple}20` : colors.surface,
                borderColor: selectedDuration === option.duration ? colors.purple : colors.border,
                ...(selectedDuration === option.duration && { ringColor: colors.purple }),
              }}
            >
              {option.popular && (
                <span 
                  className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: colors.pink, color: colors.white }}
                >
                  POPULAR
                </span>
              )}
              <p className="font-bold" style={{ color: colors.textPrimary }}>{option.label}</p>
              {option.discount > 0 && (
                <p className="text-xs mt-1" style={{ color: colors.cyan }}>
                  Save {option.discount}%
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          3. Recipient Details
        </h3>
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Recipient&apos;s Email *
            </label>
            <input
              type="email"
              placeholder="friend@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2"
              style={{
                background: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Personal Message (optional)
            </label>
            <textarea
              placeholder="Sweet dreams! I thought you'd love this..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all focus:ring-2 resize-none"
              style={{
                background: colors.background,
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Delivery
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setDeliveryDate('now')}
                className="flex-1 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: deliveryDate === 'now' ? colors.purple : colors.surface,
                  color: deliveryDate === 'now' ? colors.white : colors.textSecondary,
                  border: `1px solid ${deliveryDate === 'now' ? colors.purple : colors.border}`,
                }}
              >
                Send Now
              </button>
              <button
                onClick={() => setDeliveryDate('scheduled')}
                className="flex-1 py-3 rounded-xl font-medium transition-all"
                style={{
                  background: deliveryDate === 'scheduled' ? colors.purple : colors.surface,
                  color: deliveryDate === 'scheduled' ? colors.white : colors.textSecondary,
                  border: `1px solid ${deliveryDate === 'scheduled' ? colors.purple : colors.border}`,
                }}
              >
                Schedule
              </button>
            </div>
            {deliveryDate === 'scheduled' && (
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full mt-3 px-4 py-3 rounded-xl border outline-none"
                style={{
                  background: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Order Summary */}
      <Card style={{ background: `linear-gradient(135deg, ${colors.purple}10, ${colors.cyan}10)` }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span style={{ color: colors.textSecondary }}>
              {selectedTier === 'pro' ? 'Pro' : 'Unlimited'} × {selectedOption.label}
            </span>
            <span style={{ color: colors.textMuted, textDecoration: price.savings > 0 ? 'line-through' : 'none' }}>
              ${price.original.toFixed(2)}
            </span>
          </div>
          {price.savings > 0 && (
            <div className="flex justify-between">
              <span style={{ color: colors.cyan }}>Savings ({selectedOption.discount}% off)</span>
              <span style={{ color: colors.cyan }}>-${price.savings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: colors.border }}>
            <span className="font-bold" style={{ color: colors.textPrimary }}>Total</span>
            <span className="font-bold text-xl" style={{ color: colors.purple }}>
              ${price.discounted.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={() => onPurchase?.(selectedTier, selectedDuration, recipientEmail, personalMessage)}
          disabled={!recipientEmail}
          className="w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          style={{
            background: gradients.button,
            color: colors.white,
          }}
        >
          🎁 Purchase Gift
        </button>

        <p className="text-xs text-center mt-3" style={{ color: colors.textMuted }}>
          Gift codes never expire. Recipient will receive an email with redemption instructions.
        </p>
      </Card>
    </div>
  )
}
