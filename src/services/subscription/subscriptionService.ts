
import { PaginatedResponse, PaginationParams } from "../admin/adminService";

// Start strict service definition matching adminService pattern

// We redefine types here or import if they exist. adminService defines them inline/in-file mostly.
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
    throw new Error(typeof response.body === 'string' ? response.body : JSON.stringify(response.body));
};

export interface Subscription {
  id: string;
  lawFirmId: string;
  lawFirm: {
      name: string;
      paymentId: string;
  };
  signaturePlanId: string;
  signaturePlan: {
      name: string;
      pixPrice: number;
      creditCardPrice: number;
      yearlyDiscount: number;
  };
  partner?: {
      name: string;
      discount: number;
  };
  appliedPartnerDiscount?: number;
  status: string;
  expirationDate: string;
  paymentType: string;
  yearly: boolean;
  isAutoRenewActivated: boolean;
  createdAt: string;
  paymentId: string;
}

export interface SignaturePlan {
    id: string;
    name: string;
    creditCardPrice: number;
    pixPrice: number;
    yearlyDiscount: number;
}

export const subscriptionService = {
  // admin/signature endpoints
  getSubscriptions: async (api: ApiContextType, params: PaginationParams = {}): Promise<PaginatedResponse<Subscription>> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await api.GetAPI(`/admin/signature?${query}`, true);
    return handleResponse(res);
  },

  getPlans: async (api: ApiContextType): Promise<SignaturePlan[]> => {
      // Assuming this public endpoint or similar exists for listing active plans
      // We use the one I found in: modules/signaturePlans/controllers/signaturePlans.controller.ts -> @Get() findAll
      const res = await api.GetAPI("/signature-plan", false); // Likely public or standard auth
      return handleResponse(res);
  },

  createSubscription: async (api: ApiContextType, lawFirmId: string, planId: string, yearly: boolean, isTrial: boolean, partnerId?: string): Promise<any> => {
    console.log("createSubscription data: ", { lawFirmId, planId, yearly, isTrial, partnerId });
    const res = await api.PostAPI(`/admin/signature/create/${lawFirmId}/${planId}`, { yearly, isTrial, partnerId }, true);
    console.log("createSubscription response: ", res);
    return handleResponse(res);
  },
  
  renewSubscription: async (api: ApiContextType, id: string) => {
      const res = await api.PostAPI(`/admin/signature/renew/${id}`, {}, true);
      return handleResponse(res);
  },

  renewYearly: async (api: ApiContextType, id: string) => {
      const res = await api.PostAPI(`/admin/signature/renew-yearly/${id}`, {}, true);
      return handleResponse(res);
  },

  createCharge: async (api: ApiContextType, id: string) => {
      const res = await api.PostAPI(`/admin/signature/charge/${id}`, {}, true);
      return handleResponse(res);
  },

  cancelSubscription: async (api: ApiContextType, id: string) => {
      const res = await api.PostAPI(`/admin/signature/cancel/${id}`, {}, true);
      return handleResponse(res);
  },

  reactivateSubscription: async (api: ApiContextType, id: string) => {
      const res = await api.PostAPI(`/admin/signature/reactivate/${id}`, {}, true);
      return handleResponse(res);
  },

  getHistory: async (api: ApiContextType, id: string): Promise<any[]> => {
      const res = await api.GetAPI(`/admin/signature/${id}/history`, true);
      return handleResponse(res);
  },

  changePlan: async (api: ApiContextType, id: string, planId: string, yearly: boolean) => {
      const res = await api.PostAPI(`/admin/signature/change-plan/${id}`, { planId, yearly }, true);
      return handleResponse(res);
  },

  generateReceipt: async (api: ApiContextType, subscriptionId: string): Promise<void> => {
      // Now returns JSON { base64: string, filename: string }
      const res = await api.GetAPI(`/admin/signature/${subscriptionId}/receipt`, true);
      const data = handleResponse(res);
      
      if (data && data.base64) {
          if (typeof window !== 'undefined') {
            const byteCharacters = atob(data.base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', data.filename || `receipt-${subscriptionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          }
      } else {
          throw new Error("Invalid receipt data");
      }
  },
};
