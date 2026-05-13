import { create } from "zustand";
import type { AdmissionRound } from "../types/admissionRound.types";
import axiosClient from "../api/axiosClient";

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
      if (response && response.data) {
        set({ admissionRounds: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch admission rounds:", error);
    } finally {
      set({ loading: false });
    }
  },

  getAdmissionRoundById: (id) => get().admissionRounds.find(ar => ar.id === id),

  createAdmissionRound: async (data) => {
    try {
      const response = await axiosClient.post("/admission-rounds", data);
      if (response && response.data) {
        set((state) => ({
          admissionRounds: [response.data, ...state.admissionRounds]
        }));
      }
    } catch (error) {
      console.error("Failed to create admission round:", error);
    }
  },

  updateAdmissionRound: async (id, data) => {
    try {
      const response = await axiosClient.put(`/admission-rounds/${id}`, data);
      if (response && response.data) {
        set((state) => ({
          admissionRounds: state.admissionRounds.map(round => 
            round.id === id ? response.data : round
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update admission round:", error);
    }
  }
}));
