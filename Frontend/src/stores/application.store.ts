import { create } from "zustand";
import type {  Application  } from "../types/application.types";
import axiosClient from "../api/axiosClient";

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  getApplications: () => Promise<void>;
  getApplicationsByCandidateId: (candidateId: string) => Promise<Application[]>;
  getApplicationById: (id: string) => Application | undefined;
  createApplication: (app: Partial<Application>) => Promise<void>;
  approveApplication: (id: string, adminId: string, note?: string) => Promise<void>;
  rejectApplication: (id: string, adminId: string, note: string) => Promise<void>;
  getApplicationStats: () => { total: number; pending: number; approved: number; rejected: number };
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  loading: false,

  getApplications: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/applications");
      if (response && response.data) {
        set({ applications: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      set({ loading: false });
    }
  },

  getApplicationsByCandidateId: async (candidateId) => {
    try {
      const response = await axiosClient.get(`/applications/candidate/${candidateId}`);
      if (response && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch applications by candidate:", error);
      return [];
    }
  },

  getApplicationById: (id) => {
    return get().applications.find((a) => a.id === id);
  },

  createApplication: async (app) => {
    try {
      const response = await axiosClient.post("/applications", app);
      if (response && response.data) {
        set((state) => ({
          applications: [response.data, ...state.applications]
        }));
      }
    } catch (error) {
      console.error("Failed to create application:", error);
    }
  },

  approveApplication: async (id, adminId, note) => {
    try {
      const response = await axiosClient.put(`/applications/admin-update/${id}`, {
        status: "APPROVED",
        adminId,
        notes: note
      });
      if (response && response.data) {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? response.data : a
          )
        }));
      }
    } catch (error) {
      console.error("Failed to approve application:", error);
    }
  },

  rejectApplication: async (id, adminId, note) => {
    try {
      const response = await axiosClient.put(`/applications/admin-update/${id}`, {
        status: "REJECTED",
        adminId,
        notes: note
      });
      if (response && response.data) {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? response.data : a
          )
        }));
      }
    } catch (error) {
      console.error("Failed to reject application:", error);
    }
  },

  getApplicationStats: () => {
    const apps = get().applications;
    return {
      total: apps.length,
      pending: apps.filter((a) => a.status === "pending").length,
      approved: apps.filter((a) => a.status === "approved").length,
      rejected: apps.filter((a) => a.status === "rejected").length
    };
  }
}));
