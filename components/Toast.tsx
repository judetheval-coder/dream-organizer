"use client"

import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const colors = {
    success: 'from-[#03DAC6] to-[#00CEC9]',
    error: 'from-[#FF6B6B] to-[#FF5252]',
    info: 'from-[#5B2CFC] to-[#8A2BE2]',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
      <div className={`
        bg-gradient-to-r ${colors[type]} 
        text-white px-6 py-4 rounded-2xl shadow-2xl 
        flex items-center gap-3 min-w-[300px]
        backdrop-blur-xl border border-white/20
      `}>
        <span className="text-2xl font-bold">{icons[type]}</span>
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
