"use client"

import { ElementType, ReactNode, CSSProperties, MouseEventHandler } from 'react'
import { components, motion } from '@/lib/design'

interface CardProps {
  as?: ElementType
  children: ReactNode
  className?: string
  interactive?: boolean
  padding?: string
  onClick?: MouseEventHandler<HTMLElement>
  style?: CSSProperties
}

export function Card({
  as: Component = 'div',
  children,
  className = '',
  interactive = false,
  padding = 'p-6',
  onClick,
  style: customStyle,
}: CardProps) {
  const baseClasses = [
    'rounded-2xl',
    'border',
    'backdrop-blur-md',
    'transition-all',
    interactive ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : '',
    className,
    padding,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      style={{
        background: components.card.background,
        border: components.card.border,
        boxShadow: components.card.shadow,
        transition: `transform ${motion.base}, box-shadow ${motion.base}`,
        ...customStyle,
      }}
    >
      {children}
    </Component>
  )
}

export default Card

