"use client"

import { ButtonHTMLAttributes } from 'react'
import { components, motion } from '@/lib/design'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active = false, className = '', children, ...props }: ChipProps) {
  const classes = [
    'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
    active ? 'scale-105' : 'opacity-80 hover:opacity-100',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      {...props}
      className={classes}
      style={{
        background: active ? components.chip.activeBackground : components.chip.background,
        color: active ? components.chip.activeColor : components.chip.color,
        transition: `transform ${motion.base}, opacity ${motion.base}`,
      }}
    >
      {children}
    </button>
  )
}

export default Chip
