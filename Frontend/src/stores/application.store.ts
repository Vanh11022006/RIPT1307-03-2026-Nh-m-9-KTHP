import { create } from "zustand";
import type { Application, ApplicationReviewSubmission, ApplicationReviewSummary, EvidenceFile } from "../types/application.types";
import axiosClient from "../api/axiosClient";

const APPLICATIONS_CACHE_KEY = "applicationsCache";

const isBrowser = () => typeof window !== "undefined" && typeof localStorage !== "undefined";

const loadCachedApplications = (): Application[] => {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(APPLICATIONS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => normalizeApplicationRecord(item));
  } catch (error) {
    return [];
  }
};

const saveCachedApplications = (applications: Application[]) => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(APPLICATIONS_CACHE_KEY, JSON.stringify(applications));
  } catch (error) {
    // ignore cache write failures
  }
};

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

type ApplicationStatisticsGroup = {
  id: string;
  code?: string;
  name: string;
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
};

type ApplicationStatisticsResponse = {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  byUniversity: ApplicationStatisticsGroup[];
  byMajor: ApplicationStatisticsGroup[];
  byAdmissionRound: ApplicationStatisticsGroup[];
};

const normalizeStatisticsGroups = (groups: any): ApplicationStatisticsGroup[] => {
  if (!Array.isArray(groups)) return [];

  return groups.map((group: any, index: number) => ({
    id: String(group?.id ?? group?.code ?? group?.name ?? index),
    code: group?.code ?? undefined,
    name: String(group?.name ?? "Chưa cập nhật"),
    total: Number(group?.total ?? 0),
    draft: Number(group?.draft ?? 0),
    pending: Number(group?.pending ?? 0),
    approved: Number(group?.approved ?? 0),
    rejected: Number(group?.rejected ?? 0),
    cancelled: Number(group?.cancelled ?? 0),
  }));
};

const normalizeStatisticsResponse = (stats: any): ApplicationStatisticsResponse => ({
  total: Number(stats?.TOTAL ?? stats?.total ?? 0),
  draft: Number(stats?.DRAFT ?? stats?.draft ?? 0),
  pending: Number(stats?.PENDING ?? stats?.pending ?? 0),
  approved: Number(stats?.APPROVED ?? stats?.approved ?? 0),
  rejected: Number(stats?.REJECTED ?? stats?.rejected ?? 0),
  cancelled: Number(stats?.CANCELLED ?? stats?.cancelled ?? 0),
  byUniversity: normalizeStatisticsGroups(stats?.byUniversity),
  byMajor: normalizeStatisticsGroups(stats?.byMajor),
  byAdmissionRound: normalizeStatisticsGroups(stats?.byAdmissionRound),
});

const normalizeApplicationScores = (scores: any): Record<string, number> => {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    if (typeof scores === "string" && scores.trim()) {
      try {
        const parsed = JSON.parse(scores);
        return normalizeApplicationScores(parsed);
      } catch (error) {
        return {};
      }
    }

    return {};
  }

  return Object.entries(scores).reduce((acc, [key, value]) => {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      acc[key] = numericValue;
    }
    return acc;
  }, {} as Record<string, number>);
};

const normalizeEvidenceFiles = (files: any): EvidenceFile[] => {
  if (!Array.isArray(files)) return [];

  return files.map((file: any, index: number) => ({
    id: String(file?.id ?? file?.fileName ?? `file-${index}`),
    name: String(file?.name ?? file?.fileName ?? "Chưa cập nhật"),
    url: String(file?.url ?? file?.fileUrl ?? ""),
    type: file?.type ?? file?.fileType ?? (String(file?.fileType ?? file?.type ?? "").includes("pdf") ? "pdf" : "image"),
    category: file?.category ?? undefined,
    size: Number(file?.size ?? file?.fileSize ?? 0),
    uploadedAt: file?.uploadedAt ?? file?.createdAt ?? new Date().toISOString(),
  }));
};

