"use client"

import { ElementType, ReactNode, CSSProperties, MouseEventHandler, ButtonHTMLAttributes } from 'react'
import { colors, components, motion, gradients, shadows } from '@/lib/design'

// ============= CARD =============
interface CardProps {
  as?: ElementType
  children: ReactNode
  className?: string
  interactive?: boolean
  padding?: string
  onClick?: MouseEventHandler<HTMLElement>
  style?: CSSProperties
}

export function Card({ as: C = 'div', children, className = '', interactive, padding = 'p-6', onClick, style }: CardProps) {
  return (
    <C
      className={`rounded-2xl border backdrop-blur-md transition-all ${interactive ? 'hover:-translate-y-1 hover:shadow-2xl cursor-pointer' : ''} ${padding} ${className}`}
      onClick={onClick}
      style={{ background: components.card.background, border: components.card.border, boxShadow: components.card.shadow, transition: `transform ${motion.base}, box-shadow ${motion.base}`, ...style }}
    >
      {children}
    </C>
  )
}

// ============= CHIP =============
interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active, className = '', children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      {...props}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${active ? 'scale-105' : 'opacity-80 hover:opacity-100'} ${className}`}
      style={{ background: active ? components.chip.activeBackground : components.chip.background, color: active ? components.chip.activeColor : components.chip.color }}
    >
      {children}
    </button>
  )
}

// ============= BUTTON =============
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'contrast'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

const BTN_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: { background: gradients.button, color: colors.white, boxShadow: shadows.glowCyan || shadows.glow },
  secondary: { background: colors.surface, color: colors.textPrimary, border: `1px solid ${colors.border}` },
  ghost: { background: 'transparent', color: colors.textMuted },
  danger: { background: '#dc2626', color: 'white' },
  contrast: { background: colors.white, color: colors.purple, border: `2px solid ${colors.purple}`, boxShadow: shadows.glow },
}
const BTN_SIZES = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' }

export function Button({ variant = 'primary', size = 'md', icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[rgba(6,182,212,0.25)] hover:scale-105 hover:shadow-lg active:scale-95 ${BTN_SIZES[size]} ${className}`}
      style={BTN_STYLES[variant]}
    >
      {icon && <span className="mr-2">{icon}</span>}{children}
    </button>
  )
}

// ============= CONTAINER =============
export function Container({ as: C = 'div', className = '', children }: { as?: ElementType; className?: string; children: ReactNode }) {
  return <C className={`mx-auto w-full max-w-6xl px-6 md:px-10 ${className}`}>{children}</C>
}

// ============= SECTION =============
export function Section({ id, className = '', children }: { id?: string; className?: string; children: ReactNode }) {
  return <section id={id} className={`py-24 ${className}`} style={{ scrollMarginTop: '90px' }}>{children}</section>
}

