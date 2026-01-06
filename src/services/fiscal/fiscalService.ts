import { PaginatedResponse, PaginationParams } from "../admin/adminService";

export interface FiscalNote {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  value: number;
  issueDate: string;
  status: "AUTHORIZED" | "SCHEDULED" | any;
  taxes: number;
  pdfUrl: string | null;
}


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

export const fiscalService = {
  getNotes: async (api: ApiContextType, params: PaginationParams = {}): Promise<PaginatedResponse<FiscalNote>> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await api.GetAPI(`/admin/signature/invoices?${query}`, true);
    const body = handleResponse(res);
    
    // Backend returns { data: [...], meta: {...} }
    const list = body.data || [];
    
    const mappedData = list.map((item: any) => ({
        id: item.id,
        number: item.simpleId || item.id.replace('inv_', ''),
        clientId: item.customer,
        clientName: item.clientName || item.customer, 
        value: item.value,
        issueDate: item.effectiveDate || item.dateCreated,
        status: item.status,
        taxes: item.taxes ? (item.taxes.iss || 0) : 0,
        pdfUrl: item.pdfUrl || item.invoiceUrl || null,
    }));

    return {
        data: mappedData,
        meta: body.meta
    };
  },

  generateNote: async (api: ApiContextType, data: { customerId: string, value: number, paymentId?: string }): Promise<void> => {
    const res = await api.PostAPI("/admin/signature/invoices", data, true);
    return handleResponse(res);
  },
  
  cancelNote: async (api: ApiContextType, id: string): Promise<void> => {
      const res = await api.DeleteAPI(`/admin/signature/invoices/${id}`, true);
      return handleResponse(res);
  }
};

