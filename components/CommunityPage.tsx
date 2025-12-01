"use client"

import { useState } from 'react'
import { colors, gradients } from '@/lib/design'
import { Card, Button, Chip } from '@/components/ui/primitives'
import DreamGroups from '@/components/DreamGroups'
import EventsContest from '@/components/EventsContest'
import PublicGallery from '@/components/PublicGallery'

type CommunityTab = 'overview' | 'groups' | 'events' | 'gallery'

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<CommunityTab>('overview')

    const tabs = [
        { key: 'overview' as const, label: 'Overview', icon: '📊' },
        { key: 'groups' as const, label: 'Dream Groups', icon: '👥' },
        { key: 'events' as const, label: 'Contests', icon: '🏆' },
        { key: 'gallery' as const, label: 'Gallery', icon: '🌟' },
    ]

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
                    🌟 Welcome to the Dream Community
                </h2>
                <p className="text-lg mb-6" style={{ color: colors.textSecondary }}>
                    Connect with fellow dreamers, share your visions, and discover amazing dream art from around the world.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Button onClick={() => setActiveTab('groups')} className="flex items-center gap-2">
                        <span>👥</span> Join Groups
                    </Button>
                    <Button onClick={() => setActiveTab('events')} variant="secondary" className="flex items-center gap-2">
                        <span>🏆</span> Enter Contests
                    </Button>
                    <Button onClick={() => setActiveTab('gallery')} variant="secondary" className="flex items-center gap-2">
                        <span>🌟</span> Browse Gallery
                    </Button>
                </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center p-6">
                    <div className="text-3xl mb-2">👥</div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>Dream Groups</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Join communities of dreamers with similar interests
                    </p>
                </Card>
                <Card className="text-center p-6">
                    <div className="text-3xl mb-2">🏆</div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>Monthly Contests</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Compete for prizes and get featured in the gallery
                    </p>
                </Card>
                <Card className="text-center p-6">
                    <div className="text-3xl mb-2">🌟</div>
                    <h3 className="font-semibold mb-1" style={{ color: colors.textPrimary }}>Public Gallery</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Explore stunning AI-generated dream comics
                    </p>
                </Card>
            </div>
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
                {activeTab === 'groups' && <DreamGroups />}
                {activeTab === 'events' && <EventsContest />}
                {activeTab === 'gallery' && <PublicGallery />}
            </div>
        </div>
    )
}