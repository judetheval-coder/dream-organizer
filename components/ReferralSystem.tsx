'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { colors } from '@/lib/design'
import { useToast } from '@/contexts/ToastContext'
import Card from '@/components/ui/Card'

export function ReferralSystem() {
    const { user } = useUser()
    const { showToast } = useToast()
    const [referralCode, setReferralCode] = useState('')
    const [referralCount, setReferralCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchReferralData()
        }
    }, [user])

    const fetchReferralData = async () => {
        try {
            const response = await fetch('/api/referral/stats')
            const data = await response.json()
            setReferralCode(data.referralCode)
            setReferralCount(data.referralCount || 0)
        } catch (error) {
            console.error('Error fetching referral data:', error)
        } finally {
            setLoading(false)
        }
    }

    const copyReferralLink = () => {
        const link = `${window.location.origin}/sign-up?ref=${referralCode}`
        navigator.clipboard.writeText(link)
        showToast('Referral link copied! Share it with friends 🎁', 'success')
    }

    const shareOnTwitter = () => {
        const text = `I'm creating amazing dream comics on Dream Organizer! 🎨✨ Join me and turn your dreams into art:`
        const url = `${window.location.origin}/sign-up?ref=${referralCode}`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    }

    const shareOnFacebook = () => {
        const url = `${window.location.origin}/sign-up?ref=${referralCode}`
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    }

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-pulse text-4xl mb-2">🎁</div>
                    <p style={{ color: colors.textMuted }}>Loading...</p>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎁</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                    Invite Friends & Earn Rewards
                </h2>
                <p style={{ color: colors.textMuted }}>
                    Share Dream Organizer with friends and unlock exclusive features!
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg" style={{ background: colors.backgroundDark }}>
                    <div className="text-3xl font-bold" style={{ color: colors.purple }}>
                        {referralCount}
                    </div>
                    <div className="text-sm" style={{ color: colors.textMuted }}>
                        Friends Invited
                    </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: colors.backgroundDark }}>
                    <div className="text-3xl font-bold" style={{ color: colors.cyan }}>
                        {referralCount * 10}
                    </div>
                    <div className="text-sm" style={{ color: colors.textMuted }}>
                        Bonus Credits
                    </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: colors.backgroundDark }}>
                    <div className="text-3xl font-bold" style={{ color: colors.pink }}>
                        {Math.floor(referralCount / 5)}
                    </div>
                    <div className="text-sm" style={{ color: colors.textMuted }}>
                        Badges Earned
                    </div>
                </div>
            </div>

            {/* Referral Link */}
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
                    Your Referral Link
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={`${window.location.origin}/sign-up?ref=${referralCode}`}
                        readOnly
                        className="flex-1 px-4 py-2 rounded-lg text-sm"
                        style={{
                            background: colors.backgroundDark,
                            border: `1px solid ${colors.border}`,
                            color: colors.textPrimary
                        }}
                    />
                    <button
                        onClick={copyReferralLink}
                        className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                        style={{
                            background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`,
                            color: 'white'
                        }}
                    >
                        📋 Copy
                    </button>
                </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={shareOnTwitter}
                    className="px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ background: '#1DA1F2', color: 'white' }}
                >
                    🐦 Share on Twitter
                </button>
                <button
                    onClick={shareOnFacebook}
                    className="px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                    style={{ background: '#4267B2', color: 'white' }}
                >
                    📘 Share on Facebook
                </button>
            </div>

            {/* Rewards Info */}
            <div className="mt-6 p-4 rounded-lg" style={{ background: colors.backgroundDark, border: `1px solid ${colors.border}` }}>
                <h3 className="font-bold mb-2" style={{ color: colors.textPrimary }}>
                    🎯 Referral Rewards
                </h3>
                <ul className="space-y-1 text-sm" style={{ color: colors.textSecondary }}>
                    <li>✨ 10 bonus credits per friend who joins</li>
                    <li>🏆 Exclusive badge at 5 referrals</li>
                    <li>💎 Unlock premium features at 10 referrals</li>
                    <li>👑 Become a VIP member at 25 referrals</li>
                </ul>
            </div>
        </Card>
    )
}

export default ReferralSystem
