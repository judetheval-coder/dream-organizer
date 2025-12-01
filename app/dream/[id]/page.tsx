'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { colors } from '@/lib/design'
import Panel from '@/components/Panel'
import type { DreamWithPanels } from '@/lib/supabase'

export default function PublicDreamPage() {
    const params = useParams()
    const [dream, setDream] = useState<DreamWithPanels | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchDream() {
            try {
                const { data, error } = await supabase
                    .from('dreams')
                    .select(`
            *,
            panels (*)
          `)
                    .eq('id', params.id)
                    .eq('is_public', true) // Only show public dreams
                    .single()

                if (error) throw error
                if (!data) throw new Error('Dream not found or not public')

                setDream(data as DreamWithPanels)
            } catch (err) {
                console.error('Error fetching dream:', err)
                setError('Dream not found or not available')
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchDream()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: colors.backgroundDark }}>
                <div className="animate-pulse text-center">
                    <div className="text-6xl mb-4">💭</div>
                    <p style={{ color: colors.textMuted }}>Loading dream...</p>
                </div>
            </div>
        )
    }

    if (error || !dream) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: colors.backgroundDark }}>
                <div className="text-center">
                    <div className="text-6xl mb-4">😴</div>
                    <h1 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>Dream Not Found</h1>
                    <p style={{ color: colors.textMuted }}>{error || 'This dream is private or does not exist'}</p>
                    <a
                        href="/"
                        className="mt-6 inline-block px-6 py-3 rounded-lg font-semibold"
                        style={{ background: colors.purple, color: 'white' }}
                    >
                        Create Your Own Dreams
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ background: colors.backgroundDark }}>
            {/* Hero Section */}
            <div className="border-b" style={{ borderColor: colors.border }}>
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                            {dream.text.split('\n')[0].substring(0, 100)}...
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-sm" style={{ color: colors.textMuted }}>
                            <span>🎨 {dream.style || 'Arcane'}</span>
                            <span>•</span>
                            <span>💭 {dream.mood || 'Mysterious'}</span>
                            <span>•</span>
                            <span>{new Date(dream.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => {
                                const url = window.location.href
                                navigator.clipboard.writeText(url)
                                alert('Link copied!')
                            }}
                            className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                            style={{ background: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` }}
                        >
                            🔗 Copy Link
                        </button>
                        <a
                            href={`https://twitter.com/intent/tweet?text=Check out this dream visualization!&url=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                            style={{ background: '#1DA1F2', color: 'white' }}
                        >
                            🐦 Share on Twitter
                        </a>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                            style={{ background: '#4267B2', color: 'white' }}
                        >
                            📘 Share on Facebook
                        </a>
                    </div>
                </div>
            </div>

            {/* Comic Panels */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid gap-8 md:grid-cols-2">
                    {dream.panels?.sort((a, b) => a.scene_number - b.scene_number).map((panel) => (
                        <div key={panel.id} className="animate-fadeIn">
                            <Panel
                                description={panel.description}
                                image={panel.image_url || undefined}
                                style={dream.style || 'Arcane'}
                                mood={dream.mood || 'Mysterious'}
                            />
                            <p className="mt-3 text-sm text-center" style={{ color: colors.textSecondary }}>
                                {panel.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Footer */}
            <div className="border-t py-12 text-center" style={{ borderColor: colors.border }}>
                <h2 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                    Create Your Own Dream Comics
                </h2>
                <p className="mb-6" style={{ color: colors.textMuted }}>
                    Turn your dreams into beautiful visual stories with AI
                </p>
                <a
                    href="/sign-up"
                    className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)`, color: 'white' }}
                >
                    Start Creating Free ✨
                </a>
            </div>
        </div>
    )
}
