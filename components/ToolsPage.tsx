"use client"

import { useState } from 'react'
import { colors } from '@/lib/design'
import { Card, Button } from '@/components/ui/primitives'
import DreamDictionary from '@/components/DreamDictionary'
import GlobalPatterns from '@/components/GlobalPatterns'
import { InsightsPreview } from '@/components/dashboard/InsightsPreview'
import { useDreams } from '@/hooks/useDreams'

type ToolsTab = 'overview' | 'dictionary' | 'patterns' | 'insights'

export default function ToolsPage() {
    const [activeTab, setActiveTab] = useState<ToolsTab>('overview')
    const { dreams, insights, analyzing, analyzeDreams } = useDreams()

    const tabs = [
        { key: 'overview' as const, label: 'Overview', icon: '🛠️' },
        { key: 'dictionary' as const, label: 'Dream Dictionary', icon: '📖' },
        { key: 'patterns' as const, label: 'Patterns', icon: '🌍' },
        { key: 'insights' as const, label: 'AI Insights', icon: '✨' },
    ]

    const hasDreams = dreams.length > 0

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                    🛠️ Dream Analysis Tools
                </h2>
                <p className="text-lg mb-6" style={{ color: colors.textSecondary }}>
                    Unlock the hidden meanings in your dreams with deep analysis and pattern recognition.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={() => setActiveTab('dictionary')} className="flex items-center gap-2">
                        <span>📖</span> Dream Dictionary
                    </Button>
                    <Button onClick={() => setActiveTab('patterns')} variant="secondary" className="flex items-center gap-2">
                        <span>🌍</span> Global Patterns
                    </Button>
                    <Button onClick={() => setActiveTab('insights')} variant="secondary" className="flex items-center gap-2">
                        <span>✨</span> AI Insights
                    </Button>
                </div>
            </Card>

            {/* Tool Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="text-3xl mb-4">📖</div>
                    <h3 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Dream Dictionary</h3>
                    <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        Look up symbols and meanings from your dreams
                    </p>
                    <Button onClick={() => setActiveTab('dictionary')} size="sm" className="w-full">
                        Open Dictionary
                    </Button>
                </Card>

                <Card className="p-6">
                    <div className="text-3xl mb-4">🌍</div>
                    <h3 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Global Patterns</h3>
                    <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        See what themes emerge across all dreams
                    </p>
                    <Button onClick={() => setActiveTab('patterns')} size="sm" variant="secondary" className="w-full">
                        View Patterns
                    </Button>
                </Card>

                <Card className="p-6">
                    <div className="text-3xl mb-4">✨</div>
                    <h3 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>AI Insights</h3>
                    <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
                        Get personalized analysis of your dream patterns
                    </p>
                    <Button
                        onClick={() => setActiveTab('insights')}
                        size="sm"
                        variant="secondary"
                        className="w-full"
                        disabled={!hasDreams}
                    >
                        {hasDreams ? 'Get Insights' : 'Need Dreams First'}
                    </Button>
                </Card>
            </div>

            {/* Quick Stats */}
            {!hasDreams && (
                <Card className="text-center py-8">
                    <div className="text-4xl mb-4">💭</div>
                    <h3 className="font-semibold mb-2" style={{ color: colors.textPrimary }}>Start Your Dream Journey</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Create your first dream to unlock powerful analysis tools and insights.
                    </p>
                </Card>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-lg">
                {tabs.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${activeTab === key
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <span>{icon}</span>
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="animate-fadeInUp">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'dictionary' && (
                    <DreamDictionary
                        dreamText={dreams.length > 0 ? dreams[0].text : ''}
                    />
                )}
                {activeTab === 'patterns' && (
                    <GlobalPatterns
                        userDreams={dreams.map(d => d.text)}
                    />
                )}
                {activeTab === 'insights' && (
                    <div className="max-w-2xl">
                        <InsightsPreview
                            insights={insights}
                            analyzing={analyzing}
                            onAnalyze={analyzeDreams}
                            hasDreams={hasDreams}
                            error={null}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}