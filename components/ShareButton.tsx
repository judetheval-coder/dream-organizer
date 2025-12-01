'use client'

import { useState } from 'react'
import { colors } from '@/lib/design'
import { useToast } from '@/contexts/ToastContext'

interface ShareButtonProps {
    dreamId: number
    title: string
    description?: string
    imageUrl?: string
}

export function ShareButton({ dreamId, title, description, imageUrl }: ShareButtonProps) {
    const [showMenu, setShowMenu] = useState(false)
    const { showToast } = useToast()

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/dream/${dreamId}` : ''
    const shareText = `Check out my dream: "${title}" 💭✨`

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            showToast('Link copied to clipboard!', 'success')
            setShowMenu(false)

            // Track share
            await fetch('/api/track-share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dreamId, platform: 'clipboard' })
            })
        } catch (error) {
            showToast('Failed to copy link', 'error')
        }
    }

    const shareTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank')
        trackShare('twitter')
        setShowMenu(false)
    }

    const shareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        window.open(url, '_blank')
        trackShare('facebook')
        setShowMenu(false)
    }

    const shareReddit = () => {
        const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`
        window.open(url, '_blank')
        trackShare('reddit')
        setShowMenu(false)
    }

    const shareWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        window.open(url, '_blank')
        trackShare('whatsapp')
        setShowMenu(false)
    }

    const downloadImage = async () => {
        if (!imageUrl) {
            showToast('No image to download', 'error')
            return
        }

        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `dream-${dreamId}.png`
            a.click()
            URL.revokeObjectURL(url)
            showToast('Image downloaded!', 'success')
            setShowMenu(false)
        } catch (error) {
            showToast('Failed to download image', 'error')
        }
    }

    const trackShare = async (platform: string) => {
        try {
            await fetch('/api/track-share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dreamId, platform })
            })
        } catch (error) {
            console.error('Failed to track share:', error)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                    background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                    color: 'white'
                }}
            >
                🚀 Share
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Menu */}
                    <div
                        className="absolute right-0 mt-2 w-56 rounded-lg shadow-2xl z-50 overflow-hidden"
                        style={{
                            background: colors.surface,
                            border: `1px solid ${colors.border}`
                        }}
                    >
                        <div className="p-2">
                            <button
                                onClick={copyLink}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
                                style={{ color: colors.textPrimary }}
                            >
                                <span>🔗</span>
                                <span>Copy Link</span>
                            </button>

                            <button
                                onClick={shareTwitter}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
                                style={{ color: colors.textPrimary }}
                            >
                                <span>🐦</span>
                                <span>Share on Twitter</span>
                            </button>

                            <button
                                onClick={shareFacebook}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
                                style={{ color: colors.textPrimary }}
                            >
                                <span>📘</span>
                                <span>Share on Facebook</span>
                            </button>

                            <button
                                onClick={shareReddit}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
                                style={{ color: colors.textPrimary }}
                            >
                                <span>🔴</span>
                                <span>Share on Reddit</span>
                            </button>

                            <button
                                onClick={shareWhatsApp}
                                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
                                style={{ color: colors.textPrimary }}
                            >
                                <span>💬</span>
                                <span>Share on WhatsApp</span>
                            </button>

                            {imageUrl && (
                                <>
                                    <div className="my-2 border-t" style={{ borderColor: colors.border }} />
                                    <button
                                        onClick={downloadImage}
                                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-3"
                                        style={{ color: colors.textPrimary }}
                                    >
                                        <span>💾</span>
                                        <span>Download Image</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default ShareButton
