import { create } from "zustand";
import type {  University  } from "../types/university.types";
import { mockUniversities } from "../mocks/universities.mock";

interface UniversityState {
  universities: University[];
  getActiveUniversities: () => University[];
  getUniversityById: (id: string) => University | undefined;
  createUniversity: (university: University) => void;
  updateUniversity: (id: string, data: Partial<University>) => void;
  toggleUniversityStatus: (id: string) => void;
}

export const useUniversityStore = create<UniversityState>((set, get) => ({
  universities: [...mockUniversities],

  getActiveUniversities: () => {
    return get().universities.filter((u) => u.status === "active");
  },

  getUniversityById: (id) => {
    return get().universities.find((u) => u.id === id);
  },

  createUniversity: (university) => {
    set((state) => ({
      universities: [...state.universities, university]
    }));
  },

  updateUniversity: (id, data) => {
    set((state) => ({
      universities: state.universities.map((u) =>
        u.id === id ? { ...u, ...data, updatedAt: new Date().toISOString() } : u
      )
    }));
  },

  toggleUniversityStatus: (id) => {
    set((state) => ({
      universities: state.universities.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "active" ? "inactive" : "active",
              updatedAt: new Date().toISOString()
            }
          : u
      )
    }));
  }
}));
