import { create } from "zustand";
import type {  Major  } from "../types/major.types";
import { mockMajors } from "../mocks/majors.mock";

interface MajorState {
  majors: Major[];
  getMajorsByUniversityId: (universityId: string) => Major[];
  getActiveMajorsByUniversityId: (universityId: string) => Major[];
  getMajorById: (id: string) => Major | undefined;
  createMajor: (major: Major) => void;
  updateMajor: (id: string, data: Partial<Major>) => void;
  toggleMajorStatus: (id: string) => void;
}

export const useMajorStore = create<MajorState>((set, get) => ({
  majors: [...mockMajors],

  getMajorsByUniversityId: (universityId) => {
    return get().majors.filter((m) => m.universityId === universityId);
  },

  getActiveMajorsByUniversityId: (universityId) => {
    return get().majors.filter((m) => m.universityId === universityId && m.status === "active");
  },

  getMajorById: (id) => {
    return get().majors.find((m) => m.id === id);
  },

  createMajor: (major) => {
    set((state) => ({
      majors: [...state.majors, major]
    }));
  },

  updateMajor: (id, data) => {
    set((state) => ({
      majors: state.majors.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      )
    }));
  },

  toggleMajorStatus: (id) => {
    set((state) => ({
      majors: state.majors.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === "active" ? "inactive" : "active",
              updatedAt: new Date().toISOString()
            }
          : m
      )
    }));
  }
}));
