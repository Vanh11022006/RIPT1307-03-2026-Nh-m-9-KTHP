import { create } from "zustand";
import type {  Application  } from "../types/application.types";
import { mockApplications } from "../mocks/applications.mock";

interface ApplicationState {
  applications: Application[];
  getApplicationsByCandidateId: (candidateId: string) => Application[];
  getApplicationById: (id: string) => Application | undefined;
  createApplication: (app: Application) => void;
  approveApplication: (id: string, adminId: string, note?: string) => void;
  rejectApplication: (id: string, adminId: string, note: string) => void;
  getApplicationStats: () => { total: number; pending: number; approved: number; rejected: number };
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [...mockApplications],

  getApplicationsByCandidateId: (candidateId) => {
    return get().applications.filter((a) => a.candidateId === candidateId);
  },

  getApplicationById: (id) => {
    return get().applications.find((a) => a.id === id);
  },

  createApplication: (app) => {
    set((state) => ({
      applications: [app, ...state.applications]
    }));
  },

  approveApplication: (id, adminId, note) => {
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "approved",
              adminNote: note || a.adminNote,
              reviewedBy: adminId,
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : a
      )
    }));
  },

  rejectApplication: (id, adminId, note) => {
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "rejected",
              adminNote: note,
              reviewedBy: adminId,
              reviewedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : a
      )
    }));
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
