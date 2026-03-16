'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSessionTurns,
  getSessionSpeakers,
  setSessionConversationType,
  clearSessionResult,
} from '@/lib/storage'
import { ConversationTypeSelector } from '@/components/classify/ConversationTypeSelector'
import { Button } from '@/components/ui/button'
import type { ConversationType } from '@/lib/conversation-types'
import type { ClassificationResult } from '@/lib/types'

type PageState = 'classifying' | 'ready' | 'error'

export default function ClassifyPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('classifying')
  const [detectedType, setDetectedType] = useState<ConversationType | null>(null)
  const [selectedType, setSelectedType] = useState<ConversationType>('other')

  useEffect(() => {
    const turns = getSessionTurns()
    const speakers = getSessionSpeakers()

    if (!turns || !speakers) {
      router.replace('/')
      return
    }

    async function classify() {
      try {
        const res = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ turns, speakers }),
        })

        if (!res.ok) throw new Error('Classification failed')

        const data: ClassificationResult = await res.json()
        setDetectedType(data.conversation_type)
        setSelectedType(data.conversation_type)
        setPageState('ready')
      } catch {
        setPageState('error')
      }
    }

    classify()
  }, [router])

  function handleAnalyze() {
    clearSessionResult()
    setSessionConversationType(selectedType)
    router.push('/results')
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-16">
        <button
          onClick={() => router.push('/assign')}
          className="text-sm text-neutral-400 hover:text-neutral-600 mb-8 flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-neutral-900">
            What type of conversation is this?
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {pageState === 'classifying'
              ? 'Detecting conversation type...'
              : pageState === 'error'
              ? 'Could not auto-detect. Select a type to continue.'
              : 'We detected the type below. Correct it if needed.'}
          </p>
        </div>

        {pageState === 'classifying' ? (
          <div className="flex items-center gap-3 py-8">
            <div className="inline-block w-5 h-5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
            <span className="text-sm text-neutral-500">Detecting...</span>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <ConversationTypeSelector
                selected={selectedType}
                detectedType={detectedType}
                onChange={setSelectedType}
              />
            </div>

            <Button onClick={handleAnalyze} className="w-full">
              Analyze
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
