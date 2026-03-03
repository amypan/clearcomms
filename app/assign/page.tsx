'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSessionTurns,
  getSessionSpeakers,
  setSessionSpeakers,
} from '@/lib/storage'
import { SpeakerRow } from '@/components/assign/SpeakerRow'
import { Button } from '@/components/ui/button'
import type { Speaker } from '@/lib/types'

export default function AssignPage() {
  const router = useRouter()
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const turns = getSessionTurns()
    const s = getSessionSpeakers()
    if (!turns || !s || s.length === 0) {
      router.replace('/')
      return
    }
    setSpeakers(s)
    setReady(true)
  }, [router])

  function handleNameChange(id: string, name: string) {
    setSpeakers((prev) =>
      prev.map((s) => (s.speaker_id === id ? { ...s, display_name: name } : s))
    )
  }

  function handleSelectPrimary(id: string) {
    setSpeakers((prev) =>
      prev.map((s) => ({ ...s, is_primary_user: s.speaker_id === id }))
    )
  }

  function handleRemove(id: string) {
    setSpeakers((prev) => prev.filter((s) => s.speaker_id !== id))
  }

  function handleContinue() {
    setSessionSpeakers(speakers)
    router.push('/results')
  }

  const hasPrimary = speakers.some((s) => s.is_primary_user)

  if (!ready) return null

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-16">
        <button
          onClick={() => router.push('/')}
          className="text-sm text-neutral-400 hover:text-neutral-600 mb-8 flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-neutral-900">
            Who&apos;s in this transcript?
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Select which speaker is you. You can rename any speaker before continuing.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {speakers.map((speaker) => (
            <SpeakerRow
              key={speaker.speaker_id}
              speaker={speaker}
              onNameChange={handleNameChange}
              onSelectPrimary={handleSelectPrimary}
              onRemove={handleRemove}
              canRemove={speakers.length > 1}
            />
          ))}
        </div>

        {speakers.length === 1 && !hasPrimary && (
          <p className="text-xs text-neutral-400 mb-4">
            Single speaker detected — this may be a practice recording.
          </p>
        )}

        <Button
          onClick={handleContinue}
          disabled={!hasPrimary}
          className="w-full"
        >
          Analyze
        </Button>

        {!hasPrimary && (
          <p className="mt-2 text-xs text-center text-neutral-400">
            Select which speaker is you to continue.
          </p>
        )}
      </div>
    </main>
  )
}
