import { CreateLawyerDTO, CreateOfficeDTO, Lawyer, Office } from "@/@types/admin";

type ApiResponse = { status: number; body: any };

type ApiContextType = {
  GetAPI: (url: string, auth: boolean) => Promise<ApiResponse>;
  PostAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
  PutAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
  PatchAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

const handleResponse = (response: ApiResponse) => {
    if (response.status >= 200 && response.status < 300) {
        return response.body;
    }
    throw new Error(JSON.stringify(response.body));
};

export const adminService = {
  // Offices
  listOffices: async (api: ApiContextType, params: PaginationParams = {}): Promise<PaginatedResponse<Office>> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await api.GetAPI(`/admin/offices?${query}`, true);
    return handleResponse(res);
  },

  createOffice: async (api: ApiContextType, data: CreateOfficeDTO): Promise<Office> => {
    const res = await api.PostAPI("/admin/offices", data, true);
    return handleResponse(res);
  },

  updateOffice: async (api: ApiContextType, id: string, data: Partial<CreateOfficeDTO>): Promise<Office> => {
    const res = await api.PutAPI(`/admin/offices/${id}`, data, true);
    return handleResponse(res);
  },

  // Lawyers
  listLawyers: async (api: ApiContextType, params: PaginationParams = {}): Promise<PaginatedResponse<Lawyer>> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await api.GetAPI(`/admin/lawyers?${query}`, true);
    return handleResponse(res);
  },

  createLawyer: async (api: ApiContextType, data: CreateLawyerDTO): Promise<Lawyer> => {
    const res = await api.PostAPI("/admin/lawyers", data, true);
    return handleResponse(res);
  },

  updateLawyer: async (api: ApiContextType, id: string, data: Partial<CreateLawyerDTO>): Promise<Lawyer> => {
    const res = await api.PutAPI(`/admin/lawyers/${id}`, data, true);
    return handleResponse(res);
  },

  linkLawyerToOffice: async (api: ApiContextType, lawyerId: string, officeId: string): Promise<Lawyer> => {
    const res = await api.PatchAPI(`/admin/lawyers/${lawyerId}/link-office`, { officeId }, true);
    return handleResponse(res);
  },

  recoverPassword: async (api: ApiContextType, id: string): Promise<void> => {
    const res = await api.PostAPI(`/admin/lawyers/${id}/recover-password`, {}, true);
    return handleResponse(res);
  },
};
