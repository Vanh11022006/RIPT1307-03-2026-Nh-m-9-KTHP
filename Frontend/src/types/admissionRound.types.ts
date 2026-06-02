export type AdmissionRoundStatus = "upcoming" | "active" | "closed";

export interface AdmissionRound {
  id: string;
  code: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: AdmissionRoundStatus;
  description?: string;
  admissionMethods?: string;
  createdAt: string;
  updatedAt: string;
}
