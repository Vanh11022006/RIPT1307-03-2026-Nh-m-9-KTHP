import { create } from "zustand";
import type {  Candidate  } from "../types/candidate.types";
import axiosClient from "../api/axiosClient";
import { useAuthStore } from "./auth.store";

const normalizeCandidate = (candidate: any, userId?: string): Candidate => {
  const currentUser = useAuthStore.getState().currentUser;
  const resolvedUserId = candidate?.userId ?? userId ?? currentUser?.id ?? "";
  const canUseCurrentUserFallback = currentUser && String(resolvedUserId) === String(currentUser.id);

  return {
    ...candidate,
    userId: String(resolvedUserId),
    fullName: candidate?.fullName ?? (canUseCurrentUserFallback ? currentUser.fullName : "") ?? "",
    email: candidate?.email ?? (canUseCurrentUserFallback ? currentUser.email : "") ?? "",
    phone: candidate?.phone ?? (canUseCurrentUserFallback ? currentUser.phone : "") ?? "",
    dateOfBirth: candidate?.dateOfBirth ?? candidate?.birthDate ?? "",
    highSchool: candidate?.highSchool ?? candidate?.highSchoolName ?? "",
  } as Candidate;
};

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
      const payload = response?.data ?? response;
      if (payload) {
        set({
          candidates: Array.isArray(payload)
            ? payload.map((candidate) => normalizeCandidate(candidate))
            : [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    } finally {
      set({ loading: false });
    }
  },

  getCandidateByUserId: (userId) => {
    return get().candidates.find((c) => String(c.userId) === String(userId));
  },

  getCandidateById: (id) => {
    return get().candidates.find((c) => c.id === id);
  },

  updateCandidate: async (id, data) => {
    try {
      const response = await axiosClient.put(`/candidates/${id}`, data);
      const payload = response?.data ?? response;
      if (payload) {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? normalizeCandidate(payload, c.userId) : c
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
        const normalizedCandidate = normalizeCandidate(payload, userId);
        set((state) => {
          const exists = state.candidates.some((c) => String(c.userId) === String(userId));
          return {
            candidates: exists
              ? state.candidates.map((c) => (String(c.userId) === String(userId) ? normalizedCandidate : c))
              : [...state.candidates, normalizedCandidate]
          } as any;
        });
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
      const payload = response?.data ?? response;
      if (payload) {
        const normalizedCandidate = normalizeCandidate(payload, userId);
        // Ensure the fetched profile is stored in candidates for immediate access
        set((state) => {
          const exists = state.candidates.some((c) => String(c.userId) === String(userId));
          return {
            candidates: exists
              ? state.candidates.map((c) => (String(c.userId) === String(userId) ? normalizedCandidate : c))
              : [...state.candidates, normalizedCandidate]
          } as any;
        });
        return normalizedCandidate;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  }
}));
