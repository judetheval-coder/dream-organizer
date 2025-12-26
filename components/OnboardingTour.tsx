"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { colors } from '@/lib/design'

interface OnboardingStep {
    id: string
    title: string
    description: string
    emoji: string
    highlight?: string // CSS selector to highlight
    position?: 'center' | 'bottom-right' | 'top-center' | 'bottom-center'
    action?: string // What the user should do
    navigate?: string // Optional route to push when this step starts
    waitFor?: 'click' | 'element' // Whether to wait for interaction
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Visnoctis! 🌙',
        description: "This tour will walk you through the main screens: Dashboard, My Dreams, Comics, Calendar, and Settings.",
        emoji: '✨',
        position: 'center',
        action: "Click 'Let's Go' to begin"
    },
    {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'The Dashboard is your hub — quick stats, recent comics, and insights. We will show you where to create and manage dreams.',
        emoji: '📊',
        navigate: '/dashboard',
        highlight: '[data-onboarding="nav-dashboard"]',
        position: 'top-center',
    },
    {
        id: 'my-dreams',
        title: 'My Dreams',
        description: 'All your saved dreams live here — edit, delete, or generate comics from existing entries.',
        emoji: '💭',
        navigate: '/dreams',
        highlight: '[data-onboarding="nav-dreams"]',
        position: 'top-center',
    },
    {
        id: 'create-first-dream',
        title: 'Create a Dream',
        description: 'Let\'s create your first dream. We\'ll open the creation modal and guide you through the fields.',
        emoji: '💡',
        navigate: '/dashboard',
        highlight: '[data-onboarding="new-dream-btn"]',
        position: 'bottom-center',
        action: 'Click the New Dream button',
        waitFor: 'click'
    },
    {
        id: 'dream-text',
        title: 'Describe Your Dream',
        description: 'Type what happened in your dream — details help the model produce better panels.',
        emoji: '✍️',
        highlight: '[data-onboarding="dream-textarea"]',
        position: 'bottom-center',
        action: 'Click the text area and type a short sentence',
        waitFor: 'click'
    },
    {
        id: 'style-mood',
        title: 'Choose Style & Mood',
        description: 'Pick an art style and mood to control the visual tone of generated panels.',
        emoji: '🎭',
        highlight: '[data-onboarding="style-selector"]',
        position: 'bottom-center',
    },
    {
        id: 'generate',
        title: 'Generate Your Comic',
        description: 'Click Create Dream to submit and watch the panels form. This step uploads images to Supabase and stores panel records.',
        emoji: '🚀',
        highlight: '[data-onboarding="create-btn"]',
        position: 'bottom-center',
        action: 'Click Create Dream to continue',
        waitFor: 'click'
    },
    {
        id: 'panels',
        title: 'Panels & Generation',
        description: 'Each dream is split into panels; click Generate on a panel to produce an image or let it auto-generate.',
        emoji: '📖',
        position: 'center',
    },
    {
        id: 'calendar',
        title: 'Calendar & Streaks',
        description: 'Use the calendar to see your dream streaks and activity over time.',
        emoji: '📅',
        navigate: '/calendar',
        highlight: '[data-onboarding="nav-calendar"]',
        position: 'top-center',
    },
    {
        id: 'settings',
        title: 'Settings & Sync',
        description: 'Adjust account and sync settings. You can manage your subscription tier here.',
        emoji: '⚙️',
        navigate: '/settings',
        highlight: '[data-onboarding="nav-settings"]',
        position: 'top-center',
    },
    {
        id: 'complete',
        title: 'You\'re All Set!',
        description: 'You can re-run this tour anytime from the sidebar. Happy creating! 🌙',
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
    const router = useRouter()

    // Update highlight position when step changes; also support navigation and interactive waits
    useEffect(() => {
        let cleanupListener: (() => void) | null = null
        let mounted = true

        const doStep = async () => {
            if (!mounted) return

            // Navigate if requested
            if (step?.navigate) {
                try {
                    router.push(step.navigate)
                } catch (err) {
                    // ignore navigation errors
                }
                // Give the page a moment to render
                await new Promise((r) => setTimeout(r, 500))
            }

            if (step?.highlight) {
                // Retry finding element a few times (for elements that render after navigation)
                let el: Element | null = null
                let attempts = 0
                const maxAttempts = 10

                const findElement = async (): Promise<Element | null> => {
                    while (attempts < maxAttempts && mounted) {
                        el = document.querySelector(step.highlight!)
                        if (el) return el
                        attempts++
                        await new Promise(r => setTimeout(r, 200))
                    }
                    return null
                }

                el = await findElement()

                if (el) {
                    const rect = el.getBoundingClientRect()
                    setHighlightRect(rect)
                    // Scroll element into view if needed
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

                    // If this step wants to wait for a click on the element, attach a listener
                    if (step.waitFor === 'click') {
                        const handleClick = () => {
                            // small delay to let UI update
                            setTimeout(() => nextStep(), 100)
                        }
                        el.addEventListener('click', handleClick)
                        cleanupListener = () => el!.removeEventListener('click', handleClick)
                    }
                } else {
                    console.warn(`[Onboarding] Could not find element: ${step.highlight}`)
                    setHighlightRect(null)
                }
            } else {
                setHighlightRect(null)
            }
        }

        doStep()

        return () => {
            mounted = false
            if (cleanupListener) cleanupListener()
        }
    }, [currentStep, step?.highlight, step?.navigate, step?.waitFor])

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
                    <>
                        <div
                            className="absolute rounded-xl transition-all duration-300 pointer-events-none"
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
                        {/* Animated arrow pointer */}
                        <div
                            className="absolute pointer-events-none animate-bounce"
                            style={{
                                top: highlightRect.top - 50,
                                left: highlightRect.left + highlightRect.width / 2 - 16,
                                fontSize: '32px',
                                filter: `drop-shadow(0 0 10px ${colors.cyan})`,
                            }}
                        >
                            👇
                        </div>
                    </>
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
