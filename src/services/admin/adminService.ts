import { CreateLawyerDTO, CreateOfficeDTO, Lawyer, Office } from "@/@types/admin";

type ApiResponse = { status: number; body: any };

type ApiContextType = {
  GetAPI: (url: string, auth: boolean) => Promise<ApiResponse>;
  PostAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
  PutAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
  PatchAPI: (url: string, data: any, auth: boolean) => Promise<ApiResponse>;
};

const handleResponse = (response: ApiResponse) => {
    if (response.status >= 200 && response.status < 300) {
        return response.body;
    }
    throw new Error(JSON.stringify(response.body));
};

export const adminService = {
  // Offices
  listOffices: async (api: ApiContextType): Promise<Office[]> => {
    const res = await api.GetAPI("/admin/offices", true);
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
  listLawyers: async (api: ApiContextType): Promise<Lawyer[]> => {
    const res = await api.GetAPI("/admin/lawyers", true);
    // Backend returns list, ensure mapping if needed. Returning directly.
    return handleResponse(res);
  },

  createLawyer: async (api: ApiContextType, data: CreateLawyerDTO): Promise<Lawyer> => {
    const res = await api.PostAPI("/admin/lawyers", data, true);
    return handleResponse(res);
  },

  updateLawyer: async (api: ApiContextType, id: string, data: Partial<CreateLawyerDTO>): Promise<Lawyer> => {
    console.log("updateLawyer data: ", data)
    const res = await api.PutAPI(`/admin/lawyers/${id}`, data, true);
    console.log("updateLawyer res: ", res)
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
