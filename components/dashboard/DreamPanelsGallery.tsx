"use client"

import Image from 'next/image'
import Card from '@/components/ui/Card'
import AspectRatio from '@/components/ui/AspectRatio'
import EmptyState from '@/components/EmptyState'
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
    <div className="space-y-6">
      {dreams.map((dream) => {
        const timestamp = dream.created_at || dream.date
        const formattedDate = timestamp
          ? new Date(timestamp).toLocaleDateString('en-US', DATE_FORMAT)
          : 'Unknown date'

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
          <div className="grid gap-4 md:grid-cols-2">
            {dream.panels.map((panel) => (
              <AspectRatio key={panel.id} ratio={2 / 1} className="rounded-xl overflow-hidden bg-black/20">
                {panel.image_url ? (
                  <Image
                    src={panel.image_url}
                    alt={panel.description || 'Dream panel'}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm" style={{ color: colors.textMuted }}>
                    Generating image…
                  </div>
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
