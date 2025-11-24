"use client"

import { useState, useMemo } from 'react'
import { colors, gradients } from '@/lib/design'
import { DREAM_SYMBOLS, findSymbolsInText, searchSymbols, type DreamSymbol } from '@/lib/dream-dictionary'
import Card from '@/components/ui/Card'

interface DreamDictionaryProps {
  dreamText?: string  // If provided, highlights symbols found in the dream
  onSymbolClick?: (symbol: DreamSymbol) => void
}

const CATEGORY_ICONS: Record<DreamSymbol['category'], string> = {
  emotion: '💭',
  nature: '🌊',
  animal: '🐾',
  object: '🔮',
  action: '⚡',
  person: '👤',
  place: '🏠',
  body: '🫀',
}

const CATEGORY_LABELS: Record<DreamSymbol['category'], string> = {
  emotion: 'Emotions',
  nature: 'Nature',
  animal: 'Animals',
  object: 'Objects',
  action: 'Actions',
  person: 'People',
  place: 'Places',
  body: 'Body',
}

export default function DreamDictionary({ dreamText, onSymbolClick }: DreamDictionaryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DreamSymbol['category'] | 'all'>('all')
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)

  // Find symbols in the dream text if provided
  const foundInDream = useMemo(() => {
    if (!dreamText) return new Set<string>()
    const found = findSymbolsInText(dreamText)
    return new Set(found.map(s => s.symbol))
  }, [dreamText])

  // Filter symbols based on search and category
  const filteredSymbols = useMemo(() => {
    let symbols = DREAM_SYMBOLS

    if (searchQuery) {
      symbols = searchSymbols(searchQuery)
    }

    if (selectedCategory !== 'all') {
      symbols = symbols.filter(s => s.category === selectedCategory)
    }

    // Sort: found in dream first, then alphabetically
    return symbols.sort((a, b) => {
      const aFound = foundInDream.has(a.symbol) ? 0 : 1
      const bFound = foundInDream.has(b.symbol) ? 0 : 1
      if (aFound !== bFound) return aFound - bFound
      return a.symbol.localeCompare(b.symbol)
    })
  }, [searchQuery, selectedCategory, foundInDream])

  const categories: Array<DreamSymbol['category'] | 'all'> = ['all', 'action', 'animal', 'body', 'nature', 'object', 'person', 'place']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.textPrimary }}>
          📖 Dream Dictionary
        </h2>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
          Discover the hidden meanings in your dreams
        </p>
      </div>

      {/* Found in Dream Banner */}
      {dreamText && foundInDream.size > 0 && (
        <div 
          className="p-4 rounded-xl border"
          style={{ 
            background: `${colors.purple}15`, 
            borderColor: `${colors.purple}40` 
          }}
        >
          <p className="text-sm font-medium" style={{ color: colors.purple }}>
            ✨ Found {foundInDream.size} symbol{foundInDream.size > 1 ? 's' : ''} in your dream
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.from(foundInDream).map(symbol => (
              <span 
                key={symbol}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ background: colors.purple, color: colors.white }}
              >
                {symbol}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search symbols..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-10 rounded-xl border outline-none transition-all focus:ring-2"
          style={{
            background: colors.surface,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: selectedCategory === cat ? colors.purple : colors.surface,
              color: selectedCategory === cat ? colors.white : colors.textSecondary,
              border: `1px solid ${selectedCategory === cat ? colors.purple : colors.border}`,
            }}
          >
            {cat === 'all' ? '🌟 All' : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
          </button>
        ))}
      </div>

      {/* Symbols Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredSymbols.map(symbol => {
          const isExpanded = expandedSymbol === symbol.symbol
          const isFoundInDream = foundInDream.has(symbol.symbol)

          return (
            <Card
              key={symbol.symbol}
              className={`${isFoundInDream ? 'ring-2 ring-purple-500' : ''}`}
              interactive
              onClick={() => {
                setExpandedSymbol(isExpanded ? null : symbol.symbol)
                onSymbolClick?.(symbol)
              }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{CATEGORY_ICONS[symbol.category]}</span>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.textPrimary }}>
                        {symbol.symbol}
                        {isFoundInDream && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: colors.purple, color: colors.white }}>
                            In your dream
                          </span>
                        )}
                      </h3>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {CATEGORY_LABELS[symbol.category]}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg" style={{ color: colors.textMuted }}>
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </div>

                {/* Brief meaning */}
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {symbol.meaning}
                </p>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="space-y-4 pt-3 border-t" style={{ borderColor: colors.border }}>
                    {/* Interpretations */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
                        Common Interpretations
                      </h4>
                      <ul className="space-y-1">
                        {symbol.commonInterpretations.map((interp, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: colors.textSecondary }}>
                            <span style={{ color: colors.cyan }}>•</span>
                            {interp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Positive/Negative aspects */}
                    <div className="grid grid-cols-2 gap-3">
                      {symbol.positiveAspect && (
                        <div className="p-2 rounded-lg" style={{ background: `${colors.cyan}15` }}>
                          <p className="text-xs font-medium" style={{ color: colors.cyan }}>✨ Positive</p>
                          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{symbol.positiveAspect}</p>
                        </div>
                      )}
                      {symbol.negativeAspect && (
                        <div className="p-2 rounded-lg" style={{ background: `${colors.pink}15` }}>
                          <p className="text-xs font-medium" style={{ color: colors.pink }}>⚠️ Shadow</p>
                          <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{symbol.negativeAspect}</p>
                        </div>
                      )}
                    </div>

                    {/* Related symbols */}
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: colors.textMuted }}>
                        Related: {symbol.relatedSymbols.join(' • ')}
                      </p>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-1">
                      {symbol.keywords.slice(0, 6).map(kw => (
                        <span 
                          key={kw}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: colors.surface, color: colors.textMuted }}
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* No results */}
      {filteredSymbols.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🔮</p>
          <p className="font-medium" style={{ color: colors.textPrimary }}>No symbols found</p>
          <p className="text-sm" style={{ color: colors.textMuted }}>Try a different search term</p>
        </div>
      )}
    </div>
  )
}
