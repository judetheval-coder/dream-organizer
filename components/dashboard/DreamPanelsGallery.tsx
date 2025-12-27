"use client"

import Image from 'next/image'
import Card from '@/components/ui/Card'
import AspectRatio from '@/components/ui/AspectRatio'
import EmptyState from '@/components/EmptyState'
import ComicGrid from '@/components/ComicGrid'
import { colors } from '@/lib/design'

interface DreamPanelsGalleryProps {
  dreams: Array<{
    id: string
    text: string
    panels: Array<{ id: string; image_url?: string | null; description?: string }>
    created_at?: string
    date?: string
  }>
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

export function DreamPanelsGallery({ dreams }: DreamPanelsGalleryProps) {
  if (!dreams.length) {
    return (
      <Card>
        <EmptyState
          icon="📚"
          title="No comic panels yet"
          description="Generate a new dream comic to see your panels here."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {dreams.map((dream) => {
        const timestamp = dream.created_at || dream.date
        const formattedDate = timestamp
          ? new Date(timestamp).toLocaleDateString('en-US', DATE_FORMAT)
          : 'Unknown date'

        // Check if all panels have images (complete) or some are missing (incomplete)
        const allPanelsComplete = dream.panels.every(p => p.image_url)
        const hasAnyImages = dream.panels.some(p => p.image_url)

        // If panels are incomplete (missing images), use ComicGrid to generate them
        if (!allPanelsComplete) {
          const scenes = dream.panels.map(p => p.description || dream.text.slice(0, 200))
          const existingImages = dream.panels.map(p => p.image_url || '')

          return (
            <div key={dream.id} className="space-y-4">
              <div className="px-2">
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  {formattedDate}
                </p>
                <p className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                  {dream.text.length > 140 ? `${dream.text.slice(0, 140)}…` : dream.text}
                </p>
              </div>
              <ComicGrid
                scenes={scenes}
                initialImages={existingImages}
                dreamId={dream.id}
              />
            </div>
          )
        }

        // If all panels are complete, show the static gallery view
        return (
          <Card key={dream.id} className="space-y-4">
            <div>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {formattedDate}
              </p>
              <p className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                {dream.text.length > 140 ? `${dream.text.slice(0, 140)}…` : dream.text}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dream.panels.map((panel) => (
                <AspectRatio key={panel.id} ratio={1} className="rounded-xl overflow-hidden bg-black/20">
                  {panel.image_url && (
                    <Image
                      src={panel.image_url}
                      alt={panel.description || 'Dream panel'}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </AspectRatio>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default DreamPanelsGallery
