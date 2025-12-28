"use client"

import { useState } from 'react'
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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Dreams are pre-filtered by parent component to only include those with images
  if (!dreams.length) {
    return null // Parent handles empty state
  }

  return (
    <>
      <div className="space-y-8">
        {dreams.map((dream) => {
          const timestamp = dream.created_at || dream.date
          const formattedDate = timestamp
            ? new Date(timestamp).toLocaleDateString('en-US', DATE_FORMAT)
            : 'Unknown date'

          // Panels are pre-filtered by parent to only include those with images
          const panelsWithImages = dream.panels.filter(p => p.image_url)

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
                {panelsWithImages.map((panel) => (
                  <div
                    key={panel.id}
                    className="cursor-pointer group"
                    onClick={() => setLightboxImage(panel.image_url!)}
                  >
                    <AspectRatio
                      ratio={1}
                      className="rounded-xl overflow-hidden bg-black/20"
                    >
                      <Image
                        src={panel.image_url!}
                        alt={panel.description || 'Dream panel'}
                        fill
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {/* Magnify hint on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/70 rounded-full p-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </AspectRatio>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full aspect-square bg-black rounded-lg overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt="Enlarged panel"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white/60 text-xs">
            Click anywhere to close
          </div>
        </div>
      )}
    </>
  )
}

export default DreamPanelsGallery
