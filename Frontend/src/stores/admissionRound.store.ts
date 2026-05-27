import { create } from "zustand";
import type { AdmissionRound } from "../types/admissionRound.types";
import axiosClient from "../api/axiosClient";

const normalizeAdmissionRound = (round: any): AdmissionRound => ({
  id: String(round?.id ?? ""),
  code: round?.code ?? "",
  name: round?.name ?? "",
  year: Number(round?.year ?? 0),
  startDate: round?.startDate ?? "",
  endDate: round?.endDate ?? "",
  status: String(round?.status ?? "").toLowerCase() as AdmissionRound["status"],
  description: round?.description ?? "",
  createdAt: round?.createdAt ?? "",
  updatedAt: round?.updatedAt ?? "",
});

interface AdmissionRoundState {
  admissionRounds: AdmissionRound[];
  loading: boolean;
  getAdmissionRounds: () => Promise<void>;
  getAdmissionRoundById: (id: string) => AdmissionRound | undefined;
  createAdmissionRound: (data: Omit<AdmissionRound, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateAdmissionRound: (id: string, data: Partial<Omit<AdmissionRound, "id" | "createdAt" | "updatedAt">>) => Promise<void>;
}

export const useAdmissionRoundStore = create<AdmissionRoundState>((set, get) => ({
  admissionRounds: [],
  loading: false,

  getAdmissionRounds: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/admission-rounds");
      const payload = response?.data ?? response;
      const rounds = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      set({ admissionRounds: rounds.map(normalizeAdmissionRound) });
    } catch (error) {
      console.error("Failed to fetch admission rounds:", error);
    } finally {
      set({ loading: false });
    }
  },

  getAdmissionRoundById: (id) => get().admissionRounds.find(ar => ar.id === id),

  createAdmissionRound: async (data) => {
    try {
      const payloadToSend = {
        ...data,
        startDate: typeof data.startDate === 'string' && data.startDate.includes('T') ? data.startDate.split('T')[0] : data.startDate,
        endDate: typeof data.endDate === 'string' && data.endDate.includes('T') ? data.endDate.split('T')[0] : data.endDate,
      };
      const response = await axiosClient.post("/admission-rounds", payloadToSend);
      const payload = response?.data ?? response;
      const createdRound = normalizeAdmissionRound(payload?.data ?? payload);
      if (createdRound.id) {
        set((state) => ({
          admissionRounds: [createdRound, ...state.admissionRounds]
        }));
      }
    } catch (error) {
      console.error("Failed to create admission round:", error);
    }
  },

  updateAdmissionRound: async (id, data) => {
    try {
      const payloadToSend = {
        ...data,
        startDate: typeof data.startDate === 'string' && data.startDate.includes('T') ? data.startDate.split('T')[0] : data.startDate,
        endDate: typeof data.endDate === 'string' && data.endDate.includes('T') ? data.endDate.split('T')[0] : data.endDate,
      };
      const response = await axiosClient.put(`/admission-rounds/${id}`, payloadToSend);
      const payload = response?.data ?? response;
      const updatedRound = normalizeAdmissionRound(payload?.data ?? payload);
      if (updatedRound.id) {
        set((state) => ({
          admissionRounds: state.admissionRounds.map(round => 
            round.id === id ? updatedRound : round
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update admission round:", error);
    }
  }
}));
