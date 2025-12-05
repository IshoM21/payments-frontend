export interface CustomerResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  notes?: string | null;
  // agrega aquí campos extra si tu DTO los tiene
}

export interface CustomerCreateRequest {
  name: string;
  email: string;
  phone: string;
  notes: string;
}
export interface CustomerUpdateRequest {
  name: string;
  email: string;
  phone: string;
  notes: string;
}