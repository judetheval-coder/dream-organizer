"use client"

import React, { useState, useEffect } from 'react'
import { colors, shadows } from '@/lib/design'

interface Props {
  onGetStarted: () => void
}

const FEATURES = [
  {
    icon: '✍️',
    title: 'Record Dreams',
    desc: 'Capture every detail',
    color: colors.purple
  },
  {
    icon: '🎨',
    title: 'AI Comics',
    desc: 'DALL-E transforms words to art',
    color: colors.cyan
  },
  {
    icon: '📖',
    title: 'Visual Stories',
    desc: 'Multi-panel narratives',
    color: colors.pink
  },
  {
    icon: '🧠',
    title: 'Insights',
    desc: 'Discover dream patterns',
    color: colors.purple
  },
]

const DREAM_PROMPTS = [
  "I was flying over an ancient city made of crystal...",
  "A talking fox led me through a forest of stars...",
  "I discovered a door at the bottom of the ocean...",
  "The moon fell into my hands like a snow globe...",
]

export default function WelcomeScreen({ onGetStarted }: Props) {
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  // Typewriter effect for dream prompts
  useEffect(() => {
    const prompt = DREAM_PROMPTS[currentPrompt]
    let charIndex = 0
    setTypedText('')
    setIsTyping(true)

    const typeInterval = setInterval(() => {
      if (charIndex < prompt.length) {
        setTypedText(prompt.slice(0, charIndex + 1))
        charIndex++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
        // Move to next prompt after pause
        setTimeout(() => {
          setCurrentPrompt((prev) => (prev + 1) % DREAM_PROMPTS.length)
        }, 3000)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [currentPrompt])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Floating dream particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? colors.purple : colors.cyan,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-3xl w-full text-center space-y-8 animate-fadeIn relative z-10">
        {/* Main logo with glow effect */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                boxShadow: `0 0 60px ${colors.purple}60, 0 20px 40px rgba(0,0,0,0.3)`,
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="text-6xl sm:text-7xl relative z-10">🌙</span>
            </div>
            {/* Orbiting stars */}
            <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '20s' }}>
              <span className="absolute -top-2 left-1/2 text-xl">✨</span>
              <span className="absolute top-1/2 -right-2 text-lg">💫</span>
              <span className="absolute -bottom-2 left-1/2 text-xl">⭐</span>
            </div>
          </div>
        </div>

        {/* Brand name with gradient */}
        <div className="space-y-3">
          <h1
            className="text-5xl sm:text-7xl font-bold"
            style={{
              background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 50%, ${colors.pink} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: `0 0 80px ${colors.purple}40`,
            }}
          >
            Visnoctis
          </h1>
          <p className="text-xl sm:text-2xl italic" style={{ color: colors.purple }}>
            "Vision of the Night"
          </p>
        </div>

        {/* Tagline */}
        <p className="text-lg sm:text-xl max-w-xl mx-auto leading-relaxed" style={{ color: colors.textSecondary }}>
          Transform your dreams into stunning comic panels with AI.
          <span style={{ color: colors.cyan }}> Every night tells a story</span> — let us help you see it.
        </p>

        {/* Demo typewriter */}
        <div
          className="max-w-lg mx-auto p-4 rounded-xl relative"
          style={{
            background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.backgroundDark} 100%)`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm" style={{ color: colors.textMuted }}>💭 Example dream:</span>
          </div>
          <p className="text-left text-base italic min-h-[48px]" style={{ color: colors.textPrimary }}>
            {typedText}
            {isTyping && <span className="animate-blink" style={{ color: colors.cyan }}>|</span>}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="p-4 sm:p-5 rounded-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                className="text-3xl sm:text-4xl mb-2 transition-transform group-hover:scale-110"
                style={{ filter: `drop-shadow(0 0 8px ${feature.color}40)` }}
              >
                {feature.icon}
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1" style={{ color: colors.textPrimary }}>
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: colors.textMuted }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <button
            onClick={onGetStarted}
            className="group px-10 sm:px-14 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all hover:scale-105 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
              color: colors.white,
              boxShadow: `0 0 40px ${colors.purple}50, 0 10px 30px rgba(0,0,0,0.3)`,
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Begin Your Journey
              <span className="text-2xl group-hover:translate-x-1 transition-transform">✨</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <p className="text-sm mt-4" style={{ color: colors.textMuted }}>
            Free to start • No credit card required
          </p>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 pt-4" style={{ color: colors.textMuted }}>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-sm">4.9/5</span>
          </div>
          <span className="text-xs">•</span>
          <span className="text-sm">1,000+ dreamers</span>
          <span className="text-xs">•</span>
          <span className="text-sm">50K+ dreams created</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
