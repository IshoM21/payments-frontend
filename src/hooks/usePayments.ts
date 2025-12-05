import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentsApi } from "../api/payments";
import type {
    PaymentResponse,
    PaymentCreateRequest,
    PaymentMethod,
} from "../types/payments";

export const usePaymentsByPurchase = (purchaseId?: number) => {
  return useQuery<PaymentResponse[]>({
    queryKey: ["payments", purchaseId],
    queryFn: () => PaymentsApi.listByPurchase(purchaseId!),
    enabled: !!purchaseId,
  });
};

export const usePaymentMethods = () => {
  return useQuery<PaymentMethod[]>({
    queryKey: ["payment-methods"],
    queryFn: () => PaymentsApi.listMethods(),
  });
};

export const useCreatePayment = (purchaseId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentCreateRequest) =>
      PaymentsApi.create(purchaseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", purchaseId] });
      queryClient.invalidateQueries({ queryKey: ["purchase", purchaseId] });
    },
  });
};