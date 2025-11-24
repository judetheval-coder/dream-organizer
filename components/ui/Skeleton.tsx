"use client"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  const classes = [
    'animate-pulse',
    'rounded-lg',
    'bg-white/5',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes} role="presentation" aria-hidden="true" />
}

export default Skeleton
