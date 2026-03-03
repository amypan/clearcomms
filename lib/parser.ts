import type { Speaker, TranscriptTurn } from './types'

// Matches: [08:22] Speaker Name: text
const TIMESTAMP_PATTERN = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s+(.+?):\s+(.+)$/

// Matches: Speaker Name: text (no timestamp)
const NO_TIMESTAMP_PATTERN = /^(.+?):\s+(.+)$/

// Metadata labels that should not be treated as speakers
const METADATA_LABELS = new Set([
  'meeting title', 'title', 'date', 'time', 'duration',
  'transcript', 'attendees', 'participants', 'location',
  'organizer', 'host', 'subject', 'topic', 'agenda',
  'summary', 'notes', 'recording', 'description',
  'start time', 'end time', 'start date', 'end date',
  'created', 'created by', 'edited by', 'last edited',
])

function isMetadataLabel(label: string): boolean {
  return METADATA_LABELS.has(label.toLowerCase().trim())
}

export type ParseResult = {
  turns: TranscriptTurn[]
  speakers: Speaker[]
}

export function parseTranscript(raw: string): ParseResult {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const turns: TranscriptTurn[] = []
  const speakerMap = new Map<string, Speaker>()

  for (const line of lines) {
    const timestamped = line.match(TIMESTAMP_PATTERN)
    if (timestamped) {
      const [, timestamp, rawSpeaker, text] = timestamped
      if (isMetadataLabel(rawSpeaker)) continue
      const speaker = ensureSpeaker(speakerMap, rawSpeaker.trim())
      turns.push({
        turn_id: `t${turns.length + 1}`,
        speaker_id: speaker.speaker_id,
        timestamp,
        text: text.trim(),
      })
      continue
    }

    const plain = line.match(NO_TIMESTAMP_PATTERN)
    if (plain) {
      const [, rawSpeaker, text] = plain
      if (isMetadataLabel(rawSpeaker)) continue
      const speaker = ensureSpeaker(speakerMap, rawSpeaker.trim())
      turns.push({
        turn_id: `t${turns.length + 1}`,
        speaker_id: speaker.speaker_id,
        timestamp: null,
        text: text.trim(),
      })
    }
  }

  return {
    turns,
    speakers: Array.from(speakerMap.values()),
  }
}

function ensureSpeaker(
  map: Map<string, Speaker>,
  rawLabel: string
): Speaker {
  const id = toSpeakerId(rawLabel)
  if (!map.has(id)) {
    map.set(id, {
      speaker_id: id,
      display_name: rawLabel,
      is_primary_user: false,
    })
  }
  return map.get(id)!
}

function toSpeakerId(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
}
