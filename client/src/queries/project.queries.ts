import { useMutation, useQuery } from '@tanstack/react-query'
import { createNewProject, type CreateProjectRequest, type CreateProjectResponse } from '@/services/projectService.ts'
import { loadProjectPageData, type ProjectPageData } from '@/services/projectPageService.ts'

export const useProjectPageData = () =>
    useQuery<ProjectPageData>({
        queryKey: ['projectPageData'],
        queryFn: loadProjectPageData,
        staleTime: 5 * 60 * 1000,
        gcTime:    10 * 60 * 1000,
        retry: 1,
    })

export const useCreateNewProjectQuery = () =>
    useMutation<CreateProjectResponse, Error, CreateProjectRequest>({
        mutationFn: (request: CreateProjectRequest) => createNewProject(request),
        gcTime: 0,
        retry: 1,
    });