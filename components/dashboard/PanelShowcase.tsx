"use client"

import dynamic from 'next/dynamic'
import { colors } from '@/lib/design'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'

const Panel = dynamic(() => import('@/components/Panel'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
})

type PanelPreview = {
  id: number
  description: string
  style: string
  mood: string
  image?: string
}

interface PanelShowcaseProps {
  panels: PanelPreview[]
  currentGeneratingIndex: number
  onImageReady: (panelId: number, url: string) => void
}

export function PanelShowcase({ panels, currentGeneratingIndex, onImageReady }: PanelShowcaseProps) {
  if (!panels.length) return null

  return (
    <Card className="space-y-6">
      <div>
        <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          Generated Panels
        </p>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Scenes render one at a time to keep things stable.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {panels.map((panel, idx) => (
          <Panel
            key={panel.id}
            {...panel}
            generateDelay={0}
            shouldGenerate={currentGeneratingIndex === idx}
            onImageReady={(url) => onImageReady(panel.id, url)}
          />
        ))}
      </div>
      {currentGeneratingIndex >= 0 && currentGeneratingIndex < panels.length && (
        <p className="text-sm font-semibold" style={{ color: colors.cyan }}>
          ✨ Generating scene {currentGeneratingIndex + 1} of {panels.length}
        </p>
      )}
    </Card>
  )
}

export default PanelShowcase
