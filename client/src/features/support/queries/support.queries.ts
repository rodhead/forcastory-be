// src/features/support/queries/support.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ENV } from '@/config/env'
import { QUERY_KEYS, STALE_TIMES } from '@/config/constants'
import { http } from '@/services/http'
import { mockResolve } from '@/mock/resolver'
import { MOCK_TICKETS } from '@/mock/data'
import type { SupportTicket, ApiResponse } from '@/types/common'

async function fetchTickets(): Promise<SupportTicket[]> {
  if (ENV.useMock) return mockResolve(MOCK_TICKETS)
  const res = await http.get<ApiResponse<SupportTicket[]>>('/support/tickets')
  return res.data.data
}

export function useTickets() {
  return useQuery({
    queryKey: QUERY_KEYS.TICKETS,
    queryFn: fetchTickets,
    staleTime: STALE_TIMES.NORMAL,
  })
}

async function createTicket(
  payload: Pick<SupportTicket, 'title' | 'type'>
): Promise<SupportTicket> {
  if (ENV.useMock) {
    const t: SupportTicket = {
      id: `TKT-${String(Date.now()).slice(-3)}`,
      ...payload,
      status: 'open',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    return mockResolve(t, 600)
  }
  const res = await http.post<ApiResponse<SupportTicket>>(
    '/support/tickets',
    payload
  )
  return res.data.data
}

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.TICKETS }),
  })
}