// ============= ASPECT RATIO =============
export function AspectRatio({ ratio = 16 / 9, className = '', children }: { ratio?: number; className?: string; children: ReactNode }) {
  return (
    <div className={`relative w-full ${className}`} style={{ paddingTop: `${100 / ratio}%` }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

// ============= SPINNER =============
export function Spinner({ label = 'Loading', size = 48 }: { label?: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status">
      <div className="rounded-full border-4 animate-spin" style={{ width: size, height: size, borderColor: colors.purple, borderTopColor: colors.cyan }} />
      <span className="text-sm" style={{ color: colors.textSecondary }}>{label}</span>
    </div>
  )
}

// ============= ERROR BANNER =============
export function ErrorBanner({ title = 'Something went wrong', children, onRetry, className = '' }: { title?: string; children?: ReactNode; onRetry?: () => void; className?: string }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between ${className}`} role="alert" style={{ background: gradients.card, borderColor: colors.pink, color: colors.textPrimary }}>
      <div>
        <p className="font-semibold">{title}</p>
        {children && <p className="text-sm text-white/70">{children}</p>}
      </div>
      {onRetry && <Button variant="primary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  )
}

// ============= EMPTY STATE =============
export function EmptyState({ icon = '✨', title, description, action }: { icon?: string; title: string; description: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {/* Friendly animated illustration */}
      <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 animate-pulse-slow rounded-full bg-gradient-to-br from-[#7c3aed] via-[#06b6d4] to-[#ec4899] opacity-20" />
        <div className="absolute -top-3 -left-3 animate-float">
          <span className="text-2xl">🌙</span>
        </div>
        <div className="absolute -bottom-2 -right-2 animate-bounce">
          <span className="text-xl">✨</span>
        </div>
        <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-dashed border-cyan-300 bg-white/10 shadow-lg">
          <span className="text-5xl opacity-60 select-none">{icon}</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>{title}</h3>
      <p className="text-base max-w-md mb-6" style={{ color: colors.textMuted }}>
        {description}
        <br />
        <span className="block mt-2 text-sm text-cyan-400 animate-fadeIn">Tip: You can always start by clicking the button below or exploring the menu!</span>
      </p>
      {action && <Button onClick={action.onClick} className="animate-wiggle" icon={<span>🌟</span>}>{action.label}</Button>}
    </div>
  )
}

// ============= STAT CARD =============
type StatColor = 'purple' | 'cyan' | 'pink'
const STAT_COLORS: Record<StatColor, { from: string; to: string }> = {
  purple: { from: colors.purple, to: colors.purpleLight },
  cyan: { from: colors.cyan, to: colors.cyanLight },
  pink: { from: colors.pink, to: '#f472b6' },
}

export function StatCard({ icon, label, value, trend, color = 'purple' }: { icon: string; label: string; value: string | number; trend?: string; color?: StatColor }) {
  const c = STAT_COLORS[color]
  return (
    <div className="p-6 rounded-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-105" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, ${c.from}10 0%, ${c.to}10 100%)` }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          {trend && <span className="text-xs px-2 py-1 rounded-full" style={{ background: colors.backgroundDark, color: colors.cyan }}>{trend}</span>}
        </div>
        <div className="text-3xl font-bold mb-1" style={{ color: colors.textPrimary }}>{value}</div>
        <div className="text-sm" style={{ color: colors.textMuted }}>{label}</div>
      </div>
    </div>
  )
}

// ============= SKELETON =============
type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card'
const SK_V = { text: 'h-4 rounded', circular: 'rounded-full', rectangular: 'rounded-lg', card: 'rounded-2xl' }

export function Skeleton({ className = '', variant = 'rectangular', width, height, count = 1 }: { className?: string; variant?: SkeletonVariant; width?: string | number; height?: string | number; count?: number }) {
  const w = typeof width === 'number' ? `${width}px` : width || '100%'
  const h = typeof height === 'number' ? `${height}px` : height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px')
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse ${SK_V[variant]} ${className}`} style={{ background: `linear-gradient(90deg, ${colors.surface} 0%, ${colors.surfaceLight} 50%, ${colors.surface} 100%)`, width: w, height: h, marginBottom: count > 1 ? '0.5rem' : 0 }} />
      ))}
    </>
  )
}

export function DreamCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 space-y-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1"><Skeleton variant="text" width="60%" /><Skeleton variant="text" width="40%" className="mt-2" /></div>
      </div>
      <Skeleton variant="text" count={3} />
      <div className="flex gap-2 mt-4"><Skeleton variant="rectangular" width={80} height={32} /><Skeleton variant="rectangular" width={80} height={32} /></div>
    </div>
  )
}

export function PanelSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <Skeleton variant="rectangular" height={200} />
      <div className="p-4"><Skeleton variant="text" count={2} /></div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
      <Skeleton variant="text" width="40%" /><Skeleton variant="text" width="60%" height={32} className="mt-2" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4"><DreamCardSkeleton /><DreamCardSkeleton /></div>
        <div className="space-y-4"><PanelSkeleton /><PanelSkeleton /></div>
      </div>
    </div>
  )
}

// Re-export for backwards compatibility
export default Card
