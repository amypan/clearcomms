import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { TranscriptTurn, Speaker, ClassificationResult } from '@/lib/types'
import type { ConversationType } from '@/lib/conversation-types'

const client = new Anthropic()

const CLASSIFY_SYSTEM_PROMPT = `You are a conversation classifier. Given the first portion of a meeting transcript, identify the conversation type.

Return a single JSON object. No explanation, no markdown — only raw JSON.

## Conversation Types
- decision_meeting: Focused on reaching a decision or getting alignment
- status_update: Sharing progress, blockers, or current state of work
- brainstorm: Open-ended exploration to generate ideas or solutions
- presentation: Structured presentation or pitch to an audience
- interview_qa: Interview or Q&A where speaker responds to questions
- 1on1: One-on-one check-in or coaching session
- customer_call: Call with a customer or client
- other: Does not fit any of the above

## JSON Schema
{
  "conversation_type": "decision_meeting" | "status_update" | "brainstorm" | "presentation" | "interview_qa" | "1on1" | "customer_call" | "other",
  "confidence": "high" | "medium" | "low",
  "reasoning": "string — 1 sentence explaining the classification"
}`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { turns, speakers } = body as {
      turns: TranscriptTurn[]
      speakers: Speaker[]
    }

    if (!turns?.length || !speakers?.length) {
      return NextResponse.json(
        { error: 'Missing turns or speakers' },
        { status: 400 }
      )
    }

    const speakerIndex = Object.fromEntries(
      speakers.map((s) => [s.speaker_id, s.display_name])
    )

    const excerpt = turns
      .slice(0, 30)
      .map((t) => {
        const name = speakerIndex[t.speaker_id] ?? t.speaker_id
        const ts = t.timestamp ? `[${t.timestamp}] ` : ''
        return `[${t.turn_id}] ${ts}${name}: ${t.text}`
      })
      .join('\n')

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: CLASSIFY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Transcript excerpt:\n${excerpt}` }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const jsonText = content.text
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/, '')
      .trim()

    const raw = JSON.parse(jsonText)

    const validTypes: ConversationType[] = [
      'decision_meeting', 'status_update', 'brainstorm', 'presentation',
      'interview_qa', '1on1', 'customer_call', 'other',
    ]
    if (!validTypes.includes(raw.conversation_type)) {
      raw.conversation_type = 'other'
    }

    const result: ClassificationResult = {
      conversation_type: raw.conversation_type,
      confidence: raw.confidence ?? 'low',
      reasoning: raw.reasoning ?? '',
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Classification error:', err)
    return NextResponse.json(
      { error: 'Classification failed.' },
      { status: 500 }
    )
  }
}
