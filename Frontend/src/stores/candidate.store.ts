import { create } from "zustand";
import type {  Candidate  } from "../types/candidate.types";
import axiosClient from "../api/axiosClient";

interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  getCandidates: () => Promise<void>;
  getCandidateByUserId: (userId: string) => Candidate | undefined;
  getCandidateById: (id: string) => Candidate | undefined;
  updateCandidate: (id: string, data: Partial<Candidate>) => Promise<void>;
  saveProfile: (userId: string, data: Partial<Candidate>) => Promise<boolean>;
  getProfile: (userId: string) => Promise<Candidate | null>;
}

export const useCandidateStore = create<CandidateState>((set, get) => ({
  candidates: [],
  loading: false,

  getCandidates: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/candidates");
      if (response && response.data) {
        set({ candidates: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      set({ loading: false });
    }
  },

  getCandidateByUserId: (userId) => {
    return get().candidates.find((c) => c.userId === userId);
  },

  getCandidateById: (id) => {
    return get().candidates.find((c) => c.id === id);
  },

  updateCandidate: async (id, data) => {
    try {
      const response = await axiosClient.put(`/candidates/${id}`, data);
      if (response && response.data) {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? response.data : c
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update candidate:", error);
    }
  },

  saveProfile: async (userId, data) => {
    try {
      const response = await axiosClient.put(`/candidates/my-profile/${userId}`, data);
      // axiosClient interceptor may return response.data directly
      const payload = response?.data ?? response;

      if (payload) {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.userId === userId ? payload : c
          )
        }));
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      return false;
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await axiosClient.get(`/candidates/my-profile/${userId}`);
      if (response && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  }
}));
