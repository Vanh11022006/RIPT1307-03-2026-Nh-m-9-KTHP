import { create } from "zustand";
import type {  University  } from "../types/university.types";
import axiosClient from "../api/axiosClient";

interface UniversityState {
  universities: University[];
  loading: boolean;
  getUniversities: () => Promise<void>;
  getActiveUniversities: () => University[];
  getUniversityById: (id: string) => University | undefined;
  createUniversity: (university: University) => Promise<void>;
  updateUniversity: (id: string, data: Partial<University>) => Promise<void>;
  toggleUniversityStatus: (id: string) => Promise<void>;
}

export const useUniversityStore = create<UniversityState>((set, get) => ({
  universities: [],
  loading: false,

  getUniversities: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/universities");
      if (response && response.data) {
        set({ universities: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch universities:", error);
    } finally {
      set({ loading: false });
    }
  },

  getActiveUniversities: () => {
    return get().universities.filter((u) => u.status === "active");
  },

  getUniversityById: (id) => {
    return get().universities.find((u) => u.id === id);
  },

  createUniversity: async (university) => {
    try {
      const response = await axiosClient.post("/universities", university);
      if (response && response.data) {
        set((state) => ({
          universities: [...state.universities, response.data]
        }));
      }
    } catch (error) {
      console.error("Failed to create university:", error);
    }
  },

  updateUniversity: async (id, data) => {
    try {
      const response = await axiosClient.put(`/universities/${id}`, data);
      if (response && response.data) {
        set((state) => ({
          universities: state.universities.map((u) =>
            u.id === id ? response.data : u
          )
        }));
      }
    } catch (error) {
      console.error("Failed to update university:", error);
    }
  },

  toggleUniversityStatus: async (id) => {
    try {
      const university = get().getUniversityById(id);
      if (university) {
        const newStatus = university.status === "active" ? "inactive" : "active";
        await get().updateUniversity(id, { status: newStatus });
      }
    } catch (error) {
      console.error("Failed to toggle university status:", error);
    }
  }
}));
