'use client'

import { useState } from 'react'
import { SignUp } from '@clerk/nextjs'
import { colors, gradients } from '@/lib/design'

export default function SignUpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-w-xl w-full">
        <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 rounded-2xl p-6">
          <div style={{ background: gradients.page }} className="p-4 rounded-lg">
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: `bg-[${colors.surface}] backdrop-blur-xl border border-purple-500/30 shadow-2xl`,
                }
              }}
            />
          </div>
          <button onClick={onClose} className="mt-2 text-sm text-gray-300">Close</button>
        </div>
      </div>
    </div>
  )
}
