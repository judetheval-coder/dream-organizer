"use client"

import { useState, useCallback } from 'react'
import Panel from '@/components/Panel'
import { colors } from '@/lib/design'
import { useSwipe } from '@/hooks/useInteractions'

type PanelData = {
  id: string | number
  description: string
  style: string
  mood: string
  image?: string
}

type FrameStyle = 'minimal' | 'classic' | 'comic' | 'glow' | 'neon'

interface DraggablePanelGridProps {
  panels: PanelData[]
  onReorder?: (panels: PanelData[]) => void
  onImageReady?: (panelId: string | number, url: string) => void
  frameStyle?: FrameStyle
  enableEffects?: boolean
  enableDrag?: boolean
  currentIndex?: number
  onIndexChange?: (index: number) => void
}

export default function DraggablePanelGrid({
  panels,
  onReorder,
  onImageReady,
  frameStyle = 'glow',
  enableEffects = true,
  enableDrag = true,
  currentIndex = 0,
  onIndexChange,
}: DraggablePanelGridProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Swipe navigation for mobile
  const { handlers: swipeHandlers } = useSwipe({
    onSwipeLeft: () => {
      if (onIndexChange && currentIndex < panels.length - 1) {
        onIndexChange(currentIndex + 1)
      }
    },
    onSwipeRight: () => {
      if (onIndexChange && currentIndex > 0) {
        onIndexChange(currentIndex - 1)
      }
    },
  })

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (dragIndex === null || dragIndex === dropIndex || !onReorder) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    const newPanels = [...panels]
    const [draggedPanel] = newPanels.splice(dragIndex, 1)
    newPanels.splice(dropIndex, 0, draggedPanel)

    onReorder(newPanels)
    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex, panels, onReorder])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDragOverIndex(null)
  }, [])

  if (panels.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-12 rounded-2xl"
        style={{ background: colors.surface, border: `2px dashed ${colors.border}` }}
      >
        <p style={{ color: colors.textMuted }}>No panels yet. Generate some dream panels!</p>
      </div>
    )
  }

  return (
    <div
      className="space-y-6"
      {...swipeHandlers}
    >
      {/* Panel count and controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: colors.textMuted }} className="text-sm">
            {panels.length} panel{panels.length !== 1 ? 's' : ''}
          </span>
          {enableDrag && onReorder && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: colors.surface, color: colors.textMuted }}
            >
              Drag to reorder
            </span>
          )}
        </div>

        {/* Frame style selector could go here */}
      </div>

      {/* Panels grid */}
      <div className="grid gap-6 max-w-2xl mx-auto">
        {panels.map((panel, index) => (
          <div
            key={panel.id}
            className={`
              relative transition-all duration-200
              ${dragIndex === index ? 'opacity-50 scale-95' : ''}
              ${dragOverIndex === index && dragIndex !== index ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent' : ''}
            `}
            style={{
              transform: dragOverIndex === index && dragIndex !== index
                ? 'translateY(8px)'
                : 'none',
            }}
          >
            {/* Panel number badge */}
            <div
              className="absolute -top-3 -left-3 z-30 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: colors.purple,
                color: colors.white,
                boxShadow: `0 0 10px ${colors.purple}80`,
              }}
            >
              {index + 1}
            </div>

            <Panel
              description={panel.description}
              style={panel.style}
              mood={panel.mood}
              image={panel.image}
              frameStyle={frameStyle}
              enableEffects={enableEffects}
              draggable={enableDrag && !!onReorder}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => handleDragEnd()}
              dragIndex={index}
              onImageReady={(url) => onImageReady?.(panel.id, url)}
              generateDelay={index * 3000}
              sceneNumber={index + 1}
              totalScenes={panels.length}
            />
          </div>
        ))}
      </div>

      {/* Mobile swipe indicator */}
      <div className="md:hidden flex items-center justify-center gap-2 py-4">
        {panels.map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange?.(index)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: index === currentIndex ? colors.purple : colors.surface,
              transform: index === currentIndex ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
