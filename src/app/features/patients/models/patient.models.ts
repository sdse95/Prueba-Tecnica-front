/** Aligns with ASP.NET Core default JSON (camelCase). Adjust if the API uses PascalCase. */
export interface PatientResponse {
  patientId: number;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber?: string | null;
  email?: string | null;
  createdAt: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface CreatePatientRequest {
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber?: string | null;
  email?: string | null;
}

/** Partial update: only send fields that changed. */
export type UpdatePatientRequest = Partial<{
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string | null;
  email: string | null;
}>;

export interface PatientListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  documentNumber?: string;
}
