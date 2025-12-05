import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomersApi } from "../api/customers";
import type { PageResponse } from "../types/common";
import type { CustomerCreateRequest, CustomerResponse, CustomerUpdateRequest } from "../types/customers";
import type { PurchaseResponse } from "../types/purchases";

interface ListParams {
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const useCustomersList = (params: ListParams) => {
  return useQuery<PageResponse<CustomerResponse>>({
    queryKey: ["customers", params],
    queryFn: () => CustomersApi.list(params),
    placeholderData: (prevData) => prevData, // 👈 para que la lista anterior se mantenga mientras carga la nueva página
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerCreateRequest) =>
      CustomersApi.create(payload),
    onSuccess: () => {
      // invalidar lista de clientes
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
export const useCustomer = (id?: number) => {
  return useQuery<CustomerResponse>({
    queryKey: ["customer", id],
    queryFn: () => CustomersApi.getById(id!),
    enabled: !!id,
  });
};

// 👇 NUEVO: obtener compras de un cliente
interface PurchasesParams {
  customerId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const useCustomerPurchases = (params: PurchasesParams) => {
  const { customerId } = params;
  return useQuery<PageResponse<PurchaseResponse>>({
    queryKey: ["customerPurchases", params],
    queryFn: () =>
      CustomersApi.listPurchasesByCustomer({
        customerId: customerId!,
        page: params.page,
        size: params.size,
        sort: params.sort,
      }),
    enabled: !!customerId,
    placeholderData: (previous) => previous,
  });
};

// 👇 NUEVO: actualizar cliente
export const useUpdateCustomer = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomerUpdateRequest) =>
      CustomersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

// 👇 NUEVO: eliminar cliente
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CustomersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};