'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TranscriptTurn, Speaker, Moment } from '@/lib/types'

type Props = {
  open: boolean
  onClose: () => void
  focusTurnId: string | null
  turns: TranscriptTurn[]
  speakers: Speaker[]
  moments: Moment[]
}

const CONTEXT_WINDOW = 5 // turns before and after

export function TranscriptModal({
  open,
  onClose,
  focusTurnId,
  turns,
  speakers,
  moments,
}: Props) {
  const speakerIndex = Object.fromEntries(
    speakers.map((s) => [s.speaker_id, s.display_name])
  )

  const focusIndex = turns.findIndex((t) => t.turn_id === focusTurnId)
  const start = Math.max(0, focusIndex - CONTEXT_WINDOW)
  const end = Math.min(turns.length - 1, focusIndex + CONTEXT_WINDOW)
  const visibleTurns = focusIndex >= 0 ? turns.slice(start, end + 1) : turns.slice(0, 15)

  const momentTurnIds = new Set(moments.map((m) => m.turn_id))
  const focusMoment = moments.find((m) => m.turn_id === focusTurnId)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Transcript</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {visibleTurns.map((turn) => {
            const isFocus = turn.turn_id === focusTurnId
            const isMoment = momentTurnIds.has(turn.turn_id)
            const name = speakerIndex[turn.speaker_id] ?? turn.speaker_id

            return (
              <div
                key={turn.turn_id}
                className={`rounded p-3 transition-colors ${
                  isFocus
                    ? 'bg-neutral-900 text-white'
                    : isMoment
                    ? 'bg-neutral-100'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${isFocus ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {name}
                  </span>
                  {turn.timestamp && (
                    <span className={`text-xs tabular-nums ${isFocus ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      {turn.timestamp}
                    </span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${isFocus ? 'text-white' : 'text-neutral-800'}`}>
                  {turn.text}
                </p>
              </div>
            )
          })}
        </div>

        {focusMoment && !focusMoment.type.includes('positive') && focusMoment.rewrite && (
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <p className="text-xs font-medium text-neutral-500 mb-2">Suggested rewrite</p>
            <p className="text-sm text-neutral-700 italic bg-neutral-50 rounded p-3">
              "{focusMoment.rewrite}"
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
