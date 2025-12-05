export type PurchaseStatus = "ACTIVO" | "PAGADO" | "CANCELADO"; 
// ajusta a los valores reales de tu enum PurchaseStatus

export interface PurchaseResponse {
  id: number;
  customerId: number;
  customerName: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PurchaseStatus;
  createdAt: string; // ISO date, si lo tienes
  // agrega más campos según tu DTO real
  installmentEnabled: boolean;
  installmentCount: number | null;
  installmentAmount: number | null;
}

export interface PurchaseCreateRequest {
  customerId: number;
  description: string;
  totalAmount: number;
  installmentEnabled?: boolean;
  installmentCount?: number | null;
}

export interface PurchaseUpdateRequest {
  description: string;
  totalAmount: number;
}

export interface InstallmentSimulationRequest {
  totalAmount: number;
  installmentCount: number;
}

export interface InstallmentSimulationResponse {
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
}