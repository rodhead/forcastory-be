// src/features/filemanager/queries/files.queries.ts
import { useQuery } from '@tanstack/react-query'
import { ENV } from '@/config/env'
import { QUERY_KEYS, STALE_TIMES } from '@/config/constants'
import { http } from '@/services/http'
import { mockResolve } from '@/mock/resolver'
import { MOCK_FILES, MOCK_FILE_CONTENT } from '@/mock/data'
import type { ProjectFile, ApiResponse } from '@/types/common'

async function fetchFiles(projectId: string): Promise<ProjectFile[]> {
  if (ENV.useMock)
    return mockResolve(MOCK_FILES.filter((f) => f.projectId === projectId))
  const res = await http.get<ApiResponse<ProjectFile[]>>(
    `/projects/${projectId}/files`
  )
  return res.data.data
}

export function useFiles(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.FILES(projectId),
    queryFn: () => fetchFiles(projectId),
    enabled: !!projectId,
    staleTime: STALE_TIMES.NORMAL,
  })
}

async function fetchFileContent(fileId: string) {
  if (ENV.useMock) {
    const content = MOCK_FILE_CONTENT[fileId]
    if (!content) throw new Error('File content not found')
    return mockResolve(content, 300)
  }
  const res = await http.get(`/files/${fileId}/content`)
  return res.data.data
}

export function useFileContent(fileId: string | null) {
  return useQuery({
    queryKey: ['file-content', fileId],
    queryFn: () => fetchFileContent(fileId!),
    enabled: !!fileId,
    staleTime: STALE_TIMES.NORMAL,
  })
}
