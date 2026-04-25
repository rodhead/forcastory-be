import type { ChatMessage as ChatMessageType } from '../types/chat.types'
import { cn } from '../../../utils/cn'

interface Props {
  message: ChatMessageType
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-[var(--color-primary)] text-[var(--color-text-inverse)]'
            : 'rounded-bl-sm bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]',
        )}
      >
        {!isUser && (
          <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">AI Assistant</p>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={cn('mt-1 text-right text-[10px]', isUser ? 'opacity-70' : 'text-[var(--color-text-muted)]')}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
