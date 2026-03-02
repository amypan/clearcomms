'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSessionTurns,
  getSessionSpeakers,
  getSessionResult,
  setSessionResult,
  getCachedAnalysis,
  setCachedAnalysis,
  hashTranscript,
  getSessionTranscript,
  addProgressRecord,
} from '@/lib/storage'
import { ScoreHeader } from '@/components/results/ScoreHeader'
import { DimensionBreakdown } from '@/components/results/DimensionBreakdown'
import { MomentsList } from '@/components/results/MomentsList'
import { TranscriptModal } from '@/components/results/TranscriptModal'
import type { AnalysisResult, Speaker, TranscriptTurn } from '@/lib/types'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'done'
      result: AnalysisResult
      speakers: Speaker[]
      turns: TranscriptTurn[]
    }

export default function ResultsPage() {
  const router = useRouter()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [modalTurnId, setModalTurnId] = useState<string | null>(null)

  const runAnalysis = useCallback(async () => {
    const turns = getSessionTurns()
    const speakers = getSessionSpeakers()
    const rawTranscript = getSessionTranscript()

    if (!turns || !speakers || !rawTranscript) {
      router.replace('/')
      return
    }

    // Check cache first
    const hash = hashTranscript(rawTranscript)
    const cached = getCachedAnalysis(hash)
    if (cached) {
      setState({ status: 'done', result: cached.result, speakers: cached.speakers, turns: cached.turns })
      return
    }

    // Already have result from session (e.g. navigated back)
    const sessionResult = getSessionResult()
    if (sessionResult) {
      setState({ status: 'done', result: sessionResult, speakers, turns })
      return
    }

    // Call API
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turns, speakers }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        setState({ status: 'error', message: err.error ?? 'Analysis failed. Please try again.' })
        return
      }

      const result: AnalysisResult = await res.json()

      // Persist
      setSessionResult(result)
      const primarySpeaker = speakers.find((s) => s.is_primary_user)
      setCachedAnalysis({ hash, timestamp: new Date().toISOString(), speakers, turns, result })
      addProgressRecord({
        id: hash + Date.now(),
        timestamp: new Date().toISOString(),
        speaker_name: primarySpeaker?.display_name ?? 'Unknown',
        total_score: result.total_score,
        dimension_scores: Object.fromEntries(
          result.dimensions.map((d) => [d.name, d.score])
        ),
      })

      setState({ status: 'done', result, speakers, turns })
    } catch {
      setState({ status: 'error', message: 'Something went wrong. Please try again.' })
    }
  }, [router])

  useEffect(() => {
    runAnalysis()
  }, [runAnalysis])

  if (state.status === 'loading') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-4" />
          <p className="text-sm text-neutral-500">Analyzing your transcript...</p>
          <p className="text-xs text-neutral-400 mt-1">This takes 15–30 seconds</p>
        </div>
      </main>
    )
  }

  if (state.status === 'error') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-sm text-neutral-800 mb-4">{state.message}</p>
          <button
            onClick={runAnalysis}
            className="text-sm underline text-neutral-600 hover:text-neutral-900"
          >
            Try again
          </button>
          {' · '}
          <button
            onClick={() => router.push('/')}
            className="text-sm underline text-neutral-600 hover:text-neutral-900"
          >
            Start over
          </button>
        </div>
      </main>
    )
  }

  const { result, speakers, turns } = state
  const primarySpeaker = speakers.find((s) => s.is_primary_user)

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-neutral-400 hover:text-neutral-600"
          >
            ← New transcript
          </button>
          <button
            onClick={() => router.push('/assign')}
            className="text-sm text-neutral-400 hover:text-neutral-600"
          >
            Edit speakers
          </button>
        </div>

        <ScoreHeader
          score={result.total_score}
          speakerName={primarySpeaker?.display_name ?? 'Your'}
          summary={result.diagnostic_summary}
        />

        <DimensionBreakdown
          dimensions={result.dimensions}
          onViewMoments={(name) => {
            const moment = result.moments.find((m) =>
              m.label.toLowerCase().includes(name.toLowerCase().split(' ')[0])
            )
            if (moment) setModalTurnId(moment.turn_id)
          }}
        />

        <MomentsList
          moments={result.moments}
          onViewInTranscript={(turnId) => setModalTurnId(turnId)}
        />

        <TranscriptModal
          open={modalTurnId !== null}
          onClose={() => setModalTurnId(null)}
          focusTurnId={modalTurnId}
          turns={turns}
          speakers={speakers}
          moments={result.moments}
        />
      </div>
    </main>
  )
}