const normalizeApplicationRecord = (application: any): Application => ({
  id: String(application?.id ?? ""),
  applicationCode: resolveApplicationCode(application),
  candidateId: String(application?.candidateId ?? application?.candidate?.id ?? application?.candidate?.userId ?? ""),
  candidateName: application?.candidateName ?? application?.candidate?.fullName ?? application?.candidate?.user?.fullName ?? undefined,
  candidateEmail: application?.candidateEmail ?? application?.candidate?.email ?? application?.candidate?.user?.email ?? undefined,
  candidatePhone: application?.candidatePhone ?? application?.candidate?.phone ?? undefined,
  candidateDateOfBirth: application?.candidateDateOfBirth ?? application?.candidate?.dateOfBirth ?? application?.candidate?.birthDate ?? undefined,
  candidateGender: application?.candidateGender ?? application?.candidate?.gender ?? undefined,
  candidateCitizenId: application?.candidateCitizenId ?? application?.candidate?.citizenId ?? undefined,
  candidateAddress: application?.candidateAddress ?? application?.candidate?.address ?? undefined,
  candidateCity: application?.candidateCity ?? application?.candidate?.city ?? undefined,
  candidateHighSchool: application?.candidateHighSchool ?? application?.candidate?.highSchool ?? application?.candidate?.highSchoolName ?? undefined,
  candidateGraduationYear: application?.candidateGraduationYear != null ? Number(application.candidateGraduationYear) : application?.candidate?.graduationYear != null ? Number(application.candidate.graduationYear) : undefined,
  universityId: String(application?.universityId ?? application?.major?.university?.id ?? application?.major?.universityId ?? ""),
  majorId: String(application?.majorId ?? application?.major?.id ?? ""),
  subjectGroupCode: application?.subjectGroupCode ?? application?.subjectGroup?.code ?? (application?.subjectGroupName ?? ""),
  admissionRoundId: application?.admissionRoundId != null
    ? String(application.admissionRoundId)
    : application?.admissionRound?.id != null
      ? String(application.admissionRound.id)
      : undefined,
  priorityGroup: application?.priorityGroup ?? undefined,
  // keep `totalScore` as the raw exam total, and expose `finalScore` as exam + priority
  priorityScore: Number(application?.priorityScore ?? 0),
  reviewScoreAverage: application?.reviewScoreAverage != null ? Number(application.reviewScoreAverage) : undefined,
  reviewCount: application?.reviewCount != null ? Number(application.reviewCount) : undefined,
  scores: normalizeApplicationScores(application?.scores),
  totalScore: Number(application?.totalScore ?? 0),
  finalScore: Number(application?.finalScore ?? (Number(application?.totalScore ?? 0) + Number(application?.priorityScore ?? 0))),
  evidenceFiles: normalizeEvidenceFiles(application?.evidenceFiles),
  status: (String(application?.status ?? "pending")).toLowerCase() as Application['status'],
  candidateNote: application?.candidateNote ?? undefined,
  adminNote: application?.adminNote ?? undefined,
  submittedAt: application?.submittedAt ?? application?.submissionDate ?? application?.createdAt ?? "",
  reviewedAt: application?.reviewedAt ?? undefined,
  reviewedBy: application?.reviewedBy ?? undefined,
  createdAt: application?.createdAt ?? "",
  updatedAt: application?.updatedAt ?? "",
});

const normalizeApplicationArray = (payload: any): Application[] => {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) return [];

  return data.map((a: any) => normalizeApplicationRecord(a));
};

const normalizeSingleApplication = (payload: any): Application | null => {
  const obj = payload?.data ?? payload;
  if (!obj) return null;
  return normalizeApplicationRecord(obj);
};

const extractPagedApplications = (payload: any): any[] => {
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
};

const buildAdminQueryParams = (filters?: {
  status?: string;
  universityId?: string;
  majorId?: string;
  admissionRoundId?: string;
}) => {
  const params: Record<string, string> = { page: "0", size: "100" };

  if (filters?.status && filters.status !== "all") {
    params.status = filters.status;
  }

  if (filters?.universityId && filters.universityId !== "all") {
    params.universityId = filters.universityId;
  }

  if (filters?.majorId && filters.majorId !== "all") {
    params.majorId = filters.majorId;
  }

  if (filters?.admissionRoundId && filters.admissionRoundId !== "all") {
    params.admissionRoundId = filters.admissionRoundId;
  }

  return params;
};

