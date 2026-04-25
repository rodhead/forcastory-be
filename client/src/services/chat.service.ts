import axios from 'axios'

const api = axios.create({
  baseURL: `http://localhost:${import.meta.env.VITE_API_PORT ?? 8181}`,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 130_000),
})

export const chatService = {
  sendMessage: async (message: string, tenantId: string): Promise<{ response: string }> => {
    const { data } = await api.post('/v1/chat', { message }, {
      headers: { 'X-tenantId': tenantId },
    })
    return data
  },

  ping: async (): Promise<{ status: string; message: string }> => {
    const { data } = await api.get('/v1/chat/ping')
    return data
  },
}
