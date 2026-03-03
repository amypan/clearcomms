'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseTranscript } from '@/lib/parser'
import {
  hashTranscript,
  setSessionTranscript,
  setSessionTurns,
  setSessionSpeakers,
  getCachedAnalysis,
  setSessionResult,
  clearSessionResult,
} from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Mode = 'drop' | 'paste'

export function TranscriptUploader() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>('drop')
  const [pasteText, setPasteText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleText(text: string) {
    const trimmed = text.trim()
    if (!trimmed) {
      setError('Transcript is empty.')
      return
    }

    const { turns, speakers } = parseTranscript(trimmed)

    if (speakers.length === 0) {
      setError(
        'No speaker labels detected. Make sure each line starts with a speaker name followed by a colon.'
      )
      return
    }

    const hash = hashTranscript(trimmed)
    const cached = getCachedAnalysis(hash)

    // Clear stale result before loading new transcript
    clearSessionResult()
    setSessionTranscript(trimmed)
    setSessionTurns(turns)

    if (cached) {
      // Use cached speakers + result, skip re-analysis
      setSessionSpeakers(cached.speakers)
      setSessionResult(cached.result)
      router.push('/results?cached=1')
    } else {
      setSessionSpeakers(speakers)
      router.push('/assign')
    }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => handleText(e.target?.result as string)
    reader.readAsText(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setMode('drop')}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            mode === 'drop'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          Upload file
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            mode === 'paste'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          }`}
        >
          Paste text
        </button>
      </div>

      {mode === 'drop' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-neutral-400 bg-neutral-50'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
        >
          <p className="text-sm text-neutral-500">
            Drop a <span className="font-medium text-neutral-700">.txt</span> transcript here, or click to browse
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Sarah: What's the timeline risk?\nJohn: So historically we've seen...`}
            className="min-h-48 font-mono text-sm resize-none"
          />
          <Button
            onClick={() => handleText(pasteText)}
            disabled={!pasteText.trim()}
            className="w-full"
          >
            Analyze transcript
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <p className="mt-4 text-xs text-neutral-400">
        Results are available for this session.{' '}
        <span className="text-neutral-500">Sign up to save history across sessions.</span>
      </p>
    </div>
  )
}
