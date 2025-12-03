"use client"

import { useState, useEffect, useCallback } from 'react'
import { colors } from '@/lib/design'

interface OnboardingStep {
    id: string
    title: string
    description: string
    emoji: string
    highlight?: string // CSS selector to highlight
    position?: 'center' | 'bottom-right' | 'top-center' | 'bottom-center'
    action?: string // What the user should do
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Visnoctis! 🌙',
        description: 'Your journey into the world of dream visualization begins here. Let\'s take a quick tour to get you started.',
        emoji: '✨',
        position: 'center',
    },
    {
        id: 'explain-concept',
        title: 'How It Works',
        description: 'Write down your dream, and our AI transforms it into beautiful comic panels. Each scene from your dream becomes a stunning visual story.',
        emoji: '🎨',
        position: 'center',
    },
    {
        id: 'new-dream-button',
        title: 'Create Your First Dream',
        description: 'Click the "✨ New Dream" button to start recording your first dream. This opens the dream creation modal.',
        emoji: '💭',
        highlight: '[data-onboarding="new-dream-btn"]',
        position: 'bottom-center',
        action: 'Click "New Dream" to continue',
    },
    {
        id: 'dream-text',
        title: 'Describe Your Dream',
        description: 'Write what happened in your dream. Be descriptive! The more detail you add, the better the AI can visualize it.',
        emoji: '✍️',
        highlight: '[data-onboarding="dream-textarea"]',
        position: 'bottom-center',
        action: 'Type your dream description',
    },
    {
        id: 'style-mood',
        title: 'Choose Your Style',
        description: 'Pick an art style and mood that matches your dream. Anime, Watercolor, Dark Fantasy — it\'s your vision!',
        emoji: '🎭',
        highlight: '[data-onboarding="style-selector"]',
        position: 'bottom-center',
    },
    {
        id: 'generate',
        title: 'Generate Your Comic',
        description: 'Hit "Create Dream" and watch as AI transforms your words into comic panels. Each scene becomes a unique artwork!',
        emoji: '🚀',
        highlight: '[data-onboarding="create-btn"]',
        position: 'bottom-center',
        action: 'Click "Create Dream" when ready',
    },
    {
        id: 'panels',
        title: 'Your Dream Comics',
        description: 'Your dream is now split into panels! Click "Generate" on each panel to create the AI artwork, or they\'ll generate automatically.',
        emoji: '📖',
        position: 'center',
    },
    {
        id: 'features',
        title: 'Explore More Features',
        description: 'Check out Insights for dream analysis, share your comics, track your dream streak, and earn achievements!',
        emoji: '🏆',
        position: 'center',
    },
    {
        id: 'complete',
        title: 'You\'re All Set!',
        description: 'You\'re ready to turn your dreams into art. Sweet dreams, and happy creating! 🌙',
        emoji: '🎉',
        position: 'center',
    },
]

interface OnboardingTourProps {
    onComplete: () => void
    currentStep?: number
    onStepChange?: (step: number) => void
}

