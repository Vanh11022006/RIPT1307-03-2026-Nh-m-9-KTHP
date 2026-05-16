import { create } from "zustand";
import type { Application } from "../types/application.types";
import axiosClient from "../api/axiosClient";
import { useNotificationLogStore } from "./notificationLog.store";

const formatApplicationCode = (id: string, submittedAt?: string, createdAt?: string): string => {
  const dateSource = submittedAt || createdAt;
  const year = dateSource ? new Date(dateSource).getFullYear() : new Date().getFullYear();
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return "";
  }

  return `HS${year}${String(numericId % 10000).padStart(4, "0")}`;
};

const resolveApplicationCode = (application: any): string => {
  const directCode = application?.applicationCode ?? application?.applicationNo ?? application?.applicationNumber ?? application?.appCode ?? application?.code;

  if (typeof directCode === "string" && directCode.trim()) {
    return directCode.trim();
  }

  return formatApplicationCode(String(application?.id ?? ""), application?.submittedAt ?? application?.submissionDate, application?.createdAt);
};

const normalizeApplicationArray = (payload: any): Application[] => {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) return [];

  return data.map((a: any) => ({
    id: String(a?.id ?? ""),
    applicationCode: resolveApplicationCode(a),
    candidateId: String(a?.candidateId ?? ""),
    universityId: String(a?.universityId ?? ""),
    majorId: String(a?.majorId ?? ""),
    subjectGroupCode: a?.subjectGroupCode ?? a?.subjectGroupName ?? (a?.subjectGroup?.code ?? a?.subjectGroup?.name ?? ""),
    admissionRoundId: a?.admissionRoundId != null ? String(a.admissionRoundId) : undefined,
    priorityGroup: a?.priorityGroup ?? undefined,
  // keep `totalScore` as the raw exam total, and expose `finalScore` as exam + priority
  priorityScore: a?.priorityScore ?? 0,
  scores: a?.scores ?? {},
  totalScore: Number(a?.totalScore ?? 0),
  finalScore: Number(a?.totalScore ?? 0) + Number(a?.priorityScore ?? 0),
    evidenceFiles: a?.evidenceFiles ?? [],
    status: String(a?.status ?? "pending"),
    adminNote: a?.adminNote ?? undefined,
    submittedAt: a?.submittedAt ?? a?.submissionDate ?? a?.createdAt ?? "",
    reviewedAt: a?.reviewedAt ?? undefined,
    reviewedBy: a?.reviewedBy ?? undefined,
    createdAt: a?.createdAt ?? "",
    updatedAt: a?.updatedAt ?? "",
  } as Application));
};

const normalizeSingleApplication = (payload: any): Application | null => {
  const obj = payload?.data ?? payload;
  if (!obj) return null;
  return normalizeApplicationArray([obj])[0] ?? null;
};

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  getApplications: () => Promise<void>;
  getApplicationsByCandidateId: (candidateId: string) => Promise<Application[]>;
  getApplicationById: (id: string) => Application | undefined;
  fetchApplicationById: (id: string) => Promise<Application | null>;
  createApplication: (app: Partial<Application>) => Promise<void>;
  updateApplication: (id: string, payload: any) => Promise<Application | null>;
  deleteApplication: (id: string) => Promise<void>;
  cancelApplication: (id: string) => Promise<void>;
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
      set({ applications: normalizeApplicationArray(response) });
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      set({ loading: false });
    }
  },

  getApplicationsByCandidateId: async (candidateId) => {
    try {
      const response = await axiosClient.get(`/applications/candidate/${candidateId}`);
      return normalizeApplicationArray(response);
    } catch (error) {
      console.error("Failed to fetch applications by candidate:", error);
      return [];
    }
  },

  getApplicationById: (id) => {
    return get().applications.find((a) => a.id === id);
  },

  fetchApplicationById: async (id) => {
    try {
      const response = await axiosClient.get(`/applications/${id}`);
      const application = normalizeSingleApplication(response);

      if (application) {
        set((state) => {
          const exists = state.applications.some((item) => item.id === application.id);
          return {
            applications: exists
              ? state.applications.map((item) => (item.id === application.id ? application : item))
              : [application, ...state.applications],
          };
        });
      }

      return application;
    } catch (error) {
      console.error("Failed to fetch application by id:", error);
      return null;
    }
  },

  createApplication: async (app) => {
    try {
      const response = await axiosClient.post("/applications", app);
      const created = normalizeSingleApplication(response);
      if (created) {
        set((state) => ({
          applications: [created, ...state.applications]
        }));
        // Refresh persisted notifications after creating application
        try {
          await useNotificationLogStore.getState().getNotificationLogs();
        } catch (err) {
          console.warn('Failed to refresh notifications after createApplication', err);
        }
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
      const updated = normalizeSingleApplication(response);
      if (updated) {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? updated : a
          )
        }));
        // Refresh notifications so candidate sees approval
        try {
          await useNotificationLogStore.getState().getNotificationLogs();
        } catch (err) {
          console.warn('Failed to refresh notifications after approveApplication', err);
        }
      }
    } catch (error) {
      console.error("Failed to approve application:", error);
    }
  },

  cancelApplication: async (id: string) => {
    try {
      await axiosClient.put(`/applications/${id}/cancel`);
      // update local state: remove the cancelled application from list
      set((state) => ({
        applications: state.applications.filter(a => a.id !== id)
      }));
      try {
        await useNotificationLogStore.getState().getNotificationLogs();
      } catch (err) {
        console.warn('Failed to refresh notifications after cancelApplication', err);
      }
    } catch (error) {
      console.error("Failed to cancel application:", error);
    }
  },

  updateApplication: async (id: string, payload: any) => {
    try {
      const response = await axiosClient.put(`/applications/${id}`, payload);
      const updated = normalizeSingleApplication(response);
      if (updated) {
        set((state) => ({
          applications: state.applications.map(a => a.id === id ? updated : a)
        }));
        try {
          await useNotificationLogStore.getState().getNotificationLogs();
        } catch (err) {
          console.warn('Failed to refresh notifications after updateApplication', err);
        }
      }
      return updated;
    } catch (error) {
      console.error("Failed to update application:", error);
      throw error;
    }
  },

  deleteApplication: async (id: string) => {
    try {
      await axiosClient.delete(`/applications/${id}`);
      set((state) => ({
        applications: state.applications.filter(a => a.id !== id)
      }));
    } catch (error) {
      console.error("Failed to delete application:", error);
      throw error;
    }
  },

  rejectApplication: async (id, adminId, note) => {
    try {
      const response = await axiosClient.put(`/applications/admin-update/${id}`, {
        status: "REJECTED",
        adminId,
        notes: note
      });
      const updated = normalizeSingleApplication(response);
      if (updated) {
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id ? updated : a
          )
        }));
        try {
          await useNotificationLogStore.getState().getNotificationLogs();
        } catch (err) {
          console.warn('Failed to refresh notifications after rejectApplication', err);
        }
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
