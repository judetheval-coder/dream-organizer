"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'My Dreams', href: '/dreams', icon: '💭' },
  { name: 'Comics', href: '/', icon: '🎨' },
  { name: 'Calendar', href: '/calendar', icon: '📅' },
  { name: 'Achievements', href: '/achievements', icon: '🏆' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden sm:flex w-64 h-screen sticky top-0 bg-[rgba(18,18,18,0.97)] backdrop-blur-xl border-r border-[rgba(138,43,226,0.18)] flex-col shadow-xl">
      {/* Logo */}
      <div className="p-7 border-b border-[rgba(138,43,226,0.18)]">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="w-11 h-11 bg-gradient-to-br from-[#5B2CFC] to-[#03DAC6] rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md">
            🌙
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#5B2CFC] to-[#03DAC6] bg-clip-text text-transparent tracking-tight">
              Visnoctis
            </h1>
            <p className="text-[10px] text-[#888] italic tracking-wide mt-1">"Vision of the Night"</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-5 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const dataOn = item.href === '/' ? 'nav-home' : `nav-${item.href.replace(/\//g, '')}`
          return (
            <Link
              key={item.href}
              href={item.href}
              data-onboarding={dataOn}
              className={`
                flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 font-semibold text-base
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2
                ${isActive
                  ? 'bg-gradient-to-r from-[#5B2CFC] to-[#8A2BE2] text-white shadow-lg shadow-[rgba(91,44,252,0.3)] scale-[1.03]'
                  : 'text-[#B0B0B0] hover:text-white hover:bg-[rgba(255,255,255,0.07)] hover:scale-[1.02]'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold tracking-tight">{item.name}</span>
            </Link>
          )
        })}

        {/* Start Tour CTA */}
        <div className="mt-4 px-2">
          <Link href="/dashboard?tour=1" className="block text-sm w-full text-center py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white font-semibold">Start Tour</Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-5 border-t border-[rgba(138,43,226,0.18)]">
        <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] transition-all cursor-pointer group shadow-sm">
          <div className="w-11 h-11 bg-gradient-to-br from-[#8A2BE2] to-[#03DAC6] rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow">
            L
          </div>
          <div className="flex-1">
            <p className="text-white text-base font-semibold leading-tight">Levi</p>
            <p className="text-[#888] text-xs mt-0.5">@dreamer</p>
          </div>
          <span className="text-[#888] group-hover:text-white transition-colors text-xl">⋮</span>
        </div>
      </div>
    </aside>
  )
}
