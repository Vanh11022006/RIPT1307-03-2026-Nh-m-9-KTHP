import { create } from "zustand";
import type {  Candidate  } from "../types/candidate.types";
import { mockCandidates } from "../mocks/candidates.mock";

interface CandidateState {
  candidates: Candidate[];
  getCandidateByUserId: (userId: string) => Candidate | undefined;
  getCandidateById: (id: string) => Candidate | undefined;
  updateCandidate: (id: string, data: Partial<Candidate>) => void;
  saveProfile: (userId: string, data: Partial<Candidate>) => void;
}

export const useCandidateStore = create<CandidateState>((set, get) => ({
  candidates: [...mockCandidates],

  getCandidateByUserId: (userId) => {
    return get().candidates.find((c) => c.userId === userId);
  },

  getCandidateById: (id) => {
    return get().candidates.find((c) => c.id === id);
  },

  updateCandidate: (id, data) => {
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      )
    }));
  },

  saveProfile: (userId, data) => {
    set((state) => {
      const existing = state.candidates.find((c) => c.userId === userId);
      if (existing) {
        return {
          candidates: state.candidates.map((c) =>
            c.userId === userId ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
          )
        };
      } else {
        const newCandidate: Candidate = {
          id: `candidate_${Date.now()}`,
          userId: userId,
          fullName: data.fullName || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "other",
          citizenId: data.citizenId || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          city: data.city || "",
          highSchool: data.highSchool || "",
          graduationYear: data.graduationYear || new Date().getFullYear(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data
        } as Candidate;
        return { candidates: [...state.candidates, newCandidate] };
      }
    });
  }
}));
