import type {
  CachedAnalysis,
  ProgressRecord,
  Speaker,
  TranscriptTurn,
  AnalysisResult,
} from './types'
import type { ConversationType } from './conversation-types'

const KEYS = {
  RAW_TRANSCRIPT: 'cc_raw_transcript',
  TURNS: 'cc_turns',
  SPEAKERS: 'cc_speakers',
  RESULT: 'cc_result',
  CONVERSATION_TYPE: 'cc_conversation_type',
  CACHE_PREFIX: 'cc_cache_',
  PROGRESS: 'cc_progress',
} as const

const MAX_CACHED = 10
const MAX_PROGRESS = 20

// ── Session (transcript flow state) ─────────────────────────────────────────

export function setSessionTranscript(text: string) {
  sessionStorage.setItem(KEYS.RAW_TRANSCRIPT, text)
}

export function getSessionTranscript(): string | null {
  return sessionStorage.getItem(KEYS.RAW_TRANSCRIPT)
}

export function setSessionTurns(turns: TranscriptTurn[]) {
  sessionStorage.setItem(KEYS.TURNS, JSON.stringify(turns))
}

export function getSessionTurns(): TranscriptTurn[] | null {
  const raw = sessionStorage.getItem(KEYS.TURNS)
  return raw ? JSON.parse(raw) : null
}

export function setSessionSpeakers(speakers: Speaker[]) {
  sessionStorage.setItem(KEYS.SPEAKERS, JSON.stringify(speakers))
}

export function getSessionSpeakers(): Speaker[] | null {
  const raw = sessionStorage.getItem(KEYS.SPEAKERS)
  return raw ? JSON.parse(raw) : null
}

export function setSessionResult(result: AnalysisResult) {
  sessionStorage.setItem(KEYS.RESULT, JSON.stringify(result))
}

export function getSessionResult(): AnalysisResult | null {
  const raw = sessionStorage.getItem(KEYS.RESULT)
  return raw ? JSON.parse(raw) : null
}

export function clearSessionResult() {
  sessionStorage.removeItem(KEYS.RESULT)
}

export function setSessionConversationType(type: ConversationType) {
  sessionStorage.setItem(KEYS.CONVERSATION_TYPE, type)
}

export function getSessionConversationType(): ConversationType | null {
  return sessionStorage.getItem(KEYS.CONVERSATION_TYPE) as ConversationType | null
}

export function clearSessionConversationType() {
  sessionStorage.removeItem(KEYS.CONVERSATION_TYPE)
}

// ── Cache (persisted analysis results) ──────────────────────────────────────

function hashTranscriptText(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36)
}

export function buildCacheKey(rawTranscript: string, conversationType: ConversationType): string {
  return `${hashTranscriptText(rawTranscript)}_${conversationType}`
}

export function getCachedAnalysis(key: string): CachedAnalysis | null {
  const raw = localStorage.getItem(KEYS.CACHE_PREFIX + key)
  return raw ? JSON.parse(raw) : null
}

export function setCachedAnalysis(analysis: CachedAnalysis) {
  // Enforce max cached entries
  const allKeys = getCacheKeys()
  if (allKeys.length >= MAX_CACHED) {
    // Remove oldest by timestamp
    const oldest = allKeys
      .map((k) => {
        const raw = localStorage.getItem(k)
        const parsed: CachedAnalysis | null = raw ? JSON.parse(raw) : null
        return { key: k, timestamp: parsed?.timestamp ?? '' }
      })
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]
    if (oldest) localStorage.removeItem(oldest.key)
  }
  localStorage.setItem(
    KEYS.CACHE_PREFIX + analysis.hash,
    JSON.stringify(analysis)
  )
}

function getCacheKeys(): string[] {
  return Object.keys(localStorage).filter((k) =>
    k.startsWith(KEYS.CACHE_PREFIX)
  )
}

// ── Progress records ─────────────────────────────────────────────────────────

export function getProgressRecords(): ProgressRecord[] {
  const raw = localStorage.getItem(KEYS.PROGRESS)
  return raw ? JSON.parse(raw) : []
}

export function addProgressRecord(record: ProgressRecord) {
  const records = getProgressRecords()
  records.unshift(record)
  if (records.length > MAX_PROGRESS) records.splice(MAX_PROGRESS)
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(records))
}
