import apiClient from '@/utils/apiClient.ts'
import { API_URLS } from '@/config/apiConfig.ts'

export interface DropdownOption {
    id: string
    value: string
}

export interface ProjectPageData {
    industries:          DropdownOption[]
    purposes:            DropdownOption[]
    granularities:       DropdownOption[]
    missingFillOptions:  DropdownOption[]
    outlierMethods:      DropdownOption[]
    confidenceIntervals: DropdownOption[]
    calendarTypes:       DropdownOption[]
}

export const loadProjectPageData = async (): Promise<ProjectPageData> => {
    try {
        const response = await apiClient.get(API_URLS.projectPageData)
        return response.data as ProjectPageData
    } catch (error) {
        console.log(error)
        return {
            industries:          [],
            purposes:            [],
            granularities:       [],
            missingFillOptions:  [],
            outlierMethods:      [],
            confidenceIntervals: [],
            calendarTypes:       [],
        }
    }
}
