import { create } from "zustand";
import type { AdmissionRound } from "../types/admissionRound.types";
import { mockAdmissionRounds } from "../mocks/admissionRounds.mock";

interface AdmissionRoundState {
  admissionRounds: AdmissionRound[];
  getAdmissionRoundById: (id: string) => AdmissionRound | undefined;
  createAdmissionRound: (data: Omit<AdmissionRound, "id" | "createdAt" | "updatedAt">) => void;
  updateAdmissionRound: (id: string, data: Partial<Omit<AdmissionRound, "id" | "createdAt" | "updatedAt">>) => void;
}

export const useAdmissionRoundStore = create<AdmissionRoundState>((set, get) => ({
  admissionRounds: mockAdmissionRounds,
  getAdmissionRoundById: (id) => get().admissionRounds.find(ar => ar.id === id),
  createAdmissionRound: (data) => {
    const newRound: AdmissionRound = {
      ...data,
      id: `round_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set((state) => ({
      admissionRounds: [newRound, ...state.admissionRounds]
    }));
  },
  updateAdmissionRound: (id, data) => {
    set((state) => ({
      admissionRounds: state.admissionRounds.map(round => 
        round.id === id 
          ? { ...round, ...data, updatedAt: new Date().toISOString() } 
          : round
      )
    }));
  }
}));
