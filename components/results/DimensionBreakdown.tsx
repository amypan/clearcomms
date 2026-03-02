import type { Dimension } from '@/lib/types'

type Props = {
  dimensions: Dimension[]
  onViewMoments: (dimensionName: string) => void
}

const WEIGHTS: Record<string, string> = {
  Responsiveness: '30%',
  Structure: '25%',
  Listening: '25%',
  'Decision Drive': '20%',
}

export function DimensionBreakdown({ dimensions, onViewMoments }: Props) {
  return (
    <div className="mb-10">
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
        Breakdown
      </h2>
      <div className="space-y-4">
        {dimensions.map((d) => (
          <div key={d.name} className="border border-neutral-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900 text-sm">{d.name}</span>
                <span className="text-xs text-neutral-400">{WEIGHTS[d.name]}</span>
              </div>
              <span className="text-lg font-semibold tabular-nums text-neutral-900">
                {d.score}
              </span>
            </div>
            {/* Score bar */}
            <div className="h-1 bg-neutral-100 rounded-full mb-2">
              <div
                className="h-1 bg-neutral-900 rounded-full transition-all"
                style={{ width: `${d.score}%` }}
              />
            </div>
            <p className="text-sm text-neutral-500">{d.explanation}</p>
            <button
              onClick={() => onViewMoments(d.name)}
              className="mt-2 text-xs text-neutral-400 hover:text-neutral-700 underline underline-offset-2"
            >
              View moments
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
