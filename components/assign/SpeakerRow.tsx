'use client'

import { Input } from '@/components/ui/input'
import type { Speaker } from '@/lib/types'

type Props = {
  speaker: Speaker
  onNameChange: (id: string, name: string) => void
  onSelectPrimary: (id: string) => void
  onRemove: (id: string) => void
  canRemove: boolean
}

export function SpeakerRow({ speaker, onNameChange, onSelectPrimary, onRemove, canRemove }: Props) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
        speaker.is_primary_user
          ? 'border-neutral-900 bg-neutral-50'
          : 'border-neutral-200'
      }`}
    >
      <input
        type="radio"
        name="primary_speaker"
        checked={speaker.is_primary_user}
        onChange={() => onSelectPrimary(speaker.speaker_id)}
        className="mt-0.5 shrink-0 accent-neutral-900"
        aria-label={`Select ${speaker.display_name} as primary speaker`}
      />
      <div className="flex-1 min-w-0">
        <Input
          value={speaker.display_name}
          onChange={(e) => onNameChange(speaker.speaker_id, e.target.value)}
          className="h-8 text-sm"
          placeholder="Speaker name"
        />
      </div>
      {speaker.is_primary_user && (
        <span className="text-xs text-neutral-500 shrink-0">This is me</span>
      )}
      {canRemove && (
        <button
          onClick={() => onRemove(speaker.speaker_id)}
          className="text-neutral-300 hover:text-neutral-600 shrink-0 transition-colors text-lg leading-none"
          aria-label={`Remove ${speaker.display_name}`}
        >
          ×
        </button>
      )}
    </div>
  )
}
