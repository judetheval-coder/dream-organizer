"use client"

import React from 'react'
import Link from 'next/link'
import { colors } from '@/lib/design'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer 
      className="mt-auto py-8 px-8 border-t"
      style={{
        background: colors.backgroundDark,
        borderColor: colors.border,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2" style={{ color: colors.textPrimary }}>
              💭 The Dream Machine
            </h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Transform your dreams into visual stories with AI-powered comic generation
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Features
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: colors.textMuted }}>
              <li>🎨 AI Image Generation</li>
              <li>📖 Comic Panel Creation</li>
              <li>💾 Dream Archive</li>
              <li>✨ Dream Insights</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pricing" className="hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Built With
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: colors.textMuted }}>
              <li>⚡ Next.js 16</li>
              <li>🤖 DALL-E 3</li>
              <li>🔐 Clerk Auth</li>
              <li>💳 Stripe</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div 
          className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: colors.border }}
        >
          <p className="text-sm" style={{ color: colors.textMuted }}>
            © {currentYear} The Dream Machine. Made with 💜 for dreamers everywhere.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>
              Privacy
            </Link>
            <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>
              Terms
            </Link>
            <a 
              href="mailto:support@dreamorganizer.app" 
              className="hover:opacity-80 transition-opacity" 
              style={{ color: colors.textMuted }}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
