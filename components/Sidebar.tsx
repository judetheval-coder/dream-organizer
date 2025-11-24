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
    <aside className="w-64 h-screen sticky top-0 bg-[rgba(18,18,18,0.95)] backdrop-blur-xl border-r border-[rgba(138,43,226,0.2)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(138,43,226,0.2)]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#5B2CFC] to-[#03DAC6] rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            ✨
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-[#5B2CFC] to-[#03DAC6] bg-clip-text text-transparent">
              Dream Machine
            </h1>
            <p className="text-[10px] text-[#666] uppercase tracking-wider">Beta v1.0</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-[#5B2CFC] to-[#8A2BE2] text-white shadow-lg shadow-[rgba(91,44,252,0.3)]' 
                  : 'text-[#B0B0B0] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[rgba(138,43,226,0.2)]">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.05)] transition-all cursor-pointer group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8A2BE2] to-[#03DAC6] rounded-full flex items-center justify-center text-white font-bold">
            L
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">Levi</p>
            <p className="text-[#666] text-xs">@dreamer</p>
          </div>
          <span className="text-[#666] group-hover:text-white transition-colors">⋮</span>
        </div>
      </div>
    </aside>
  )
}
