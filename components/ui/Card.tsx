"use client"

import { ElementType, ReactNode } from 'react'
import { components, motion } from '@/lib/design'

interface CardProps {
  as?: ElementType
  children: ReactNode
  className?: string
  interactive?: boolean
  padding?: string
}

export function Card({
  as: Component = 'div',
  children,
  className = '',
  interactive = false,
  padding = 'p-6',
}: CardProps) {
  const baseClasses = [
    'rounded-2xl',
    'border',
    'backdrop-blur-md',
    'transition-all',
    interactive ? 'hover:-translate-y-1 hover:shadow-2xl' : '',
    className,
    padding,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component
      className={baseClasses}
      style={{
        background: components.card.background,
        border: components.card.border,
        boxShadow: components.card.shadow,
        transition: `transform ${motion.base}, box-shadow ${motion.base}`,
      }}
    >
      {children}
    </Component>
  )
}

export default Card
