import type { Dimension } from '@/lib/types'
import type { ConversationType } from '@/lib/conversation-types'
import { CONVERSATION_TYPE_CONFIGS } from '@/lib/conversation-types'

type Props = {
  dimensions: Dimension[]
  conversationType: ConversationType
  onViewMoments: (dimensionName: string) => void
}

export function DimensionBreakdown({ dimensions, conversationType, onViewMoments }: Props) {
  const dimConfigs = CONVERSATION_TYPE_CONFIGS[conversationType].dimensions
  const weightMap = Object.fromEntries(
    dimConfigs.map((d) => [d.name, Math.round(d.weight * 100)])
  )

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
                <span className="text-xs text-neutral-400">{weightMap[d.name]}%</span>
              </div>
              <span className="text-lg font-semibold tabular-nums text-neutral-900">
                {d.score} / 100
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
