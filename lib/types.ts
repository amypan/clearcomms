export type { ConversationType, DimensionConfig, ConversationTypeConfig } from './conversation-types'

export type Speaker = {
  speaker_id: string
  display_name: string
  is_primary_user: boolean
}

export type TranscriptTurn = {
  turn_id: string
  speaker_id: string
  timestamp: string | null
  text: string
}

export type DimensionName =
  | 'Responsiveness'
  | 'Structure'
  | 'Listening'
  | 'Decision Drive'

export type Dimension = {
  name: DimensionName
  score: number
  explanation: string
}

export type Moment = {
  type: 'positive' | 'critical'
  label: string
  timestamp: string | null
  turn_id: string
  explanation: string
  rewrite: string
}

export type AnalysisResult = {
  total_score: number
  diagnostic_summary: string
  dimensions: Dimension[]
  moments: Moment[]
}

export type ClassificationResult = {
  conversation_type: import('./conversation-types').ConversationType
  confidence: 'high' | 'medium' | 'low'
  reasoning: string
}

export type CachedAnalysis = {
  hash: string
  timestamp: string
  speakers: Speaker[]
  turns: TranscriptTurn[]
  result: AnalysisResult
  conversation_type?: import('./conversation-types').ConversationType
}

export type ProgressRecord = {
  id: string
  timestamp: string
  speaker_name: string
  total_score: number
  dimension_scores: Record<string, number>
  conversation_type?: import('./conversation-types').ConversationType
}
