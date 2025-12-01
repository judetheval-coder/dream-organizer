"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { colors } from '@/lib/design'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import FrameStyleSelector from '@/components/FrameStyleSelector'


const DraggablePanelGrid = dynamic(() => import('@/components/DraggablePanelGrid'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
})

type FrameStyle = 'minimal' | 'classic' | 'comic' | 'glow' | 'neon'

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
  onReorder?: (panels: PanelPreview[]) => void
}

export function PanelShowcase({ panels, currentGeneratingIndex, onImageReady, onReorder }: PanelShowcaseProps) {
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('minimal')
  const [enableEffects, setEnableEffects] = useState(true)
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0)

  if (!panels.length) return null

  // Convert panels to format expected by DraggablePanelGrid
  const panelsForGrid = panels.map(p => ({
    ...p,
    id: String(p.id),
  }))

  const handleReorder = (reorderedPanels: Array<{ id: string | number; description: string; style: string; mood: string; image?: string }>) => {
    if (onReorder) {
      const reorderedWithNumericIds = reorderedPanels.map(p => ({
        ...p,
        id: Number(p.id),
      }))
      onReorder(reorderedWithNumericIds)
    }
  }

  return (
    <Card className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Generated Panels
          </p>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Drag to reorder • Swipe on mobile • Hover for 3D effects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
            <input
              type="checkbox"
              checked={enableEffects}
              onChange={(e) => setEnableEffects(e.target.checked)}
              className="accent-purple-500"
            />
            3D Effects
          </label>
        </div>
      </div>

      {/* Frame Style Selector */}
      <FrameStyleSelector 
        value={frameStyle} 
        onChange={setFrameStyle} 
      />

      {/* Panels Grid with drag/drop and swipe */}
      <DraggablePanelGrid
        panels={panelsForGrid}
        onReorder={handleReorder}
        onImageReady={(id, url) => onImageReady(Number(id), url)}
        frameStyle={frameStyle}
        enableEffects={enableEffects}
        enableDrag={true}
        currentIndex={currentPanelIndex}
        onIndexChange={setCurrentPanelIndex}
      />

      {currentGeneratingIndex >= 0 && currentGeneratingIndex < panels.length && (
        <p className="text-sm font-semibold" style={{ color: colors.cyan }}>
          ✨ Generating scene {currentGeneratingIndex + 1} of {panels.length}
        </p>
      )}
    </Card>
  )
}

export default PanelShowcase
