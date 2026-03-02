import type { Moment } from '@/lib/types'
import { MomentCard } from './MomentCard'

type Props = {
  moments: Moment[]
  onViewInTranscript: (turnId: string) => void
}

export function MomentsList({ moments, onViewInTranscript }: Props) {
  const critical = moments.filter((m) => m.type === 'critical')
  const positive = moments.filter((m) => m.type === 'positive')

  return (
    <div className="mb-10">
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-4">
        Key moments
      </h2>

      {critical.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-neutral-400 mb-3 uppercase tracking-wide">
            To improve
          </p>
          <div className="space-y-3">
            {critical.map((m) => (
              <MomentCard
                key={m.turn_id + m.label}
                moment={m}
                onViewInTranscript={onViewInTranscript}
              />
            ))}
          </div>
        </div>
      )}

      {positive.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-400 mb-3 uppercase tracking-wide">
            What worked
          </p>
          <div className="space-y-3">
            {positive.map((m) => (
              <MomentCard
                key={m.turn_id + m.label}
                moment={m}
                onViewInTranscript={onViewInTranscript}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
