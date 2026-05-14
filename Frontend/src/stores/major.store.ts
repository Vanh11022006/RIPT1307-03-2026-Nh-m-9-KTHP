import { create } from "zustand";
import type {  Major  } from "../types/major.types";
import axiosClient from "../api/axiosClient";

interface MajorState {
  majors: Major[];
  loading: boolean;
  getMajors: () => Promise<void>;
  getMajorsByUniversityId: (universityId: string) => Major[];
  getActiveMajorsByUniversityId: (universityId: string) => Major[];
  getMajorById: (id: string) => Major | undefined;
  createMajor: (major: Major) => Promise<void>;
  updateMajor: (id: string, data: Partial<Major>) => Promise<void>;
  toggleMajorStatus: (id: string) => Promise<void>;
}

export const useMajorStore = create<MajorState>((set, get) => ({
  majors: [],
  loading: false,

  getMajors: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/majors");
      if (response && response.data) {
        set({ majors: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch majors:", error);
    } finally {
      set({ loading: false });
    }
  },

  getMajorsByUniversityId: (universityId) => {
    return get().majors.filter((m) => m.universityId === universityId);
  },

  getActiveMajorsByUniversityId: (universityId) => {
    return get().majors.filter((m) => m.universityId === universityId && m.status === "active");
  },

  getMajorById: (id) => {
    return get().majors.find((m) => m.id === id);
  },

  createMajor: async (major) => {
    try {
      const response = await axiosClient.post("/majors", major);
      if (response && response.data) {
        set((state) => ({
          majors: [...state.majors, response.data]
        }));
      }
    } catch (error) {
      console.error("Failed to create major:", error);
    }
  },

  updateMajor: async (id, data) => {
    try {
      const response = await axiosClient.put(`/majors/${id}`, data);
      if (response && response.data) {
        set((state) => ({
          majors: state.majors.map((m) =>
            m.id === id ? response.data : m
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update major:", error);
    }
  },

  toggleMajorStatus: async (id) => {
    try {
      const major = get().getMajorById(id);
      if (major) {
        const newStatus = major.status === "active" ? "inactive" : "active";
        await get().updateMajor(id, { status: newStatus });
      }
    } catch (error) {
      console.error("Failed to toggle major status:", error);
    }
  }
}));
