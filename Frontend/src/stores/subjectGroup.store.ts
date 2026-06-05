import { create } from "zustand";
import axiosClient from "../api/axiosClient";

export interface SubjectGroup {
  id?: string | number;
  code?: string;
  name: string;
  subjects: string[];
}

interface SubjectGroupState {
  subjectGroups: SubjectGroup[];
  loading: boolean;
  getAllSubjectGroups: () => Promise<void>;
  createSubjectGroup: (subjectGroup: SubjectGroup) => Promise<void>;
  updateSubjectGroup: (id: string | number, subjectGroup: Partial<SubjectGroup>) => Promise<void>;
}

export const useSubjectGroupStore = create<SubjectGroupState>((set) => ({
  subjectGroups: [],
  loading: false,

  getAllSubjectGroups: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/subject-groups");
      const payload = response?.data ?? response;
      const groups = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      set({
        subjectGroups: groups.map((group: any) => ({
          id: group?.id,
          code: group?.code,
          name: group?.name ?? "",
          subjects: Array.isArray(group?.subjects)
            ? group.subjects
            : typeof group?.subjects === "string" && group.subjects.trim()
              ? (() => {
                  const raw = group.subjects.trim();
                  // Thử phân tích mảng dưới dạng JSON trước (ví dụ: "[\"math\",\"physics\"]")
                  if (raw.startsWith("[") && raw.endsWith("]")) {
                    try {
                      const parsed = JSON.parse(raw);
                      if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean);
                    } catch (e) {
                      // Dự phòng: tách chuỗi theo các ký tự phân tách
                    }
                  }
                  return raw.split(/[;,\n]/).map((item: string) => item.trim()).filter(Boolean);
                })()
              : [],
        }))
      });
    } catch (error) {
      console.error("Failed to fetch subject groups:", error);
    } finally {
      set({ loading: false });
    }
  },

  createSubjectGroup: async (subjectGroup) => {
    try {
      const response = await axiosClient.post("/subject-groups", subjectGroup);
      const payload = response?.data ?? response;
      const createdGroup = payload?.data ?? payload;
      if (createdGroup) {
        set((state) => ({
          subjectGroups: [{
            id: createdGroup?.id,
            code: createdGroup?.code,
            name: createdGroup?.name ?? "",
            subjects: Array.isArray(createdGroup?.subjects)
                ? createdGroup.subjects
                : typeof createdGroup?.subjects === "string" && createdGroup.subjects.trim()
                  ? (() => {
                      const raw = createdGroup.subjects.trim();
                      if (raw.startsWith("[") && raw.endsWith("]")) {
                        try {
                          const parsed = JSON.parse(raw);
                          if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean);
                        } catch (e) {}
                      }
                      return raw.split(/[;,\n]/).map((item: string) => item.trim()).filter(Boolean);
                    })()
                  : [],
          }, ...state.subjectGroups],
        }));
      }
    } catch (error) {
      console.error("Failed to create subject group:", error);
    }
  },

  updateSubjectGroup: async (id, subjectGroup) => {
    try {
      const response = await axiosClient.put(`/subject-groups/${id}`, subjectGroup);
      const payload = response?.data ?? response;
      const updatedGroup = payload?.data ?? payload;
      if (updatedGroup) {
        set((state) => ({
          subjectGroups: state.subjectGroups.map((sg) =>
            String(sg.id) === String(id) || sg.code === updatedGroup?.code
              ? {
                  id: updatedGroup?.id,
                  code: updatedGroup?.code,
                  name: updatedGroup?.name ?? "",
                  subjects: Array.isArray(updatedGroup?.subjects)
                    ? updatedGroup.subjects
                    : typeof updatedGroup?.subjects === "string" && updatedGroup.subjects.trim()
                      ? (() => {
                          const raw = updatedGroup.subjects.trim();
                          if (raw.startsWith("[") && raw.endsWith("]")) {
                            try {
                              const parsed = JSON.parse(raw);
                              if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean);
                            } catch (e) {}
                          }
                          return raw.split(/[;,\n]/).map((item: string) => item.trim()).filter(Boolean);
                        })()
                      : [],
                }
              : sg
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to update subject group:", error);
      throw error;
    }
  }
}));
