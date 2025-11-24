import { ReactNode } from 'react'

interface AspectRatioProps {
  ratio?: number
  className?: string
  children: ReactNode
}

export function AspectRatio({ ratio = 16 / 9, className = '', children }: AspectRatioProps) {
  return (
    <div className={['relative w-full', className].filter(Boolean).join(' ')} style={{ paddingTop: `${100 / ratio}%` }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

export default AspectRatio
