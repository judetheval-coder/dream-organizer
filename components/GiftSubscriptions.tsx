"use client"

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { colors, gradients } from '@/lib/design'
import { Card, Chip, Button } from '@/components/ui/primitives'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import { GIFT_OPTIONS, type GiftDuration } from '@/lib/mock-data'
import { purchaseGiftSubscription } from '@/lib/social'

export default function GiftSubscriptions() {
  const { user } = useUser()
  const userId = user?.id || 'anonymous'

  const [tier, setTier] = useState<'pro' | 'premium'>('pro')
  const [duration, setDuration] = useState<'1_month' | '3_months' | '6_months' | '12_months'>('3_months')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [delivery, setDelivery] = useState<'now' | 'scheduled'>('now')
  const [schedDate, setSchedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ giftCode: string } | null>(null)

  const opt = GIFT_OPTIONS.find(o => o.duration === duration)!
  const base = (tier === 'pro' ? SUBSCRIPTION_TIERS.pro : SUBSCRIPTION_TIERS.premium).price * opt.months
  const savings = base * (opt.discount / 100)
  const total = base - savings

  const inp = { background: colors.background, borderColor: colors.border, color: colors.textPrimary }

  const handlePurchase = async () => {
    if (!email) return
    setLoading(true)
    try {
      const result = await purchaseGiftSubscription(
        userId,
        email,
        tier,
        duration,
        msg,
        delivery === 'scheduled' ? schedDate : undefined
      )
      if (result.success && result.giftCode) {
        setSuccess({ giftCode: result.giftCode })
      } else {
        alert(result.error || 'Failed to purchase gift')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <span className="text-6xl block">🎉</span>
        <h2 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Gift Purchased!</h2>
        <p style={{ color: colors.textSecondary }}>Your gift has been sent to <strong>{email}</strong></p>
        <div className="p-6 rounded-xl" style={{ background: colors.surface, border: `2px solid ${colors.cyan}` }}>
          <p className="text-sm mb-2" style={{ color: colors.textMuted }}>Gift Code</p>
          <p className="text-2xl font-mono font-bold tracking-wider" style={{ color: colors.cyan }}>{success.giftCode}</p>
        </div>
        <p className="text-sm" style={{ color: colors.textMuted }}>The recipient will receive an email with instructions to redeem their gift.</p>
        <Button onClick={() => { setSuccess(null); setEmail(''); setMsg('') }}>Send Another Gift</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <span className="text-5xl mb-4 block">🎁</span>
        <h2 className="text-3xl font-bold" style={{ color: colors.textPrimary }}>Gift a Dream Subscription</h2>
        <p className="text-lg mt-2" style={{ color: colors.textMuted }}>Help someone turn their dreams into beautiful comics</p>
      </div>

      {/* Tier */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>1. Choose a Plan</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[{ key: 'pro', icon: '⭐', price: SUBSCRIPTION_TIERS.pro.price, features: SUBSCRIPTION_TIERS.pro.features, desc: '50 dreams/month • Priority generation' },
            { key: 'premium', icon: '💎', price: SUBSCRIPTION_TIERS.premium.price, features: SUBSCRIPTION_TIERS.premium.features, desc: 'Unlimited dreams • All features' }].map(t => (
            <Card key={t.key} className={tier === t.key ? `ring-2 ring-${t.key === 'pro' ? 'purple' : 'cyan'}-500` : ''} interactive onClick={() => setTier(t.key as 'pro' | 'premium')} style={t.key === 'premium' ? { background: `linear-gradient(135deg, ${colors.purple}20, ${colors.cyan}20)` } : {}}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{t.icon}</span>
                    <h4 className="font-bold text-lg" style={{ color: colors.textPrimary }}>{t.key === 'pro' ? 'Pro' : 'Premium'}</h4>
                    {t.key === 'premium' && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: colors.cyan, color: colors.background }}>BEST VALUE</span>}
                  </div>
                  <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{t.desc}</p>
                </div>
                <p className="text-xl font-bold" style={{ color: t.key === 'pro' ? colors.purple : colors.cyan }}>${t.price}/mo</p>
              </div>
              <ul className="mt-4 space-y-2">
                {t.features.slice(0, 4).map((f, i) => <li key={i} className="text-sm flex items-center gap-2" style={{ color: colors.textSecondary }}><span style={{ color: colors.cyan }}>✓</span> {f}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>2. Choose Duration</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          {GIFT_OPTIONS.map(o => (
            <button key={o.duration} onClick={() => setDuration(o.duration)} className={`p-4 rounded-xl border transition-all relative ${duration === o.duration ? 'ring-2' : ''}`} style={{ background: duration === o.duration ? `${colors.purple}20` : colors.surface, borderColor: duration === o.duration ? colors.purple : colors.border }}>
              {o.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: colors.pink, color: colors.white }}>POPULAR</span>}
              <p className="font-bold" style={{ color: colors.textPrimary }}>{o.label}</p>
              {o.discount > 0 && <p className="text-xs mt-1" style={{ color: colors.cyan }}>Save {o.discount}%</p>}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>3. Recipient Details</h3>
        <Card className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Recipient&apos;s Email *</label>
            <input type="email" placeholder="friend@example.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border outline-none" style={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Personal Message (optional)</label>
            <textarea placeholder="Sweet dreams! I thought you'd love this..." value={msg} onChange={e => setMsg(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border outline-none resize-none" style={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Delivery</label>
            <div className="flex gap-3">
              {(['now', 'scheduled'] as const).map(d => (
                <button key={d} onClick={() => setDelivery(d)} className="flex-1 py-3 rounded-xl font-medium transition-all" style={{ background: delivery === d ? colors.purple : colors.surface, color: delivery === d ? colors.white : colors.textSecondary, border: `1px solid ${delivery === d ? colors.purple : colors.border}` }}>
                  {d === 'now' ? 'Send Now' : 'Schedule'}
                </button>
              ))}
            </div>
            {delivery === 'scheduled' && <input type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full mt-3 px-4 py-3 rounded-xl border outline-none" style={inp} />}
          </div>
        </Card>
      </div>

      {/* Summary */}
      <Card style={{ background: `linear-gradient(135deg, ${colors.purple}10, ${colors.cyan}10)` }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.textPrimary }}>Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span style={{ color: colors.textSecondary }}>{tier === 'pro' ? 'Pro' : 'Premium'} × {opt.label}</span>
            <span style={{ color: colors.textMuted, textDecoration: savings > 0 ? 'line-through' : 'none' }}>${base.toFixed(2)}</span>
          </div>
          {savings > 0 && <div className="flex justify-between"><span style={{ color: colors.cyan }}>Savings ({opt.discount}% off)</span><span style={{ color: colors.cyan }}>-${savings.toFixed(2)}</span></div>}
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: colors.border }}>
            <span className="font-bold" style={{ color: colors.textPrimary }}>Total</span>
            <span className="font-bold text-xl" style={{ color: colors.purple }}>${total.toFixed(2)}</span>
          </div>
        </div>
        <button onClick={handlePurchase} disabled={!email || loading} className="w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50" style={{ background: gradients.button, color: colors.white }}>
          {loading ? '⏳ Processing...' : '🎁 Purchase Gift'}
        </button>
        <p className="text-xs text-center mt-3" style={{ color: colors.textMuted }}>Gift codes never expire. Recipient will receive an email with redemption instructions.</p>
      </Card>
    </div>
  )
}
