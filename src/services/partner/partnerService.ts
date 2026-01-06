import { CreatePartnerDTO, Partner } from "@/@types/admin";
import { PaginatedResponse, PaginationParams } from "../admin/adminService";

type ApiResponse = { status: number; body: any };

type ApiContextType = {
  GetAPI: (url: string, auth: boolean) => Promise<ApiResponse>;
  PostAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
  PutAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
  PatchAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
  DeleteAPI: (url: string, auth: boolean) => Promise<ApiResponse>;
};

const handleResponse = (response: ApiResponse) => {
    if (response.status >= 200 && response.status < 300) {
        return response.body;
    }
    throw new Error(typeof response.body === 'string' ? response.body : JSON.stringify(response.body));
};

export const partnerService = {
    getPartners: async (api: ApiContextType, params: PaginationParams = {}): Promise<PaginatedResponse<Partner>> => {
        const query = new URLSearchParams(params as any).toString();
        const res = await api.GetAPI(`/partner?${query}`, true);
        return handleResponse(res);
    },

    createPartner: async (api: ApiContextType, data: CreatePartnerDTO): Promise<Partner> => {
        const res = await api.PostAPI("/partner", data, true);
        return handleResponse(res);
    },

    updatePartner: async (api: ApiContextType, id: string, data: Partial<CreatePartnerDTO>): Promise<Partner> => {
        const res = await api.PutAPI(`/partner/${id}`, data, true);
        return handleResponse(res);
    },

    deletePartner: async (api: ApiContextType, id: string): Promise<void> => {
        const res = await api.DeleteAPI(`/partner/${id}`, true);
        return handleResponse(res);
    }
};
