import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts'
import type { Speaker, TranscriptTurn, AnalysisResult } from '@/lib/types'

const client = new Anthropic()

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

    const primarySpeaker = speakers.find((s) => s.is_primary_user)
    if (!primarySpeaker) {
      return NextResponse.json(
        { error: 'No primary speaker designated' },
        { status: 400 }
      )
    }

    const userPrompt = buildUserPrompt(turns, speakers)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Strip any markdown code fences if present
    const jsonText = content.text
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/, '')
      .trim()

    const result: AnalysisResult = JSON.parse(jsonText)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}
