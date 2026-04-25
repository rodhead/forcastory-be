// src/features/forecasting/queries/forecasting.queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ENV } from '@/config/env'
import { QUERY_KEYS, STALE_TIMES } from '@/config/constants'
import { http } from '@/services/http'
import { mockResolve } from '@/mock/resolver'
import { MOCK_QUALITY, MOCK_EXPERIMENTS, MOCK_MODELS } from '@/mock/data'
import type { Experiment, ApiResponse } from '@/types/common'

// ─── Quality ─────────────────────────────────────────────────────────────────
async function fetchQuality(projectId: string) {
  if (ENV.useMock) {
    const q = MOCK_QUALITY[projectId as keyof typeof MOCK_QUALITY]
    if (!q) throw new Error('Quality data not found')
    return mockResolve(q)
  }
  const res = await http.get(`/projects/${projectId}/quality`)
  return res.data.data
}

export function useQuality(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.QUALITY(projectId),
    queryFn: () => fetchQuality(projectId),
    enabled: !!projectId,
    staleTime: STALE_TIMES.NORMAL,
  })
}

// ─── Experiments ──────────────────────────────────────────────────────────────
async function fetchExperiments(projectId: string): Promise<Experiment[]> {
  if (ENV.useMock) {
    return mockResolve(MOCK_EXPERIMENTS.filter((e) => e.projectId === projectId))
  }
  const res = await http.get<ApiResponse<Experiment[]>>(
    `/projects/${projectId}/experiments`
  )
  return res.data.data
}

export function useExperiments(projectId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EXPERIMENTS(projectId),
    queryFn: () => fetchExperiments(projectId),
    enabled: !!projectId,
    staleTime: STALE_TIMES.NORMAL,
  })
}

// ─── Create experiment ────────────────────────────────────────────────────────
interface CreateExperimentPayload {
  projectId: string
  name: string
  description?: string
  models: string[]
  trainUntil: string
  validateUntil: string
}

async function createExperiment(payload: CreateExperimentPayload): Promise<Experiment> {
  if (ENV.useMock) {
    const exp: Experiment = {
      id: `e${Date.now()}`,
      ...payload,
      status: 'queued',
      createdAt: new Date().toISOString(),
    }
    return mockResolve(exp, 600)
  }
  const res = await http.post<ApiResponse<Experiment>>(
    `/projects/${payload.projectId}/experiments`,
    payload
  )
  return res.data.data
}

export function useCreateExperiment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExperiment,
    onSuccess: (data) =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.EXPERIMENTS(data.projectId) }),
  })
}

// ─── Models (static list, long cache) ────────────────────────────────────────
async function fetchModels() {
  if (ENV.useMock) return mockResolve(MOCK_MODELS, 200)
  const res = await http.get('/models')
  return res.data.data
}

export function useModels() {
  return useQuery({
    queryKey: ['models'],
    queryFn: fetchModels,
    staleTime: STALE_TIMES.STATIC,
  })
}
