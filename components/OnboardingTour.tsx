"use client"

import { useState, useEffect } from 'react'
import { colors } from '@/lib/design'

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to Dream Organizer! 👋',
        description: 'Let\'s take a quick tour of the features. This will only take a minute!',
        target: null, // No specific element to highlight
        position: 'center',
    },
    {
        id: 'create-dream',
        title: 'Create Your First Dream 💭',
        description: 'Click the "+ New Dream" button to start recording your dreams. Describe what happened, and we\'ll turn it into a comic!',
        target: '[data-tour="new-dream"]',
        position: 'bottom',
    },
    {
        id: 'tabs',
        title: 'Navigate with Tabs 📑',
        description: 'Use the sidebar tabs to switch between Dashboard, My Dreams, Comics gallery, and more.',
        target: '[data-tour="sidebar"]',
        position: 'right',
    },
    {
        id: 'my-dreams',
        title: 'View Your Dreams 📚',
        description: 'All your dreams are saved in "My Dreams". You can search, filter, and manage them here.',
        target: '[data-tour="my-dreams"]',
        position: 'right',
    },
    {
        id: 'comics',
        title: 'See Your Comics 🎨',
        description: 'Check out your generated comic panels in the Comics tab. Each dream becomes a beautiful story!',
        target: '[data-tour="comics"]',
        position: 'right',
    },
    {
        id: 'keyboard',
        title: 'Keyboard Shortcuts ⌨️',
        description: 'Press "?" anytime to see keyboard shortcuts. Use "N" to quickly create a new dream!',
        target: null,
        position: 'center',
    },
    {
        id: 'complete',
        title: 'You\'re Ready! 🚀',
        description: 'That\'s it! Start by recording your first dream. We can\'t wait to see what you create!',
        target: null,
        position: 'center',
    },
]

interface OnboardingTourProps {
    onComplete: () => void
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    const step = TOUR_STEPS[currentStep]
    const isLast = currentStep === TOUR_STEPS.length - 1
    const isFirst = currentStep === 0

    useEffect(() => {
        // Highlight target element if exists
        if (step.target) {
            const element = document.querySelector(step.target)
            if (element) {
                element.classList.add('tour-highlight')
                return () => element.classList.remove('tour-highlight')
            }
        }
    }, [step.target])

    const handleNext = () => {
        if (isLast) {
            handleComplete()
        } else {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirst) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = () => {
        handleComplete()
    }

    const handleComplete = () => {
        localStorage.setItem('onboarding-complete', 'true')
        setIsVisible(false)
        onComplete()
    }

    if (!isVisible) return null

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 bg-black/70" />

            {/* Tour Card */}
            <div
                className="fixed z-50 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-fadeIn"
                style={{
                    background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.backgroundDark} 100%)`,
                    border: `2px solid ${colors.purple}`,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {/* Progress */}
                <div className="flex gap-1 mb-4">
                    {TOUR_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all"
                            style={{
                                background: i <= currentStep ? colors.cyan : colors.border
                            }}
                        />
                    ))}
                </div>

                {/* Step indicator */}
                <p className="text-xs mb-2" style={{ color: colors.textMuted }}>
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                </p>

                {/* Content */}
                <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.textPrimary }}
                >
                    {step.title}
                </h3>
                <p
                    className="text-base mb-6"
                    style={{ color: colors.textSecondary }}
                >
                    {step.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleSkip}
                        className="text-sm hover:underline"
                        style={{ color: colors.textMuted }}
                    >
                        Skip tour
                    </button>

                    <div className="flex gap-2">
                        {!isFirst && (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/10"
                                style={{
                                    color: colors.textPrimary,
                                    border: `1px solid ${colors.border}`
                                }}
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                            style={{
                                background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                                color: 'white',
                            }}
                        >
                            {isLast ? 'Get Started! 🎉' : 'Next →'}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS for highlighting elements */}
            <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px ${colors.cyan}, 0 0 20px ${colors.cyan}40;
          border-radius: 12px;
        }
      `}</style>
        </>
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

    return {
        showTour,
        hasCompletedTour,
        completeTour,
        resetTour,
        startTour: () => setShowTour(true),
    }
}

export default OnboardingTour
