type Props = {
  score: number
  speakerName: string
  summary: string
}

export function ScoreHeader({ score, speakerName, summary }: Props) {
  return (
    <div className="mb-10">
      <p className="text-sm text-neutral-500 mb-1">{speakerName}</p>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-6xl font-semibold tabular-nums text-neutral-900">
          {score}
        </span>
        <span className="text-2xl text-neutral-400">/ 100</span>
      </div>
      <p className="text-neutral-600 leading-relaxed max-w-prose">{summary}</p>
    </div>
  )
}
