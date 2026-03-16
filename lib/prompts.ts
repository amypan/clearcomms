import type { Speaker, TranscriptTurn } from './types'
import { type ConversationType, CONVERSATION_TYPE_CONFIGS, getActiveDimensions } from './conversation-types'

const DIMENSION_CRITERIA: Record<string, string> = {
  Responsiveness: [
    '   - Did the speaker directly answer questions asked?',
    '   - Penalties: leading with background before answering, deflection, re-asked questions',
    '   - Rewards: direct answer appears early, explicit commitment language',
  ].join('\n'),
  Structure: [
    '   - Did the speaker communicate top-down and logically?',
    '   - Penalties: long preamble before main point, idea stacking, topic drift',
    '   - Rewards: clear thesis early, grouping language, logical transitions',
  ].join('\n'),
  Listening: [
    '   - Did the speaker detect and resolve confusion?',
    '   - Penalties: repeating original explanation unchanged after confusion cues',
    '   - Rewards: clarification, reframing, diagnostic questions after confusion',
  ].join('\n'),
  'Decision Drive': [
    '   - Did the speaker move toward clarity or action?',
    '   - Penalties: ending on analysis, no recap, no ownership framing',
    '   - Rewards: clear ask, ownership assignment, timeline statements, explicit next steps',
  ].join('\n'),
}

export function buildSystemPrompt(type: ConversationType): string {
  const config = CONVERSATION_TYPE_CONFIGS[type]
  const active = getActiveDimensions(type)

  const dimensionsSection = active
    .map((d, i) => {
      const weightPct = Math.round(d.weight * 100)
      return `${i + 1}. ${d.name} (weight: ${d.weight.toFixed(2)} = ${weightPct}%)\n${DIMENSION_CRITERIA[d.name]}`
    })
    .join('\n\n')

  const totalScoreFormula = active
    .map((d) => `(${d.name} × ${d.weight.toFixed(2)})`)
    .join(' + ')

  const dimensionNameUnion = active
    .map((d) => `"${d.name}"`)
    .join(' | ')

  return `You are a communication analysis engine. You analyze meeting transcripts and score speakers on communication clarity.

You will receive a list of speakers and a transcript. Your job is to score the PRIMARY speaker only.

This is a ${config.label}: ${config.description} Evaluate the speaker within that context.

Return a single JSON object. No explanation, no markdown — only raw JSON.

## Scoring Dimensions

${dimensionsSection}

## Total Score
total_score = round(${totalScoreFormula})

## Score Calibration

All scores are integers 0–100. Do not use 0–10 scale.

Use the full range. Do not default to the middle:
- 0–20: Severely dysfunctional — communication actively hinders understanding
- 21–40: Significantly below standard — frequent patterns of confusion or evasion
- 41–55: Below average — noticeable weaknesses, some redeeming moments
- 56–69: Average professional — this is where most real conversations land
- 70–79: Good — clear communicator with minor gaps
- 80–89: Strong — consistently effective, rare lapses only
- 90–100: Exceptional — rare, only for truly outstanding communication

Do not cluster scores in the 65–75 range. If performance is average, scores should be in the 56–69 band. Reserve 70+ for genuinely above-average performance.

## Moments
- Return 3–5 moments total mixing "positive" and "critical"
- Each moment must reference a specific turn_id from the transcript
- Rewrites must rewrite the speaker's actual words using the real content discussed — not generic advice
- Explanations must be specific to this transcript — no generic feedback

## JSON Schema
{
  "total_score": number (integer 0–100),
  "diagnostic_summary": "string — 1-2 sentences, specific to this transcript, no fluff",
  "dimensions": [
    {
      "name": ${dimensionNameUnion},
      "score": number (integer 0–100),
      "explanation": "string — 1 sentence, specific to this transcript"
    }
  ],
  "moments": [
    {
      "type": "positive" | "critical",
      "label": "string — short label e.g. 'Missed Direct Answer'",
      "timestamp": "string | null",
      "turn_id": "string — must match a turn_id in the transcript",
      "explanation": "string — 2-3 sentences, specific to this transcript",
      "rewrite": "string — concrete rewrite using the actual content discussed"
    }
  ]
}`
}

export function buildUserPrompt(
  turns: TranscriptTurn[],
  speakers: Speaker[]
): string {
  const primarySpeaker = speakers.find((s) => s.is_primary_user)
  const speakerIndex = Object.fromEntries(
    speakers.map((s) => [s.speaker_id, s.display_name])
  )

  const speakerList = speakers
    .map(
      (s) =>
        `- ${s.display_name} (id: ${s.speaker_id})${s.is_primary_user ? ' ← PRIMARY — score this speaker' : ''}`
    )
    .join('\n')

  const transcriptLines = turns
    .map((t) => {
      const name = speakerIndex[t.speaker_id] ?? t.speaker_id
      const ts = t.timestamp ? `[${t.timestamp}] ` : ''
      return `[${t.turn_id}] ${ts}${name}: ${t.text}`
    })
    .join('\n')

  return `Speakers:
${speakerList}

Primary speaker to score: ${primarySpeaker?.display_name ?? 'unknown'} (id: ${primarySpeaker?.speaker_id})

Transcript:
${transcriptLines}`
}
