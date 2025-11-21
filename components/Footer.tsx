"use client"

import React from 'react'
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-2" style={{ color: colors.textPrimary }}>
              💭 Dream Organizer
            </h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Transform your dreams into visual stories with AI-powered comic generation
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Features
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: colors.textMuted }}>
              <li className="hover:text-cyan transition-colors cursor-pointer">AI Image Generation</li>
              <li className="hover:text-cyan transition-colors cursor-pointer">Comic Panel Creation</li>
              <li className="hover:text-cyan transition-colors cursor-pointer">Dream Archive</li>
              <li className="hover:text-cyan transition-colors cursor-pointer">Scene Splitting</li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Technology
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: colors.textMuted }}>
              <li>⚡ Next.js 16</li>
              <li>🎨 DALL-E 2</li>
              <li>💾 LocalStorage</li>
              <li>🎯 TypeScript</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div 
          className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: colors.border }}
        >
          <p className="text-sm" style={{ color: colors.textMuted }}>
            © {currentYear} Dream Organizer. Made with 💜 by creators for dreamers.
          </p>
          <div className="flex gap-6 text-sm" style={{ color: colors.textMuted }}>
            <a href="#" className="hover:text-cyan transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan transition-colors">About</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
