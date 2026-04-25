import { create } from 'zustand'
import { chatService } from '../../../services/chat.service'
import type { ChatMessage, ChatStore } from '../types/chat.types'

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (content: string, tenantId = 'default') => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    set((s) => ({ messages: [...s.messages, userMessage], isLoading: true, error: null }))

    try {
      const { response } = await chatService.sendMessage(content, tenantId)
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      set((s) => ({ messages: [...s.messages, aiMessage], isLoading: false }))
    } catch {
      set({ isLoading: false, error: 'Failed to get a response. Check that Kafka and Ollama are running.' })
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}))
