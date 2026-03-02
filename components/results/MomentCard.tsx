import type { Moment } from '@/lib/types'

type Props = {
  moment: Moment
  onViewInTranscript: (turnId: string) => void
}

export function MomentCard({ moment, onViewInTranscript }: Props) {
  const isPositive = moment.type === 'positive'

  return (
    <div className={`rounded-lg border p-4 ${
      isPositive ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-200'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1 ${
            isPositive
              ? 'bg-neutral-200 text-neutral-700'
              : 'bg-neutral-100 text-neutral-600'
          }`}>
            {isPositive ? 'What worked' : 'Improve'}
          </span>
          <h3 className="font-medium text-neutral-900 text-sm">{moment.label}</h3>
        </div>
        {moment.timestamp && (
          <span className="text-xs text-neutral-400 shrink-0 tabular-nums">
            {moment.timestamp}
          </span>
        )}
      </div>

      <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
        {moment.explanation}
      </p>

      {!isPositive && moment.rewrite && (
        <div className="bg-white border border-neutral-200 rounded p-3 mb-3">
          <p className="text-xs font-medium text-neutral-500 mb-1">Suggested rewrite</p>
          <p className="text-sm text-neutral-700 italic">"{moment.rewrite}"</p>
        </div>
      )}

      <button
        onClick={() => onViewInTranscript(moment.turn_id)}
        className="text-xs text-neutral-400 hover:text-neutral-700 underline underline-offset-2"
      >
        View in transcript
      </button>
    </div>
  )
}
