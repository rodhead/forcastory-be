export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string, tenantId?: string) => Promise<void>
  clearMessages: () => void
}
