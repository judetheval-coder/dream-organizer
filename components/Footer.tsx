"use client"

import Link from 'next/link'
import { colors } from '@/lib/design'

const COLS = [
  { title: 'Features', items: ['🎨 AI Image Generation', '📖 Comic Panel Creation', '💾 Dream Archive', '✨ Dream Insights'] },
  { title: 'Company', links: [{ href: '/pricing', label: 'Pricing' }, { href: '/privacy', label: 'Privacy Policy' }, { href: '/terms', label: 'Terms of Service' }] },
  { title: 'Built With', items: ['⚡ Next.js 16', '🤖 DALL-E 3', '🔐 Clerk Auth', '💳 Stripe'] },
]

const SOCIAL_LINKS = [
  { href: 'https://twitter.com/intent/tweet?text=Check%20out%20Visnoctis%20-%20turn%20your%20dreams%20into%20comics!%20%F0%9F%8C%99', icon: '🐦', label: 'Twitter' },
  { href: 'https://www.facebook.com/sharer/sharer.php?u=https://visnoctis.com', icon: '📘', label: 'Facebook' },
  { href: 'https://www.reddit.com/submit?title=Visnoctis%20-%20Vision%20of%20the%20Night%20-%20AI%20Dream%20Comics', icon: '🔴', label: 'Reddit' },
]

export default function Footer() {
  return (
    <footer className="mt-auto py-8 px-8 border-t" style={{ background: colors.backgroundDark, borderColor: colors.border }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-2" style={{ color: colors.textPrimary }}>🌙 Visnoctis</h3>
            <p className="text-sm italic mb-1" style={{ color: colors.purple }}>"Vision of the Night"</p>
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
          <p className="text-sm" style={{ color: colors.textMuted }}>© {new Date().getFullYear()} Visnoctis. Made with 💜 for dreamers everywhere.</p>
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
