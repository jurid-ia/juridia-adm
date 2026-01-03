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
  getNotes: async (api: ApiContextType): Promise<FiscalNote[]> => {
    console.log("getNotes");
    const res = await api.GetAPI("/admin/signature/invoices", true);
    console.log("getNotes response: ", res);
    const data = handleResponse(res);
    // Asaas returns { data: [...] } usually for lists
    const list = data.data || []; 
    
    return list.map((item: any) => ({
        id: item.id,
        number: item.simpleId || item.id.replace('inv_', ''), // Use simpleId from backend or clean locally
        clientId: item.customer,
        clientName: item.clientName || item.customer, // Use enriched name
        value: item.value,
        issueDate: item.effectiveDate || item.dateCreated,
        status: item.status,
        taxes: item.taxes ? (item.taxes.iss || 0) : 0,
        pdfUrl: item.pdfUrl || item.invoiceUrl || null,
    }));
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

