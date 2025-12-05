import { api } from "./http";
import type { PageResponse } from "../types/common";
import type { InstallmentSimulationRequest, InstallmentSimulationResponse, PurchaseCreateRequest, PurchaseResponse, PurchaseStatus, PurchaseUpdateRequest } from "../types/purchases";

export const PurchasesApi = {
  // GET /api/purchases?customerId=&status=&page=&size=&sort=
  list: async (params?: {
    customerId?: number;
    status?: PurchaseStatus;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<PurchaseResponse>> => {
    const { page = 0, size = 9, sort = "createdAt", ...rest } = params ?? {};
    const { data } = await api.get<PageResponse<PurchaseResponse>>(
      "/api/purchases",
      {
        params: { page, size, sort, ...rest },
      }
    );
    return data;
  },

  // GET /api/purchases/{id}
  getById: async (id: number): Promise<PurchaseResponse> => {
    const { data } = await api.get<PurchaseResponse>(`/api/purchases/${id}`);
    return data;
  },
  create: async (
    payload: PurchaseCreateRequest
  ): Promise<PurchaseResponse> => {
    const { data } = await api.post<PurchaseResponse>(
      "/api/purchases",
      payload
    );
    return data;
  },

  update: async (
    id: number,
    payload: PurchaseUpdateRequest
  ): Promise<PurchaseResponse> => {
    const { data } = await api.put<PurchaseResponse>(
      `/api/purchases/${id}`,
      payload
    );
    return data;
  },
  simulateInstallments: async (
    payload: InstallmentSimulationRequest
  ): Promise<InstallmentSimulationResponse> => {
    const { data } = await api.post<InstallmentSimulationResponse>(
      "/api/purchases/installments/simulate",
      payload
    );
    return data;
  },
};