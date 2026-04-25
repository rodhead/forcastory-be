// src/features/admin/queries/admin.queries.ts
import { useQuery } from '@tanstack/react-query'
import { ENV } from '@/config/env'
import { QUERY_KEYS, STALE_TIMES } from '@/config/constants'
import { http } from '@/services/http'
import { mockResolve } from '@/mock/resolver'
import { MOCK_USERS } from '@/mock/data'
import type { User, ApiResponse } from '@/types/common'

async function fetchUsers(): Promise<User[]> {
  if (ENV.useMock) return mockResolve(MOCK_USERS)
  const res = await http.get<ApiResponse<User[]>>('/admin/users')
  return res.data.data
}

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.USERS,
    queryFn: fetchUsers,
    staleTime: STALE_TIMES.NORMAL,
  })
}
