import type { DimensionName } from './types'

export type ConversationType =
  | 'decision_meeting'
  | 'status_update'
  | 'brainstorm'
  | 'presentation'
  | 'interview_qa'
  | '1on1'
  | 'customer_call'
  | 'other'

export type DimensionConfig = {
  name: DimensionName
  weight: number
  included: boolean
}

export type ConversationTypeConfig = {
  type: ConversationType
  label: string
  description: string
  dimensions: DimensionConfig[]
}

export const CONVERSATION_TYPE_CONFIGS: Record<ConversationType, ConversationTypeConfig> = {
  decision_meeting: {
    type: 'decision_meeting',
    label: 'Decision Meeting',
    description: 'A meeting focused on reaching a decision or getting alignment on a course of action.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.30, included: true },
      { name: 'Structure', weight: 0.25, included: true },
      { name: 'Listening', weight: 0.25, included: true },
      { name: 'Decision Drive', weight: 0.20, included: true },
    ],
  },
  status_update: {
    type: 'status_update',
    label: 'Status Update',
    description: 'A meeting to share progress, blockers, and current state of work.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.35, included: true },
      { name: 'Structure', weight: 0.35, included: true },
      { name: 'Listening', weight: 0.30, included: true },
      { name: 'Decision Drive', weight: 0, included: false },
    ],
  },
  brainstorm: {
    type: 'brainstorm',
    label: 'Brainstorm',
    description: 'An open-ended exploration session to generate ideas and creative solutions.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.35, included: true },
      { name: 'Structure', weight: 0.30, included: true },
      { name: 'Listening', weight: 0.35, included: true },
      { name: 'Decision Drive', weight: 0, included: false },
    ],
  },
  presentation: {
    type: 'presentation',
    label: 'Presentation',
    description: 'A structured presentation or pitch to an audience, followed by Q&A.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.15, included: true },
      { name: 'Structure', weight: 0.45, included: true },
      { name: 'Listening', weight: 0.20, included: true },
      { name: 'Decision Drive', weight: 0.20, included: true },
    ],
  },
  interview_qa: {
    type: 'interview_qa',
    label: 'Interview / Q&A',
    description: 'An interview or question-and-answer session where the speaker responds to questions.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.40, included: true },
      { name: 'Structure', weight: 0.35, included: true },
      { name: 'Listening', weight: 0.25, included: true },
      { name: 'Decision Drive', weight: 0, included: false },
    ],
  },
  '1on1': {
    type: '1on1',
    label: '1-on-1',
    description: 'A one-on-one meeting between two people, typically for check-ins or coaching.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.25, included: true },
      { name: 'Structure', weight: 0.25, included: true },
      { name: 'Listening', weight: 0.25, included: true },
      { name: 'Decision Drive', weight: 0.25, included: true },
    ],
  },
  customer_call: {
    type: 'customer_call',
    label: 'Customer Call',
    description: 'A call with a customer or client for support, sales, or relationship management.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.30, included: true },
      { name: 'Structure', weight: 0.25, included: true },
      { name: 'Listening', weight: 0.25, included: true },
      { name: 'Decision Drive', weight: 0.20, included: true },
    ],
  },
  other: {
    type: 'other',
    label: 'Other',
    description: 'A conversation that does not fit neatly into any of the above categories.',
    dimensions: [
      { name: 'Responsiveness', weight: 0.30, included: true },
      { name: 'Structure', weight: 0.25, included: true },
      { name: 'Listening', weight: 0.25, included: true },
      { name: 'Decision Drive', weight: 0.20, included: true },
    ],
  },
}

export function getActiveDimensions(type: ConversationType): DimensionConfig[] {
  return CONVERSATION_TYPE_CONFIGS[type].dimensions.filter((d) => d.included)
}
