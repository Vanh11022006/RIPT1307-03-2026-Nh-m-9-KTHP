import { create } from "zustand";
import type {  Major  } from "../types/major.types";
import axiosClient from "../api/axiosClient";

const normalizeMajor = (major: any): Major => ({
  id: String(major?.id ?? ""),
  universityId: String(major?.universityId ?? major?.university?.id ?? ""),
  code: major?.code ?? "",
  name: major?.name ?? "",
  admissionQuota: Number(major?.admissionQuota ?? 0),
  subjectGroupCodes: Array.isArray(major?.subjectGroupCodes) ? major.subjectGroupCodes : [],
  minScore: Number(major?.minScore ?? 0),
  tuitionFeePerYear: Number(major?.tuitionFeePerYear ?? 0),
  description: major?.description ?? "",
  status: String(major?.status ?? "").toLowerCase() === "inactive" ? "inactive" : "active",
  createdAt: major?.createdAt ?? "",
  updatedAt: major?.updatedAt ?? "",
});

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
      const payload = response?.data ?? response;
      const majors = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      set({ majors: majors.map(normalizeMajor) });
    } catch (error) {
      console.error("Failed to fetch majors:", error);
    } finally {
      set({ loading: false });
    }
  },

  getMajorsByUniversityId: (universityId) => {
    return get().majors.filter((m) => String(m.universityId) === String(universityId));
  },

  getActiveMajorsByUniversityId: (universityId) => {
    return get().majors.filter((m) => String(m.universityId) === String(universityId) && m.status === "active");
  },

  getMajorById: (id) => {
    return get().majors.find((m) => m.id === id);
  },

  createMajor: async (major) => {
    try {
      const response = await axiosClient.post("/majors", major);
      const payload = response?.data ?? response;
      const createdMajor = normalizeMajor(payload?.data ?? payload);
      if (createdMajor.id) {
        set((state) => ({
          majors: [...state.majors, createdMajor]
        }));
      }
    } catch (error) {
      console.error("Failed to create major:", error);
    }
  },

  updateMajor: async (id, data) => {
    try {
      const response = await axiosClient.put(`/majors/${id}`, data);
      const payload = response?.data ?? response;
      const updatedMajor = normalizeMajor(payload?.data ?? payload);
      if (updatedMajor.id) {
        set((state) => ({
          majors: state.majors.map((m) =>
            m.id === id ? updatedMajor : m
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
