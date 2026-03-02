'use client'

import { useEffect, useState } from 'react'
import { getProgressRecords } from '@/lib/storage'
import type { ProgressRecord } from '@/lib/types'

export function ProgressTracker() {
  const [records, setRecords] = useState<ProgressRecord[]>([])

  useEffect(() => {
    setRecords(getProgressRecords())
  }, [])

  if (records.length === 0) return null

  return (
    <div className="mt-12">
      <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-3">
        Past uploads
      </h2>
      <div className="space-y-2">
        {records.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between py-2 border-b border-neutral-100"
          >
            <div>
              <span className="text-sm text-neutral-800">{r.speaker_name}</span>
              <span className="text-xs text-neutral-400 ml-2">
                {new Date(r.timestamp).toLocaleDateString()}
              </span>
            </div>
            <span className="text-sm font-medium tabular-nums">
              {r.total_score}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-400 mt-3">
        History is saved in this browser.{' '}
        <span className="text-neutral-500">Sign up to sync across devices.</span>
      </p>
    </div>
  )
}
