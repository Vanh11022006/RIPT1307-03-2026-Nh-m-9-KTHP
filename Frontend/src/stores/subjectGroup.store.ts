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
  updateSubjectGroup: (code: string, subjectGroup: Partial<SubjectGroup>) => Promise<void>;
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
              ? group.subjects.split(/[;,\n]/).map((item: string) => item.trim()).filter(Boolean)
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
                ? createdGroup.subjects.split(/[;,\n]/).map((item: string) => item.trim()).filter(Boolean)
                : [],
          }, ...state.subjectGroups],
        }));
      }
    } catch (error) {
      console.error("Failed to create subject group:", error);
    }
  },

  updateSubjectGroup: async (code, subjectGroup) => {
    try {
      const response = await axiosClient.put(`/subject-groups/${code}`, subjectGroup);
      const payload = response?.data ?? response;
      const updatedGroup = payload?.data ?? payload;
      if (updatedGroup) {
        set((state) => ({
          subjectGroups: state.subjectGroups.map((sg) =>
            sg.code === code
              ? {
                  id: updatedGroup?.id,
                  code: updatedGroup?.code,
                  name: updatedGroup?.name ?? "",
                  subjects: Array.isArray(updatedGroup?.subjects)
                    ? updatedGroup.subjects
                    : typeof updatedGroup?.subjects === "string" && updatedGroup.subjects.trim()
                      ? updatedGroup.subjects.split(/[;,\n]/).map((item: string) => item.trim()).filter(Boolean)
                      : [],
                }
              : sg
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to update subject group:", error);
    }
  }
}));
