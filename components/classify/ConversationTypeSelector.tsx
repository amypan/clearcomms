import { CONVERSATION_TYPE_CONFIGS } from '@/lib/conversation-types'
import type { ConversationType } from '@/lib/conversation-types'

const ALL_TYPES = Object.values(CONVERSATION_TYPE_CONFIGS)

type Props = {
  selected: ConversationType
  detectedType: ConversationType | null
  onChange: (type: ConversationType) => void
}

export function ConversationTypeSelector({ selected, detectedType, onChange }: Props) {
  return (
    <div className="space-y-2">
      {ALL_TYPES.map((config) => {
        const isSelected = selected === config.type
        const isDetected = detectedType === config.type
        return (
          <button
            key={config.type}
            onClick={() => onChange(config.type)}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              isSelected
                ? 'border-neutral-900 bg-neutral-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isSelected ? 'text-neutral-900' : 'text-neutral-700'}`}>
                {config.label}
              </span>
              {isDetected && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                  Detected
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">{config.description}</p>
          </button>
        )
      })}
    </div>
  )
}
