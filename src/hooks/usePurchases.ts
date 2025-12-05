import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PurchasesApi } from "../api/purchases";
import type { PageResponse } from "../types/common";
import type { PurchaseCreateRequest, PurchaseResponse, PurchaseStatus } from "../types/purchases";

interface ListParams {
  customerId?: number;
  status?: PurchaseStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export const usePurchasesList = (params: ListParams) => {
  return useQuery<PageResponse<PurchaseResponse>>({
    queryKey: ["purchases", params],
    queryFn: () => PurchasesApi.list(params),
    placeholderData: (previous) => previous,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchaseCreateRequest) =>
      PurchasesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
    },
  });
};

export const usePurchase = (id?: number) => {
  return useQuery<PurchaseResponse>({
    queryKey: ["purchase", id],
    queryFn: () => PurchasesApi.getById(id!),
    enabled: !!id,
  });
};