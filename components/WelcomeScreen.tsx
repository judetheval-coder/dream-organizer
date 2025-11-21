"use client"

import React from 'react'
import { colors, shadows } from '@/lib/design'

interface Props {
  onGetStarted: () => void
}

export default function WelcomeScreen({ onGetStarted }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8 animate-fadeIn">
        {/* Animated logo */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-32 h-32 rounded-3xl flex items-center justify-center relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
              boxShadow: '0 20px 60px rgba(124, 58, 237, 0.5)',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="text-7xl relative z-10">💭</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="space-y-4">
          <h1 
            className="text-6xl font-bold mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Dream Organizer
          </h1>
          <p className="text-2xl" style={{ color: colors.textSecondary }}>
            Transform your dreams into beautiful comic panels
          </p>
          <p className="text-lg max-w-xl mx-auto" style={{ color: colors.textMuted }}>
            Capture your dreams, visualize them with AI-generated artwork, 
            and create stunning comic-style narratives
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 mt-12">
          {[
            { icon: '🎨', title: 'AI Art', desc: 'DALL-E powered' },
            { icon: '📖', title: 'Comics', desc: '4-panel stories' },
            { icon: '💾', title: 'Save', desc: 'Archive dreams' }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>
                {feature.title}
              </h3>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="px-12 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl mt-8"
          style={{
            background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.purpleLight} 100%)`,
            color: colors.white,
            boxShadow: shadows.glow,
          }}
        >
          Start Creating ✨
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
