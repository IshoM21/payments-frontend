import { api } from "./http";
import type { PageResponse } from "../types/common";
import type { CustomerCreateRequest, CustomerResponse, CustomerUpdateRequest } from "../types/customers";
import type { PurchaseResponse } from "../types/purchases";

export const CustomersApi = {
  list: async (params?: {
    q?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<CustomerResponse>> => {
    const { q = "", page = 0, size = 50, sort = "name" } = params ?? {};
    const { data } = await api.get<PageResponse<CustomerResponse>>(
      "/api/customers",
      {
        params: { q, page, size, sort },
      }
    );
    console.log(data);
    return data;
  },
  // GET /api/customers/{id}
  getById: async (id: number): Promise<CustomerResponse> => {
    const { data } = await api.get<CustomerResponse>(`/api/customers/${id}`);
    return data;
  },
  // POST /api/customers/add
  create: async (
    payload: CustomerCreateRequest
  ): Promise<CustomerResponse> => {
    const { data } = await api.post<CustomerResponse>(
      "/api/customers/add",
      payload
    );
    return data;
  },

  // PUT /api/customers/{id}
  update: async (
    id: number,
    payload: CustomerUpdateRequest
  ): Promise<CustomerResponse> => {
    const { data } = await api.put<CustomerResponse>(
      `/api/customers/${id}`,
      payload
    );
    return data;
  },

  // DELETE /api/customers/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/customers/${id}`);
  },
  // GET /api/customers/{customerId}/purchases
  listPurchasesByCustomer: async (params: {
    customerId: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<PurchaseResponse>> => {
    const {
      customerId,
      page = 0,
      size = 10,
      sort = "createdAt",
    } = params;
    const { data } = await api.get<PageResponse<PurchaseResponse>>(
      `/api/customers/${customerId}/purchases`,
      { params: { page, size, sort } }
    );
    
    return data;
  },
};

