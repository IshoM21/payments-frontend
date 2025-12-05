export type PaymentMethod = "EFECTIVO" | "TRANSFERENCIA" | "OTRO";

export interface PaymentCreateRequest {
  amount: number;
  method: PaymentMethod;
  paidAt?: string | null; // en backend es LocalDateTime, aquí string
  note?: string | null;
}

export interface PaymentResponse {
  id: number;
  purchaseId: number;
  amount: number;
  method: PaymentMethod;
  paidAt: string | null; // LocalDateTime o null
  note: string | null;
}