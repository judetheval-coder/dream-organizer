'use client'

import { useState } from 'react'
import { colors, gradients } from '@/lib/design'
import FeedbackForm from '@/components/FeedbackForm'

const FAQ = [
  {
    q: 'How does the AI generate comic panels?',
    a: 'We use OpenAI\'s DALL-E to transform your dream descriptions into stunning visual artwork. Each scene in your dream becomes a unique comic panel.'
  },
  {
    q: 'Can I edit my dreams after creating them?',
    a: 'Yes! Go to "My Dreams" in the dashboard, find your dream, and you can delete dreams you no longer want. Full editing is coming soon.'
  },
  {
    q: 'What\'s the difference between Free and Pro plans?',
    a: 'Free users get 3 dreams per month. Pro users get 50 dreams/month with priority generation. Premium users get unlimited dreams and all features.'
  },
  {
    q: 'How do I share my dreams publicly?',
    a: 'In "My Dreams", click the "Publish" button on any dream to share it in the public Gallery where others can see and react to it.'
  },
  {
    q: 'Are my dreams private by default?',
    a: 'Yes! All dreams are private until you explicitly choose to publish them to the Gallery.'
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel anytime from the Settings tab, and you\'ll keep access until the end of your billing period.'
  },
]

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'contact' | 'faq'>('contact')

  return (
    <main
      className="min-h-screen py-16 px-4"
      style={{ background: gradients.page }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Get in Touch
          </h1>
          <p className="text-lg" style={{ color: colors.textSecondary }}>
            We&apos;d love to hear from you! Questions, feedback, or just want to say hi?
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'contact'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
          >
            ✉️ Contact Us
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'faq'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
          >
            ❓ FAQ
          </button>
        </div>

        {activeTab === 'contact' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div
              className="rounded-2xl p-8"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(124, 58, 237, 0.2)' }}>
                    📧
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>Email</h3>
                    <a
                      href="mailto:support@lucidlaboratories.net"
                      className="hover:underline"
                      style={{ color: colors.cyan }}
                    >
                      support@lucidlaboratories.net
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(6, 182, 212, 0.2)' }}>
                    ⏰
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>Response Time</h3>
                    <p style={{ color: colors.textSecondary }}>We typically respond within 24-48 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(236, 72, 153, 0.2)' }}>
                    💡
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>Feature Requests</h3>
                    <p style={{ color: colors.textSecondary }}>We love hearing your ideas! Use the feedback form to suggest new features.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Form */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div className="p-6 border-b" style={{ borderColor: colors.border }}>
                <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                  Send us a Message
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                  Fill out the form below and we&apos;ll get back to you
                </p>
              </div>
              <FeedbackForm />
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div
            className="rounded-2xl p-8"
            style={{ background: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.textPrimary }}>
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold" style={{ color: colors.textPrimary }}>
                      {item.q}
                    </span>
                    <span
                      className="text-xl transition-transform"
                      style={{
                        transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: colors.cyan
                      }}
                    >
                      ▼
                    </span>
                  </button>
                  {openFaq === i && (
                    <div
                      className="px-4 pb-4 animate-fadeIn"
                      style={{ color: colors.textSecondary }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: colors.surface,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </main>
  )
}