'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { colors, gradients, shadows } from '@/lib/design'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-tiers'
import Footer from '@/components/Footer'
import { CookieConsent } from '@/components/CookieConsent'

const FEATURES = [
  {
    icon: '💭',
    title: 'Dream Journaling',
    description: 'Record your dreams with rich detail and watch them come to life',
  },
  {
    icon: '🎨',
    title: 'AI Comic Generation',
    description: 'DALL-E powered art transforms your dreams into stunning comic panels',
  },
  {
    icon: '📖',
    title: 'Multi-Panel Stories',
    description: 'Automatically split your dream into scenes for a complete narrative',
  },
  {
    icon: '✨',
    title: 'Style Customization',
    description: 'Choose from Anime, Watercolor, Oil Painting, and more art styles',
  },
  {
    icon: '🧠',
    title: 'Dream Insights',
    description: 'AI-powered analysis reveals patterns and themes in your dreams',
  },
  {
    icon: '💾',
    title: 'Cloud Storage',
    description: 'Your dreams are safely stored and accessible from any device',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Artist',
    text: 'Finally a way to visualize my dreams! The AI captures the surreal quality perfectly.',
    avatar: '👩‍🎨',
  },
  {
    name: 'James K.',
    role: 'Writer',
    text: 'I use Dream Organizer for story inspiration. The comics help me remember dream details.',
    avatar: '✍️',
  },
  {
    name: 'Luna R.',
    role: 'Dream Enthusiast',
    text: 'Beautiful interface and the AI art quality is incredible. Worth every penny!',
    avatar: '🌙',
  },
]

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: colors.textSecondary }}>
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: colors.textSecondary }}>
              Pricing
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: colors.textSecondary }}>
              Reviews
            </a>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-4">
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
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            style={{ color: colors.textPrimary }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden mt-4 py-4 rounded-xl"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <div className="flex flex-col gap-2 px-4">
              <a 
                href="#features" 
                className="py-2 px-4 rounded-lg hover:bg-white/5"
                style={{ color: colors.textSecondary }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="py-2 px-4 rounded-lg hover:bg-white/5"
                style={{ color: colors.textSecondary }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#testimonials" 
                className="py-2 px-4 rounded-lg hover:bg-white/5"
                style={{ color: colors.textSecondary }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Reviews
              </a>
              <div className="border-t my-2" style={{ borderColor: colors.border }} />
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="py-2 px-4 rounded-lg text-center font-semibold"
                  style={{ background: gradients.button, color: colors.white }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="py-2 px-4 rounded-lg text-center"
                    style={{ color: colors.textPrimary }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="py-2 px-4 rounded-lg text-center font-semibold"
                    style={{ background: gradients.button, color: colors.white }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center animate-bounce"
              style={{
                background: gradients.purpleCyan,
                boxShadow: '0 20px 60px rgba(124, 58, 237, 0.4)',
              }}
            >
              <span className="text-5xl">💭</span>
            </div>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{
              background: gradients.purpleCyan,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Turn Your Dreams Into
            <br />
            Beautiful Comics
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: colors.textSecondary }}>
            AI-powered dream journaling that transforms your nightly adventures into stunning visual stories. 
            Record, visualize, and share your dreams like never before.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href={isSignedIn ? '/dashboard' : '/sign-up'}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: gradients.button, color: colors.white, boxShadow: shadows.glow }}
            >
              Start Creating Free ✨
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
              style={{ background: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
            >
              See How It Works
            </a>
          </div>

          {/* Demo Image Placeholder */}
          <div
            className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden"
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div className="aspect-video flex items-center justify-center p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {['🌙', '🏰', '🐉', '✨'].map((emoji, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl flex items-center justify-center text-4xl"
                    style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Example: &quot;I was flying over a castle with dragons&quot; → 4 AI-generated panels
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Everything You Need to Capture Dreams
            </h2>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
              Powerful features that make dream journaling magical
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
                  {feature.title}
                </h3>
                <p style={{ color: colors.textMuted }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {(['free', 'pro', 'premium'] as const).map((tier) => {
              const tierData = SUBSCRIPTION_TIERS[tier]
              const isPopular = tier === 'pro'

              return (
                <div
                  key={tier}
                  className={`relative p-8 rounded-2xl transition-all hover:-translate-y-1 ${isPopular ? 'scale-105 z-10' : ''}`}
                  style={{
                    background: isPopular ? `linear-gradient(145deg, ${colors.surface}, #2a1b3d)` : colors.surface,
                    border: `2px solid ${isPopular ? colors.purple : colors.border}`,
                    boxShadow: isPopular ? `0 0 40px rgba(124, 58, 237, 0.3)` : 'none',
                  }}
                >
                  {isPopular && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                      style={{ background: colors.purple, color: colors.white }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                    {tierData.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: colors.cyan }}>
                      ${tierData.price}
                    </span>
                    <span style={{ color: colors.textMuted }}>/month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tierData.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span style={{ color: colors.cyan }}>✓</span>
                        <span style={{ color: colors.textSecondary }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={isSignedIn ? '/dashboard?tab=Subscription' : '/sign-up'}
                    className="block w-full py-3 rounded-lg font-semibold text-center transition-all hover:scale-105"
                    style={{
                      background: isPopular ? gradients.button : 'transparent',
                      color: isPopular ? colors.white : colors.textPrimary,
                      border: isPopular ? 'none' : `1px solid ${colors.border}`,
                    }}
                  >
                    {tier === 'free' ? 'Get Started' : 'Upgrade Now'}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.textPrimary }}>
              Loved by Dreamers
            </h2>
            <p className="text-lg" style={{ color: colors.textSecondary }}>
              See what our users are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl"
                style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: colors.backgroundDark }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: colors.textPrimary }}>
                      {testimonial.name}
                    </p>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p style={{ color: colors.textSecondary }}>&ldquo;{testimonial.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: colors.textPrimary }}>
            Ready to Visualize Your Dreams?
          </h2>
          <p className="text-xl mb-8" style={{ color: colors.textSecondary }}>
            Join thousands of dreamers who are turning their nightly adventures into art.
          </p>
          <Link
            href={isSignedIn ? '/dashboard' : '/sign-up'}
            className="inline-block px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl"
            style={{ background: gradients.button, color: colors.white, boxShadow: shadows.glow }}
          >
            Start Free Today 🚀
          </Link>
        </div>
      </section>

      <Footer />
      <CookieConsent />
    </div>
  )
}







