import { api } from "./http";
import type {
    PaymentResponse,
    PaymentCreateRequest,
    PaymentMethod,
} from "../types/payments";

export const PaymentsApi = {
  listByPurchase: async (purchaseId: number): Promise<PaymentResponse[]> => {
    const { data } = await api.get<PaymentResponse[]>(
      `/api/purchases/${purchaseId}/payments`
    );
    return data;
  },

  create: async (
    purchaseId: number,
    payload: PaymentCreateRequest
  ): Promise<PaymentResponse> => {
    const { data } = await api.post<PaymentResponse>(
      `/api/purchases/${purchaseId}/payments`,
      payload
    );
    return data;
  },

  listMethods: async (): Promise<PaymentMethod[]> => {
    const { data } = await api.get<PaymentMethod[]>(`/api/payment-methods`);
    return data;
  },
};