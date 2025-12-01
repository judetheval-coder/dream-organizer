"use client"

import { useState, useEffect } from 'react'
import { colors } from '@/lib/design'

const SHORTCUTS = [
    {
        category: 'Navigation', shortcuts: [
            { keys: ['D'], description: 'Go to Dashboard' },
            { keys: ['C'], description: 'Go to Comics' },
            { keys: ['A'], description: 'Go to Achievements' },
        ]
    },
    {
        category: 'Actions', shortcuts: [
            { keys: ['N'], description: 'Create new dream' },
            { keys: ['Ctrl', 'K'], description: 'Focus search' },
            { keys: ['Esc'], description: 'Close modals' },
        ]
    },
    {
        category: 'Help', shortcuts: [
            { keys: ['?'], description: 'Show this help dialog' },
        ]
    },
]

interface KeyboardShortcutsHelpProps {
    isOpen: boolean
    onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-fadeIn"
                style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`
                }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                        ⌨️ Keyboard Shortcuts
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:opacity-70 transition-opacity"
                        style={{ color: colors.textMuted }}
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-6">
                    {SHORTCUTS.map((section) => (
                        <div key={section.category}>
                            <h3
                                className="text-sm font-semibold uppercase tracking-wider mb-3"
                                style={{ color: colors.textMuted }}
                            >
                                {section.category}
                            </h3>
                            <div className="space-y-2">
                                {section.shortcuts.map((shortcut, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg"
                                        style={{ background: colors.backgroundDark }}
                                    >
                                        <span style={{ color: colors.textSecondary }}>
                                            {shortcut.description}
                                        </span>
                                        <div className="flex gap-1">
                                            {shortcut.keys.map((key, j) => (
                                                <span key={j}>
                                                    <kbd
                                                        className="px-2 py-1 rounded text-sm font-mono font-semibold"
                                                        style={{
                                                            background: colors.surface,
                                                            border: `1px solid ${colors.border}`,
                                                            color: colors.cyan
                                                        }}
                                                    >
                                                        {key}
                                                    </kbd>
                                                    {j < shortcut.keys.length - 1 && (
                                                        <span className="mx-1" style={{ color: colors.textMuted }}>+</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <p
                    className="text-center text-sm mt-6"
                    style={{ color: colors.textMuted }}
                >
                    Press <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>?</kbd> anytime to show this help
                </p>
            </div>
        </div>
    )
}

// Hook to show keyboard shortcuts help with ? key
export function useKeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement
            const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

            if (e.key === '?' && !isTyping) {
                e.preventDefault()
                setIsOpen(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    }
}

export default KeyboardShortcutsHelp
