import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../features/chat/store/chat.store'
import { ChatMessage } from '../features/chat/components/ChatMessage'
import { chatService } from '../services/chat.service'

export function ChatPage() {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChatStore()
  const [input, setInput] = useState('')
  const [pingStatus, setPingStatus] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    await sendMessage(text)
  }

  const handlePing = async () => {
    setPingStatus('pinging…')
    try {
      const res = await chatService.ping()
      setPingStatus(`✓ ${res.message}`)
    } catch {
      setPingStatus('✗ ping failed — is the AI service running?')
    }
    setTimeout(() => setPingStatus(null), 4000)
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--color-background)]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">AI Assistant</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Powered by Ollama · Connected via Kafka</p>
        </div>
        <div className="flex items-center gap-3">
          {pingStatus && (
            <span className="rounded-full bg-[var(--color-surface-raised)] px-3 py-1 text-xs text-[var(--color-text-secondary)]">
              {pingStatus}
            </span>
          )}
          <button
            onClick={handlePing}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] transition-colors"
          >
            Test connection
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="text-4xl">🤖</div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Ask me anything</p>
            <p className="text-xs text-[var(--color-text-muted)]">Messages go Java → Kafka → Python → Ollama</p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-[var(--color-surface-raised)] px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-muted)] [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-muted)] [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--color-text-muted)] [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          <input
            className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-40 hover:opacity-90"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
