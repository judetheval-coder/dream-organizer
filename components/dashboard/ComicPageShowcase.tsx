"use client"

import { colors } from '@/lib/design'
import Card from '@/components/ui/Card'
import ComicGrid from '@/components/ComicGrid'

interface ComicPageShowcaseProps {
  scenes: string[]
  onImagesReady?: (images: string[]) => void
  initialImages?: string[]
  dreamId?: string
  isGenerating?: boolean
}

export function ComicPageShowcase({
  scenes,
  onImagesReady,
  initialImages,
  dreamId,
  isGenerating
}: ComicPageShowcaseProps) {
  if (!scenes.length) return null

  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            📖 Comic Page
          </p>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {scenes.length} panel{scenes.length > 1 ? 's' : ''} • White borders • Dynamic action
          </p>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-sm font-medium" style={{ color: colors.cyan }}>
              Generating...
            </span>
          </div>
        )}
      </div>

      <ComicGrid
        scenes={scenes}
        onAllImagesReady={onImagesReady}
        initialImages={initialImages}
        dreamId={dreamId}
      />
    </Card>
  )
}

export default ComicPageShowcase