export function OnboardingTour({ onComplete, currentStep: externalStep, onStepChange }: OnboardingTourProps) {
    const [internalStep, setInternalStep] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

    const currentStep = externalStep ?? internalStep
    const step = ONBOARDING_STEPS[currentStep]

    // Update highlight position when step changes
    useEffect(() => {
        if (step?.highlight) {
            const el = document.querySelector(step.highlight)
            if (el) {
                const rect = el.getBoundingClientRect()
                setHighlightRect(rect)
                // Scroll element into view if needed
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                setHighlightRect(null)
            }
        } else {
            setHighlightRect(null)
        }
    }, [currentStep, step?.highlight])

    // Listen for window resize to update highlight
    useEffect(() => {
        const handleResize = () => {
            if (step?.highlight) {
                const el = document.querySelector(step.highlight)
                if (el) {
                    setHighlightRect(el.getBoundingClientRect())
                }
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [step?.highlight])

    const nextStep = useCallback(() => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            const next = currentStep + 1
            if (onStepChange) onStepChange(next)
            else setInternalStep(next)
        } else {
            handleComplete()
        }
    }, [currentStep, onStepChange])

    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            const prev = currentStep - 1
            if (onStepChange) onStepChange(prev)
            else setInternalStep(prev)
        }
    }, [currentStep, onStepChange])

    const handleComplete = () => {
        localStorage.setItem('onboarding-complete', 'true')
        localStorage.setItem('onboarding-completed-at', new Date().toISOString())
        setIsVisible(false)
        onComplete()
    }

    const handleSkip = () => {
        localStorage.setItem('onboarding-skipped', 'true')
        setIsVisible(false)
        onComplete()
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleSkip()
            if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep()
            if (e.key === 'ArrowLeft') prevStep()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [nextStep, prevStep])

    if (!isVisible || !step) return null

    const isFirstStep = currentStep === 0
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
    const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

    // Calculate modal position based on highlight
    const getModalPosition = (): React.CSSProperties => {
        if (step.position === 'center' || !highlightRect) {
            return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        }
        if (step.position === 'bottom-center') {
            return {
                top: `${Math.min(highlightRect.bottom + 20, window.innerHeight - 300)}px`,
                left: '50%',
                transform: 'translateX(-50%)',
            }
        }
        if (step.position === 'top-center') {
            return {
                top: `${Math.max(highlightRect.top - 250, 20)}px`,
                left: '50%',
                transform: 'translateX(-50%)',
            }
        }
        return { bottom: '24px', right: '24px' }
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-[9998] transition-opacity duration-300"
                style={{ background: 'rgba(10, 1, 24, 0.85)' }}
            >
                {/* Spotlight cutout for highlighted element */}
                {highlightRect && (
                    <div
                        className="absolute rounded-xl transition-all duration-300"
                        style={{
                            top: highlightRect.top - 8,
                            left: highlightRect.left - 8,
                            width: highlightRect.width + 16,
                            height: highlightRect.height + 16,
                            background: 'transparent',
                            boxShadow: `
                                0 0 0 4px ${colors.purple},
                                0 0 20px ${colors.purple}80,
                                0 0 40px ${colors.purple}40,
                                0 0 0 9999px rgba(10, 1, 24, 0.85)
                            `,
                        }}
                    />
                )}
            </div>

            {/* Modal */}
            <div
                className="fixed z-[9999] w-full max-w-md p-6 rounded-2xl shadow-2xl animate-slideUp"
                style={{
                    ...getModalPosition(),
                    background: `linear-gradient(145deg, ${colors.surface} 0%, ${colors.backgroundDark} 100%)`,
                    border: `2px solid ${colors.purple}`,
                    boxShadow: `0 0 60px ${colors.purple}40, 0 20px 40px rgba(0,0,0,0.5)`,
                }}
            >
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl overflow-hidden" style={{ background: colors.border }}>
                    <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                        }}
                    />
                </div>

                {/* Step counter */}
                <div className="flex items-center justify-between mb-4 pt-2">
                    <span className="text-xs font-medium" style={{ color: colors.textMuted }}>
                        Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                    </span>
                    <button
                        onClick={handleSkip}
                        className="text-xs hover:opacity-80 transition-opacity"
                        style={{ color: colors.textMuted }}
                    >
                        Skip tour
                    </button>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
                        style={{
                            background: `linear-gradient(135deg, ${colors.purple}30 0%, ${colors.cyan}20 100%)`,
                            border: `1px solid ${colors.border}`,
                        }}
                    >
                        <span className="text-5xl">{step.emoji}</span>
                    </div>

                    <h3
                        className="text-2xl font-bold mb-3"
                        style={{
                            background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.purple} 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        {step.title}
                    </h3>

                    <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                        {step.description}
                    </p>

                    {step.action && (
                        <p className="mt-3 text-sm font-medium" style={{ color: colors.cyan }}>
                            👆 {step.action}
                        </p>
                    )}
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-1.5 mb-5">
                    {ONBOARDING_STEPS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => onStepChange ? onStepChange(i) : setInternalStep(i)}
                            className="transition-all duration-300"
                            style={{
                                width: i === currentStep ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: i === currentStep
                                    ? `linear-gradient(90deg, ${colors.purple} 0%, ${colors.cyan} 100%)`
                                    : i < currentStep
                                        ? colors.purple
                                        : colors.border,
                            }}
                        />
                    ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                    {!isFirstStep && (
                        <button
                            onClick={prevStep}
                            className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                            style={{
                                background: colors.surface,
                                color: colors.textPrimary,
                                border: `1px solid ${colors.border}`,
                            }}
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        className={`${isFirstStep ? 'flex-1' : 'flex-[2]'} py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]`}
                        style={{
                            background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                            color: 'white',
                            boxShadow: `0 4px 20px ${colors.purple}50`,
                        }}
                    >
                        {isLastStep ? 'Start Creating! 🚀' : isFirstStep ? "Let's Go! →" : 'Next →'}
                    </button>
                </div>

                {/* Keyboard hint */}
                <p className="text-center text-xs mt-4" style={{ color: colors.textMuted }}>
                    Use <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>←</kbd>{' '}
                    <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>→</kbd> to navigate
                </p>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -40%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
            `}</style>
        </>
    )
}

// Hook to manage onboarding state
export function useOnboardingTour() {
    const [showTour, setShowTour] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [hasCompletedTour, setHasCompletedTour] = useState(true) // Default true to prevent flash

    useEffect(() => {
        const completed = localStorage.getItem('onboarding-complete')
        const skipped = localStorage.getItem('onboarding-skipped')
        const hasVisited = localStorage.getItem('has-visited')

        // Show tour only if user just completed welcome screen but hasn't done tour
        if (hasVisited && !completed && !skipped) {
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
        setCurrentStep(0)
    }

    const resetTour = () => {
        localStorage.removeItem('onboarding-complete')
        localStorage.removeItem('onboarding-skipped')
        setCurrentStep(0)
        setShowTour(true)
        setHasCompletedTour(false)
    }

    const startTour = () => {
        localStorage.removeItem('onboarding-complete')
        localStorage.removeItem('onboarding-skipped')
        setCurrentStep(0)
        setShowTour(true)
        setHasCompletedTour(false)
    }

    // Advance to specific step (useful for interactive tours)
    const goToStep = (step: number) => {
        if (step >= 0 && step < ONBOARDING_STEPS.length) {
            setCurrentStep(step)
        }
    }

    return {
        showTour,
        currentStep,
        hasCompletedTour,
        completeTour,
        resetTour,
        startTour,
        goToStep,
        totalSteps: ONBOARDING_STEPS.length,
    }
}

export default OnboardingTour
