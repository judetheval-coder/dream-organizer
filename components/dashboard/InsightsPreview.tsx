"use client"

import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import ErrorBanner from '@/components/ui/ErrorBanner'

interface InsightsPreviewProps {
  insights: string | null
  analyzing: boolean
  onAnalyze: () => void
  hasDreams: boolean
  error?: string | null
}

export function InsightsPreview({ insights, analyzing, onAnalyze, hasDreams, error }: InsightsPreviewProps) {
  if (!hasDreams) {
    return (
      <Card>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Save at least one dream to unlock insights.
        </p>
      </Card>
    )
  }

  if (error) {
    return (
      <ErrorBanner title="Analysis failed" onRetry={onAnalyze}>
        {error}
      </ErrorBanner>
    )
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
            Dream Insights
          </p>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Summaries update whenever you re-run analysis.
          </p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={analyzing}
          className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-60"
          style={{
            background: gradients.button,
            color: colors.white,
          }}
        >
          {analyzing ? 'Analyzing...' : 'Run analysis'}
        </button>
      </div>
      {analyzing && <Skeleton className="h-32 w-full" />}
      {!analyzing && insights && (
        <p className="text-sm leading-relaxed" style={{ color: colors.textPrimary }}>
          {insights}
        </p>
      )}
      {!analyzing && !insights && (
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Insights help you understand recurring themes, moods, and symbols.
        </p>
      )}
    </Card>
  )
}

export default InsightsPreview
