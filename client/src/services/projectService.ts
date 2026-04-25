import apiClient from "@/utils/apiClient.ts";
import {API_URLS} from "@/config/apiConfig.ts";

export interface CreateProjectRequest {
    projectName:      string
    description:      string
    industryId:       string
    purposeId:        string
    granularityId:    string
    missingFillId:    string
    outlierMethodId:  string
    horizon:          number
    confidenceId:     string
    calendarId:       string
}

export interface CreateProjectResponse {
    message: string;
    status: string;
    errorList: unknown | null;
}

export const createNewProject = async (request: CreateProjectRequest): Promise<CreateProjectResponse> => {
    try{
        const response = await apiClient.post(API_URLS.createProject, {
            projectName:     request.projectName,
            description:     request.description,
            industryId:      request.industryId,
            purposeId:       request.purposeId,
            granularityId:   request.granularityId,
            missingFillId:   request.missingFillId,
            outlierMethodId: request.outlierMethodId,
            horizon:         request.horizon,
            confidenceId:    request.confidenceId,
            calendarId:      request.calendarId,
        });

        return response.data as CreateProjectResponse;
    }
    catch(error){
        console.log(error);
        return {
            message: "Failed",
            status: "ERROR",
            errorList: null,
        }
    }
}