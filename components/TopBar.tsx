"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NewDreamModal from './NewDreamModal'

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="h-20 bg-[rgba(18,18,18,0.8)] backdrop-blur-xl border-b border-[rgba(138,43,226,0.2)] sticky top-0 z-10">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              placeholder="Search dreams, comics, achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[rgba(30,30,30,0.7)] backdrop-blur-xl border border-[rgba(138,43,226,0.3)] rounded-2xl py-3 px-5 pl-12 text-white placeholder-[#666] focus:outline-none focus:border-[#8A2BE2] focus:ring-2 focus:ring-[rgba(91,44,252,0.3)] transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4 ml-8">
          {/* Notifications */}
          <button 
            onClick={() => router.push('/achievements')}
            className="relative p-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-all group"
            title="View Achievements"
          >
            <span className="text-xl">🔔</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#03DAC6] rounded-full animate-pulse"></span>
          </button>

          {/* Quick Add */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#5B2CFC] to-[#8A2BE2] hover:shadow-lg hover:shadow-[rgba(91,44,252,0.5)] text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
          >
            <span className="text-lg">✨</span>
            <span>New Dream</span>
          </button>
        </div>
      </div>
      <NewDreamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(dream) => {
          const { saveDream } = require('../lib/store')
          saveDream(dream)
          setIsModalOpen(false)
          router.push('/dreams')
        }}
      />
    </header>
  )
}
