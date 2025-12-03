"use client"

import Link from 'next/link'
import { colors } from '@/lib/design'

const COLS = [
  { title: 'Features', items: ['🎨 AI Image Generation', '📖 Comic Panel Creation', '💾 Dream Archive', '✨ Dream Insights'] },
  { title: 'Company', links: [{ href: '/pricing', label: 'Pricing' }, { href: '/privacy', label: 'Privacy Policy' }, { href: '/terms', label: 'Terms of Service' }] },
  { title: 'Built With', items: ['⚡ Next.js 16', '🤖 DALL-E 3', '🔐 Clerk Auth', '💳 Stripe'] },
]

const SOCIAL_LINKS = [
  { href: 'https://twitter.com/intent/tweet?text=Check%20out%20The%20Dream%20Machine%20-%20turn%20your%20dreams%20into%20comics!', icon: '🐦', label: 'Twitter' },
  { href: 'https://www.facebook.com/sharer/sharer.php?u=https://lucidlaboratories.net', icon: '📘', label: 'Facebook' },
  { href: 'https://www.reddit.com/submit?title=The%20Dream%20Machine%20-%20AI%20Dream%20Comics', icon: '🔴', label: 'Reddit' },
]

export default function Footer() {
  return (
    <footer className="mt-auto py-8 px-8 border-t" style={{ background: colors.backgroundDark, borderColor: colors.border }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-2" style={{ color: colors.textPrimary }}>💭 The Dream Machine</h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>Transform your dreams into stunning visual comic stories</p>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="font-semibold mb-3" style={{ color: colors.textPrimary }}>{col.title}</h4>
              <ul className="space-y-2 text-sm" style={{ color: colors.textMuted }}>
                {col.items?.map(item => <li key={item}>{item}</li>)}
                {col.links?.map(l => <li key={l.href}><Link href={l.href} className="hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: colors.border }}>
          <p className="text-sm" style={{ color: colors.textMuted }}>© {new Date().getFullYear()} The Dream Machine. Made with 💜 for dreamers everywhere.</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              {SOCIAL_LINKS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="text-xl hover:scale-125 transition-transform" title={s.label}>{s.icon}</a>
              ))}
            </div>
            <div className="flex gap-6 text-sm">
              {[{ href: '/privacy', label: 'Privacy' }, { href: '/terms', label: 'Terms' }, { href: 'mailto:support@lucidlaboratories.net', label: 'Contact' }].map(l => (
                <Link key={l.href} href={l.href} className="hover:opacity-80 transition-opacity" style={{ color: colors.textMuted }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
