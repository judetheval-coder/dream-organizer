"use client"

import { useState, useEffect } from 'react'
import { colors } from '@/lib/design'

interface OnboardingTourProps {
    onComplete: () => void
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const [dismissed, setDismissed] = useState(false)

    const handleDismiss = () => {
        localStorage.setItem('onboarding-complete', 'true')
        setDismissed(true)
        onComplete()
    }

    if (dismissed) return null

    return (
        <div
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm p-5 rounded-2xl shadow-2xl animate-slideUp"
            style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.backgroundDark} 100%)`,
                border: `2px solid ${colors.purple}`,
            }}
        >
            {/* Close button */}
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-lg hover:opacity-70 transition-opacity"
                style={{ color: colors.textMuted }}
                aria-label="Dismiss"
            >
                ✕
            </button>

            {/* Content */}
            <div className="flex items-start gap-4">
                <div className="text-4xl">👋</div>
                <div className="flex-1">
                    <h3
                        className="text-lg font-bold mb-1"
                        style={{ color: colors.textPrimary }}
                    >
                        Welcome to Dream Organizer!
                    </h3>
                    <p
                        className="text-sm mb-3"
                        style={{ color: colors.textSecondary }}
                    >
                        Record your dreams and watch them transform into beautiful comic panels.
                    </p>

                    {/* Quick tips */}
                    <div className="space-y-1.5 text-xs" style={{ color: colors.textMuted }}>
                        <p>💡 Click <strong style={{ color: colors.cyan }}>✨ New Dream</strong> to get started</p>
                        <p>💡 Press <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>?</kbd> for keyboard shortcuts</p>
                    </div>
                </div>
            </div>

            {/* Got it button */}
            <button
                onClick={handleDismiss}
                className="w-full mt-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{
                    background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                    color: 'white',
                }}
            >
                Got it! 🚀
            </button>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

// Hook to manage onboarding state
export function useOnboardingTour() {
    const [showTour, setShowTour] = useState(false)
    const [hasCompletedTour, setHasCompletedTour] = useState(true) // Default true to prevent flash

    useEffect(() => {
        const completed = localStorage.getItem('onboarding-complete')
        const hasVisited = localStorage.getItem('has-visited')

        // Show tour only if user just completed welcome screen but hasn't done tour
        if (hasVisited && !completed) {
            setShowTour(true)
            setHasCompletedTour(false)
        } else {
            setHasCompletedTour(!!completed)
        }
    }, [])

    const completeTour = () => {
        localStorage.setItem('onboarding-complete', 'true')
        setShowTour(false)
        setHasCompletedTour(true)
    }

    const resetTour = () => {
        localStorage.removeItem('onboarding-complete')
        setShowTour(true)
        setHasCompletedTour(false)
    }

    const startTour = () => {
        // Remove the completed flag so it shows again
        localStorage.removeItem('onboarding-complete')
        setShowTour(true)
        setHasCompletedTour(false)
    }

    return {
        showTour,
        hasCompletedTour,
        completeTour,
        resetTour,
        startTour,
    }
}

export default OnboardingTour
