'use client'

import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { colors, gradients, shadows } from '@/lib/design'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import Footer from '@/components/Footer'

export default function PricingPage() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen" style={{ background: gradients.page }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'rgba(10, 1, 24, 0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">💭</span>
            <span className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              Dream Organizer
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style={{ background: gradients.button, color: colors.white, boxShadow: shadows.glow }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
                  style={{ color: colors.textPrimary }}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                  style={{ background: gradients.button, color: colors.white, boxShadow: shadows.glow }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1
              className="text-5xl font-bold mb-6"
              style={{
                background: gradients.purpleCyan,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl" style={{ color: colors.textSecondary }}>
              Start free and upgrade as you grow. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {(['free', 'pro', 'premium'] as const).map((tier) => {
              const tierData = SUBSCRIPTION_TIERS[tier]
              const isPopular = tier === 'pro'

              return (
                <div
                  key={tier}
                  className={`relative p-8 rounded-2xl transition-all hover:-translate-y-2 ${isPopular ? 'scale-105 z-10' : ''}`}
                  style={{
                    background: isPopular ? `linear-gradient(145deg, ${colors.surface}, #2a1b3d)` : colors.surface,
                    border: `2px solid ${isPopular ? colors.purple : colors.border}`,
                    boxShadow: isPopular ? `0 0 60px rgba(124, 58, 237, 0.4)` : 'none',
                  }}
                >
                  {isPopular && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 rounded-full text-sm font-bold"
                      style={{ background: colors.purple, color: colors.white }}
                    >
                      ⭐ MOST POPULAR
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                    {tierData.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold" style={{ color: colors.cyan }}>
                      ${tierData.price}
                    </span>
                    <span style={{ color: colors.textMuted }}>/month</span>
                  </div>
                  {tier !== 'free' && (
                    <p className="text-sm mb-6" style={{ color: colors.textMuted }}>
                      Billed monthly. Cancel anytime.
                    </p>
                  )}
                  {tier === 'free' && <div className="h-6 mb-6" />}

                  <ul className="space-y-4 mb-8">
                    {tierData.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="text-lg" style={{ color: colors.cyan }}>✓</span>
                        <span style={{ color: colors.textSecondary }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={isSignedIn ? '/dashboard?tab=Subscription' : '/sign-up'}
                    className="block w-full py-4 rounded-xl font-bold text-center transition-all hover:scale-105"
                    style={{
                      background: isPopular ? gradients.button : 'transparent',
                      color: isPopular ? colors.white : colors.textPrimary,
                      border: isPopular ? 'none' : `2px solid ${colors.border}`,
                      boxShadow: isPopular ? shadows.glow : 'none',
                    }}
                  >
                    {tier === 'free' ? 'Start Free' : `Get ${tierData.name}`}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: colors.textPrimary }}>
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {[
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.',
                },
                {
                  q: 'What happens to my dreams if I downgrade?',
                  a: 'Your existing dreams and panels are always safe. If you downgrade, you keep everything you created but will be limited to the free tier features going forward.',
                },
                {
                  q: 'Is there a refund policy?',
                  a: 'Yes, we offer a 7-day money-back guarantee for new paid subscriptions. Contact support within 7 days for a full refund.',
                },
                {
                  q: 'What AI model do you use?',
                  a: 'We use OpenAI\'s DALL-E 3 for image generation, ensuring high-quality, creative comic panels that capture your dreams.',
                },
                {
                  q: 'Is my dream data private?',
                  a: 'Absolutely. Your dreams are private by default and protected with row-level security. Only you can access your content.',
                },
              ].map((faq, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl"
                  style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
                    {faq.q}
                  </h3>
                  <p style={{ color: colors.textMuted }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <p className="text-lg mb-6" style={{ color: colors.textSecondary }}>
              Still have questions?
            </p>
            <a
              href="mailto:support@dreamorganizer.app"
              className="inline-block px-8 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{ background: colors.surface, color: colors.cyan, border: `1px solid ${colors.cyan}` }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