const buildApplicationFilterParams = (filters?: {
  status?: string;
  universityId?: string;
  majorId?: string;
  admissionRoundId?: string;
}) => {
  const params: Record<string, string> = {};

  if (filters?.status && filters.status !== "all") {
    params.status = filters.status;
  }

  if (filters?.universityId && filters.universityId !== "all") {
    params.universityId = filters.universityId;
  }

  if (filters?.majorId && filters.majorId !== "all") {
    params.majorId = filters.majorId;
  }

  if (filters?.admissionRoundId && filters.admissionRoundId !== "all") {
    params.admissionRoundId = filters.admissionRoundId;
  }

  return params;
};

const mergeApplicationRecords = (base?: Application | null, incoming?: Application | null): Application | null => {
  if (!base && !incoming) return null;
  if (!base) return incoming ?? null;
  if (!incoming) return base;

  const mergedScores = Object.keys(incoming.scores ?? {}).length > 0 ? incoming.scores : base.scores;
  const mergedEvidenceFiles = (incoming.evidenceFiles ?? []).length > 0 ? incoming.evidenceFiles : base.evidenceFiles;

  return {
    ...base,
    ...incoming,
    id: incoming.id || base.id,
    applicationCode: incoming.applicationCode || base.applicationCode,
    candidateId: incoming.candidateId || base.candidateId,
    candidateName: incoming.candidateName ?? base.candidateName,
    candidateEmail: incoming.candidateEmail ?? base.candidateEmail,
    candidatePhone: incoming.candidatePhone ?? base.candidatePhone,
    candidateDateOfBirth: incoming.candidateDateOfBirth ?? base.candidateDateOfBirth,
    candidateGender: incoming.candidateGender ?? base.candidateGender,
    candidateCitizenId: incoming.candidateCitizenId ?? base.candidateCitizenId,
    candidateAddress: incoming.candidateAddress ?? base.candidateAddress,
    candidateCity: incoming.candidateCity ?? base.candidateCity,
    candidateHighSchool: incoming.candidateHighSchool ?? base.candidateHighSchool,
    candidateGraduationYear: incoming.candidateGraduationYear ?? base.candidateGraduationYear,
    universityId: incoming.universityId || base.universityId,
    majorId: incoming.majorId || base.majorId,
    subjectGroupCode: incoming.subjectGroupCode || base.subjectGroupCode,
    admissionRoundId: incoming.admissionRoundId ?? base.admissionRoundId,
    priorityGroup: incoming.priorityGroup ?? base.priorityGroup,
    priorityScore: incoming.priorityScore ?? base.priorityScore,
    scores: mergedScores,
    totalScore: incoming.totalScore ?? base.totalScore,
    finalScore: incoming.finalScore ?? base.finalScore,
    evidenceFiles: mergedEvidenceFiles,
    status: incoming.status || base.status,
    candidateNote: incoming.candidateNote ?? base.candidateNote,
    adminNote: incoming.adminNote ?? base.adminNote,
    submittedAt: incoming.submittedAt || base.submittedAt,
    reviewedAt: incoming.reviewedAt ?? base.reviewedAt,
    reviewedBy: incoming.reviewedBy ?? base.reviewedBy,
    createdAt: incoming.createdAt || base.createdAt,
    updatedAt: incoming.updatedAt || base.updatedAt,
  };
};

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  getApplications: (filters?: {
    status?: string;
    universityId?: string;
    majorId?: string;
    admissionRoundId?: string;
  }) => Promise<void>;
  getApplicationsByCandidateId: (candidateId: string) => Promise<Application[]>;
  getApplicationById: (id: string) => Application | undefined;
  fetchApplicationById: (id: string) => Promise<Application | null>;
  createApplication: (app: any) => Promise<Application | null>;
  saveDraftApplication: (app: any) => Promise<Application | null>;
  updateApplication: (id: string, payload: any) => Promise<Application | null>;
  submitDraftApplication: (id: string, payload: any) => Promise<Application | null>;
  deleteApplication: (id: string) => Promise<void>;
  cancelApplication: (id: string) => Promise<void>;
  approveApplication: (id: string, adminId: string, note?: string) => Promise<Application | null>;
  rejectApplication: (id: string, adminId: string, note: string) => Promise<Application | null>;
  getApplicationReviewSummary: (id: string, reviewerCount?: number) => Promise<ApplicationReviewSummary | null>;
  getApplicationReviewLogs: (id: string) => Promise<any[]>;
  submitApplicationReviewScore: (
    id: string,
    payload: ApplicationReviewSubmission,
    reviewerCount?: number
  ) => Promise<ApplicationReviewSummary | null>;
  bulkUpdateApplicationStatus: (ids: string[], status: string, adminId: string, note?: string) => Promise<void>;
  getAdminApplicationsCsv: (filters?: {
    status?: string;
    universityId?: string;
    majorId?: string;
    admissionRoundId?: string;
  }) => Promise<string>;
  getAdminApplicationsExcel: (filters?: {
    status?: string;
    universityId?: string;
    majorId?: string;
    admissionRoundId?: string;
  }) => Promise<ArrayBuffer>;
  getApplicationStats: () => { total: number; draft: number; pending: number; approved: number; rejected: number; cancelled: number };
  getAdminApplicationStatistics: (filters?: {
    universityId?: string;
    majorId?: string;
    admissionRoundId?: string;
  }) => Promise<ApplicationStatisticsResponse>;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: loadCachedApplications(),
  loading: false,

  getApplications: async (filters) => {
    set({ loading: true });
    try {
      const baseParams = buildAdminQueryParams(filters);
      const firstResponse = await axiosClient.get("/applications/admin-list", { params: baseParams });
      const firstPageApplications = extractPagedApplications(firstResponse).map((item: any) => normalizeApplicationRecord(item));

      const fetchedApplications = [...firstPageApplications];
      const nextApplications = fetchedApplications
        .map((item) => mergeApplicationRecords(get().applications.find((existing) => existing.id === item.id), item))
        .filter((item): item is Application => Boolean(item));

      set({ applications: nextApplications });
      saveCachedApplications(nextApplications);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      set({ loading: false });
    }
  },

  getApplicationsByCandidateId: async (candidateId) => {
    try {
      const response = await axiosClient.get(`/applications/candidate/${candidateId}`);
      const fetchedApplications = normalizeApplicationArray(response);
      const localApplications = get().applications;
      return fetchedApplications
        .map((item) => mergeApplicationRecords(localApplications.find((existing) => existing.id === item.id), item))
        .filter((item): item is Application => Boolean(item));
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
        // Replace cached entry with the fresh server response to ensure detail view shows full data
        set((state) => {
          const existingIndex = state.applications.findIndex((item) => item.id === application.id);
          if (existingIndex >= 0) {
            const copy = [...state.applications];
            copy[existingIndex] = application;
            saveCachedApplications(copy);
            return { applications: copy };
          }
            const nextApplications = [application, ...state.applications];
            saveCachedApplications(nextApplications);
            return { applications: nextApplications };
        });
      }

      return application;
    } catch (error) {
      console.error("Failed to fetch application by id:", error);
      return null;
    }
  },

  createApplication: async (app: any) => {
    try {
      const response = await axiosClient.post("/applications", app);
      const createdFromServer = normalizeSingleApplication(response);
      const localApplication = normalizeApplicationRecord({
        ...app,
        id: createdFromServer?.id ?? app.id ?? "",
        applicationCode: app.applicationCode ?? createdFromServer?.applicationCode,
      });
      const created = mergeApplicationRecords(localApplication, createdFromServer);

      if (created) {
        set((state) => {
          const nextApplications = [created, ...state.applications.filter((item) => item.id !== created.id)];
          saveCachedApplications(nextApplications);
          return { applications: nextApplications };
        });
      }

      return created;
    } catch (error) {
      console.error("Failed to create application:", error);
      return null;
    }
  },

  saveDraftApplication: async (app: any) => {
    try {
      const hasId = Boolean(app?.id);
      const response = hasId
        ? await axiosClient.put(`/applications/${app.id}/draft`, app)
        : await axiosClient.post("/applications/draft", app);
      const savedFromServer = normalizeSingleApplication(response);
      const localApplication = normalizeApplicationRecord({
        ...app,
        id: savedFromServer?.id ?? app.id ?? "",
        applicationCode: app.applicationCode ?? savedFromServer?.applicationCode,
      });
      const saved = mergeApplicationRecords(localApplication, savedFromServer);

      if (saved) {
        set((state) => {
          const nextApplications = [saved, ...state.applications.filter((item) => item.id !== saved.id)];
          saveCachedApplications(nextApplications);
          return { applications: nextApplications };
        });
      }

      return saved;
    } catch (error) {
      console.error("Failed to save draft application:", error);
      return null;
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
        set((state) => {
          const nextApplications = state.applications.map((a) =>
            a.id === id ? (mergeApplicationRecords(a, updated) ?? a) : a
          );
          saveCachedApplications(nextApplications);
          return { applications: nextApplications };
        });
      }
      return updated ?? null;
    } catch (error) {
      console.error("Failed to approve application:", error);
      return null;
    }
  },

  cancelApplication: async (id: string) => {
    try {
      await axiosClient.put(`/applications/${id}/cancel`);
      // update local state: remove the cancelled application from list
      set((state) => {
        const nextApplications = state.applications.filter(a => a.id !== id);
        saveCachedApplications(nextApplications);
        return { applications: nextApplications };
      });
    } catch (error) {
      console.error("Failed to cancel application:", error);
    }
  },

  updateApplication: async (id: string, payload: any) => {
    try {
      const response = await axiosClient.put(`/applications/${id}`, payload);
      const updated = normalizeSingleApplication(response);
      if (updated) {
        set((state) => {
          const nextApplications = state.applications.map(a => a.id === id ? (mergeApplicationRecords(a, updated) ?? a) : a);
          saveCachedApplications(nextApplications);
          return { applications: nextApplications };
        });
      }
      return updated;
    } catch (error) {
      console.error("Failed to update application:", error);
      throw error;
    }
  },

  submitDraftApplication: async (id: string, payload: any) => {
    try {
      const response = await axiosClient.put(`/applications/${id}/submit`, payload);
      const updated = normalizeSingleApplication(response);
      if (updated) {
        set((state) => {
          const nextApplications = state.applications.map((item) =>
            item.id === id ? (mergeApplicationRecords(item, updated) ?? item) : item
          );
          saveCachedApplications(nextApplications);
          return { applications: nextApplications };
        });
      }
      return updated;
    } catch (error) {
      console.error("Failed to submit draft application:", error);
      throw error;
    }
  },

  deleteApplication: async (id: string) => {
    try {
      await axiosClient.delete(`/applications/${id}`);
      set((state) => {
        const nextApplications = state.applications.filter(a => a.id !== id);
        saveCachedApplications(nextApplications);
        return { applications: nextApplications };
      });
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
        set((state) => {
          const nextApplications = state.applications.map((a) =>
            a.id === id ? (mergeApplicationRecords(a, updated) ?? a) : a
          );
          saveCachedApplications(nextApplications);
          return { applications: nextApplications };
        });
      }
      return updated ?? null;
    } catch (error) {
      console.error("Failed to reject application:", error);
      return null;
    }
  },

  getApplicationReviewSummary: async (id, reviewerCount = 3) => {
    try {
      const response = await axiosClient.get(`/applications/${id}/review-summary`, {
        params: { reviewerCount },
      });
      return response?.data ?? response ?? null;
    } catch (error) {
      console.error("Failed to fetch application review summary:", error);
      return null;
    }
  },

  getApplicationReviewLogs: async (id) => {
    try {
      const response = await axiosClient.get(`/applications/${id}/logs`);
      const payload = response?.data ?? response ?? null;
      const data = payload?.data ?? payload;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch application review logs:", error);
      return [];
    }
  },

  submitApplicationReviewScore: async (id, payload, reviewerCount = 3) => {
    try {
      const response = await axiosClient.post(`/applications/${id}/review-scores`, payload, {
        params: { reviewerCount },
      });
      const summary = response?.data ?? response ?? null;

      if (summary) {
        set((state) => {
          const nextApplications = state.applications.map((application) =>
            application.id === id
              ? {
                  ...application,
                  reviewScoreAverage: summary.averageReviewScore ?? application.reviewScoreAverage,
                  reviewCount: summary.reviewCount ?? application.reviewCount,
                  reviewedBy: summary.reviewedBy ?? application.reviewedBy,
                  reviewedAt: summary.reviewedAt ?? application.reviewedAt,
                }
              : application
          );
          saveCachedApplications(nextApplications);
          return { applications: nextApplications };
        });
      }

      return summary;
    } catch (error) {
      console.error("Failed to submit application review score:", error);
      throw error;
    }
  },

  bulkUpdateApplicationStatus: async (ids, status, adminId, note) => {
    try {
      await axiosClient.post("/applications/admin-bulk-status", {
        ids,
        status,
        adminId,
        notes: note ?? "",
      });

      set((state) => {
        const nextApplications = state.applications.map((application) =>
          ids.includes(application.id) ? { ...application, status: String(status).toLowerCase() as Application["status"] } : application
        );
        saveCachedApplications(nextApplications);
        return { applications: nextApplications };
      });
    } catch (error) {
      console.error("Failed to bulk update application status:", error);
      throw error;
    }
  },

  getAdminApplicationsCsv: async (filters) => {
    try {
      const params = buildApplicationFilterParams(filters);
      const response = await axiosClient.get("/applications/admin-export-csv", {
        params,
        responseType: "text",
      });

      // axiosClient interceptor unwraps `response.data` and returns the data directly.
      // For CSV we expect a string body, so use the returned value itself.
      return typeof response === "string" ? response : String(response ?? "");
    } catch (error) {
      console.error("Failed to export admin applications CSV:", error);
      throw error;
    }
  },

  getAdminApplicationsExcel: async (filters) => {
    try {
      const params = buildApplicationFilterParams(filters);
      const response = await axiosClient.get("/applications/admin-export-xlsx", {
        params,
        responseType: "arraybuffer",
      });

      return response as unknown as ArrayBuffer;
    } catch (error) {
      console.error("Failed to export admin applications Excel:", error);
      throw error;
    }
  },

  getApplicationStats: () => {
    const apps = get().applications;
    return {
      total: apps.length,
      draft: apps.filter((a) => a.status === "draft").length,
      pending: apps.filter((a) => a.status === "pending").length,
      approved: apps.filter((a) => a.status === "approved").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      cancelled: apps.filter((a) => a.status === "cancelled").length
    };
  },

  getAdminApplicationStatistics: async (filters) => {
    const params = buildApplicationFilterParams(filters);

    try {
      const response = await axiosClient.get("/applications/admin-statistics", { params });
      const payload = response?.data ?? response;
      const stats = payload?.data ?? payload ?? {};

      return normalizeStatisticsResponse(stats);
    } catch (error) {
      console.error("Failed to fetch admin application statistics:", error);
      const apps = get().applications;
      const filteredApps = apps.filter((app) => {
        if (filters?.universityId && filters.universityId !== "all" && app.universityId !== filters.universityId) return false;
        if (filters?.majorId && filters.majorId !== "all" && app.majorId !== filters.majorId) return false;
        if (filters?.admissionRoundId && filters.admissionRoundId !== "all" && app.admissionRoundId !== filters.admissionRoundId) return false;
        return true;
      });

      return {
        total: filteredApps.length,
        draft: filteredApps.filter((a) => a.status === "draft").length,
        pending: filteredApps.filter((a) => a.status === "pending").length,
        approved: filteredApps.filter((a) => a.status === "approved").length,
        rejected: filteredApps.filter((a) => a.status === "rejected").length,
        cancelled: filteredApps.filter((a) => String(a.status).toLowerCase() === "cancelled").length,
        byUniversity: [],
        byMajor: [],
        byAdmissionRound: [],
      };
    }
  }
}));
