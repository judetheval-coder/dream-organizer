"use client"

import { useMemo, useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { isDreamPublished, publishDreamToGallery, unpublishDreamFromGallery } from '@/lib/social'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import Skeleton from '@/components/ui/Skeleton'
import EmptyState from '@/components/EmptyState'
import ShareButton from '@/components/ShareButton'
import { colors } from '@/lib/design'

export type DreamRecord = {
  id: string
  text: string
  created_at?: string
  date?: string
  style?: string
  mood?: string
  panels?: Array<{ id: string; image_url?: string }>
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

type SortOption = 'newest' | 'oldest' | 'withPanels'

type FilterOption = 'all' | 'hasPanels' | 'noPanels'

interface DreamListProps {
  dreams: DreamRecord[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onRemove?: (dreamId: string) => Promise<void> | void
}

export function DreamList({ dreams, loading = false, loadingMore = false, hasMore = false, onLoadMore, onRemove }: DreamListProps) {
  const [sort, setSort] = useState<SortOption>('newest')
  const [filter, setFilter] = useState<FilterOption>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useUser()
  const [publishedMap, setPublishedMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let mounted = true
    const loadPublished = async () => {
      try {
        const ids = dreams.map(d => d.id)
        const map: Record<string, boolean> = {}
        await Promise.all(ids.map(async id => {
          const published = await isDreamPublished(id)
          map[id] = published
        }))
        if (mounted) setPublishedMap(map)
      } catch {
        // noop
      }
    }
    loadPublished()
    return () => { mounted = false }
  }, [dreams])

  const processedDreams = useMemo(() => {
    let records = [...dreams]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      records = records.filter((dream) =>
        dream.text.toLowerCase().includes(query) ||
        dream.style?.toLowerCase().includes(query) ||
        dream.mood?.toLowerCase().includes(query)
      )
    }

    if (filter === 'hasPanels') {
      records = records.filter((dream) => dream.panels && dream.panels.length > 0)
    }

    if (filter === 'noPanels') {
      records = records.filter((dream) => !dream.panels || dream.panels.length === 0)
    }

    records.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || '').getTime() || 0
      const dateB = new Date(b.created_at || b.date || '').getTime() || 0

      if (sort === 'newest') return dateB - dateA
      if (sort === 'oldest') return dateA - dateB

      // sort === 'withPanels'
      const aHasPanels = a.panels && a.panels.length > 0 ? 1 : 0
      const bHasPanels = b.panels && b.panels.length > 0 ? 1 : 0
      return bHasPanels - aHasPanels
    })

    return records
  }, [dreams, filter, sort, searchQuery])

  const renderDate = (dream: DreamRecord) => {
    const timestamp = dream.created_at || dream.date
    if (!timestamp) return 'Unknown date'
    return new Date(timestamp).toLocaleDateString('en-US', DATE_FORMAT)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>
    )
  }

  if (!processedDreams.length) {
    return (
      <Card>
        <EmptyState
          icon="💤"
          title="No dreams yet"
          description="Record a dream from the dashboard to start building your gallery."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search dreams by text, style, or mood..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pl-11 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.textPrimary,
          }}
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(['all', 'hasPanels', 'noPanels'] as FilterOption[]).map((option) => (
            <Chip key={option} active={filter === option} onClick={() => setFilter(option)}>
              {option === 'all' && 'All dreams'}
              {option === 'hasPanels' && 'With panels'}
              {option === 'noPanels' && 'Without panels'}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 ml-auto text-sm">
          {(['newest', 'oldest', 'withPanels'] as SortOption[]).map((option) => (
            <Chip key={option} active={sort === option} onClick={() => setSort(option)}>
              {option === 'newest' && 'Newest'}
              {option === 'oldest' && 'Oldest'}
              {option === 'withPanels' && 'Panels first'}
            </Chip>
          ))}
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Found {processedDreams.length} dream{processedDreams.length !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
        </p>
      )}

      {processedDreams.map((dream) => (
        <Card key={dream.id} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold" style={{ color: colors.textMuted }}>
              {renderDate(dream)}
            </p>
            {dream.style && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: colors.textSecondary }}>
                {dream.style}
              </span>
            )}
          </div>
          <p className="text-base leading-relaxed" style={{ color: colors.textPrimary }}>
            {dream.text}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: colors.textSecondary }}>
            <span>
              {dream.panels?.length || 0} panel{dream.panels && dream.panels.length !== 1 ? 's' : ''}
            </span>
            {dream.mood && <span>• Mood: {dream.mood}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ShareButton
              dreamId={Number(dream.id)}
              title={dream.text.substring(0, 100)}
              description={dream.mood}
              imageUrl={dream.panels?.[0]?.image_url}
            />
            {user?.id && (
              <button
                type="button"
                onClick={async () => {
                  const id = dream.id
                  const wasPublished = publishedMap[id]
                  if (wasPublished) {
                    const resp = await unpublishDreamFromGallery(id, user.id)
                    if (resp.success) setPublishedMap(prev => ({ ...prev, [id]: false }))
                  } else {
                    const resp = await publishDreamToGallery(id, user.id)
                    if (resp.success) setPublishedMap(prev => ({ ...prev, [id]: true }))
                  }
                }}
                className="text-sm font-semibold underline underline-offset-4"
                style={{ color: publishedMap[dream.id] ? '#f87171' : colors.cyan }}
              >
                {publishedMap[dream.id] ? 'Unpublish' : 'Publish'}
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={() => dream.id && onRemove(dream.id)}
                className="text-sm font-semibold underline underline-offset-4"
                style={{ color: '#f87171' }}
              >
                Delete dream
              </button>
            )}
          </div>
        </Card>
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
            }}
          >
            {loadingMore ? 'Loading more…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}

export default DreamList
