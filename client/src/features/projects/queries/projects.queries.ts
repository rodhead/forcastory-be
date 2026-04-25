// src/features/projects/queries/projects.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ENV } from '@/config/env'
import { QUERY_KEYS, STALE_TIMES } from '@/config/constants'
import { http } from '@/services/http'
import { mockResolve } from '@/mock/resolver'
import { MOCK_PROJECTS } from '@/mock/data'
import type { Project, ApiResponse } from '@/types/common'

// ─── Fetch all projects ───────────────────────────────────────────────────────
async function fetchProjects(): Promise<Project[]> {
  if (ENV.useMock) return mockResolve(MOCK_PROJECTS)
  const res = await http.get<ApiResponse<Project[]>>('/projects')
  return res.data.data
}

export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: fetchProjects,
    staleTime: STALE_TIMES.NORMAL,
  })
}

// ─── Fetch single project ─────────────────────────────────────────────────────
async function fetchProject(id: string): Promise<Project> {
  if (ENV.useMock) {
    const proj = MOCK_PROJECTS.find((p) => p.id === id)
    if (!proj) throw new Error('Project not found')
    return mockResolve(proj)
  }
  const res = await http.get<ApiResponse<Project>>(`/projects/${id}`)
  return res.data.data
}

export function useProject(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PROJECT(id),
    queryFn: () => fetchProject(id),
    enabled: !!id,
    staleTime: STALE_TIMES.NORMAL,
  })
}

// ─── Create project ───────────────────────────────────────────────────────────
interface CreateProjectPayload
  extends Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

async function createProject(payload: CreateProjectPayload): Promise<Project> {
  if (ENV.useMock) {
    const newProj: Project = {
      ...payload,
      id: `p${Date.now()}`,
      status: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return mockResolve(newProj, 800)
  }
  const res = await http.post<ApiResponse<Project>>('/projects', payload)
  return res.data.data
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS }),
  })
}

// ─── Delete project ───────────────────────────────────────────────────────────
async function deleteProject(id: string): Promise<void> {
  if (ENV.useMock) return mockResolve(undefined, 600)
  await http.delete(`/projects/${id}`)
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS }),
  })
}
