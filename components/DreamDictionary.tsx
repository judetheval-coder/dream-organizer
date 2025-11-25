"use client"

import { useState, useMemo } from 'react'
import { colors } from '@/lib/design'
import { DREAM_SYMBOLS, findSymbolsInText, searchSymbols, type DreamSymbol } from '@/lib/dream-dictionary'
import { Card, Chip } from '@/components/ui/primitives'

const CATS = { emotion: '💭', nature: '🌊', animal: '🐾', object: '🔮', action: '⚡', person: '👤', place: '🏠', body: '🫀' } as const
const LABELS = { emotion: 'Emotions', nature: 'Nature', animal: 'Animals', object: 'Objects', action: 'Actions', person: 'People', place: 'Places', body: 'Body' } as const
type Cat = DreamSymbol['category']

export default function DreamDictionary({ dreamText, onSymbolClick }: { dreamText?: string; onSymbolClick?: (s: DreamSymbol) => void }) {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState<Cat | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const found = useMemo(() => new Set(dreamText ? findSymbolsInText(dreamText).map(s => s.symbol) : []), [dreamText])
  
  const symbols = useMemo(() => {
    let s = search ? searchSymbols(search) : DREAM_SYMBOLS
    if (cat !== 'all') s = s.filter(x => x.category === cat)
    return s.sort((a, b) => (found.has(a.symbol) ? 0 : 1) - (found.has(b.symbol) ? 0 : 1) || a.symbol.localeCompare(b.symbol))
  }, [search, cat, found])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>📖 Dream Dictionary</h2>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>Discover the hidden meanings in your dreams</p>
      </div>

      {dreamText && found.size > 0 && (
        <div className="p-4 rounded-xl border" style={{ background: `${colors.purple}15`, borderColor: `${colors.purple}40` }}>
          <p className="text-sm font-medium" style={{ color: colors.purple }}>✨ Found {found.size} symbol{found.size > 1 ? 's' : ''} in your dream</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {[...found].map(s => <span key={s} className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: colors.purple, color: colors.white }}>{s}</span>)}
          </div>
        </div>
      )}

      <div className="relative">
        <input type="text" placeholder="Search symbols..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-xl border outline-none transition-all focus:ring-2"
          style={{ background: colors.surface, borderColor: colors.border, color: colors.textPrimary }} />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'action', 'animal', 'body', 'nature', 'object', 'person', 'place'] as const).map(c => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
            {c === 'all' ? '🌟 All' : `${CATS[c]} ${LABELS[c]}`}
          </Chip>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {symbols.map(s => {
          const open = expanded === s.symbol, inDream = found.has(s.symbol)
          return (
            <Card key={s.symbol} className={inDream ? 'ring-2 ring-purple-500' : ''} interactive onClick={() => { setExpanded(open ? null : s.symbol); onSymbolClick?.(s) }}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATS[s.category]}</span>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                        {s.symbol}
                        {inDream && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: colors.purple, color: colors.white }}>In your dream</span>}
                      </h3>
                      <p className="text-xs" style={{ color: colors.textMuted }}>{LABELS[s.category]}</p>
                    </div>
                  </div>
                  <span style={{ color: colors.textMuted }}>{open ? '▼' : '▶'}</span>
                </div>
                <p className="text-sm" style={{ color: colors.textSecondary }}>{s.meaning}</p>
                {open && (
                  <div className="space-y-4 pt-3 border-t" style={{ borderColor: colors.border }}>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Common Interpretations</h4>
                      <ul className="space-y-1">
                        {s.commonInterpretations.map((i, x) => <li key={x} className="text-sm flex items-start gap-2" style={{ color: colors.textSecondary }}><span style={{ color: colors.cyan }}>•</span>{i}</li>)}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {s.positiveAspect && <div className="p-2 rounded-lg" style={{ background: `${colors.cyan}15` }}><p className="text-xs font-medium" style={{ color: colors.cyan }}>✨ Positive</p><p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{s.positiveAspect}</p></div>}
                      {s.negativeAspect && <div className="p-2 rounded-lg" style={{ background: `${colors.pink}15` }}><p className="text-xs font-medium" style={{ color: colors.pink }}>⚠️ Shadow</p><p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{s.negativeAspect}</p></div>}
                    </div>
                    <p className="text-xs font-medium" style={{ color: colors.textMuted }}>Related: {s.relatedSymbols.join(' • ')}</p>
                    <div className="flex flex-wrap gap-1">
                      {s.keywords.slice(0, 6).map(k => <span key={k} className="px-2 py-0.5 rounded-full text-xs" style={{ background: colors.surface, color: colors.textMuted }}>{k}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {symbols.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🔮</p>
          <p className="font-medium" style={{ color: colors.textPrimary }}>No symbols found</p>
          <p className="text-sm" style={{ color: colors.textMuted }}>Try a different search term</p>
        </div>
      )}
    </div>
  )
}
