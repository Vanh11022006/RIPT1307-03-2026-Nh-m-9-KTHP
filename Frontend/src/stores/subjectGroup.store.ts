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

export const useSubjectGroupStore = create<SubjectGroupState>((set, get) => ({
  subjectGroups: [],
  loading: false,

  getAllSubjectGroups: async () => {
    set({ loading: true });
    try {
      const response = await axiosClient.get("/subject-groups");
      if (response && response.data) {
        set({ subjectGroups: response.data });
      }
    } catch (error) {
      console.error("Failed to fetch subject groups:", error);
    } finally {
      set({ loading: false });
    }
  },

  createSubjectGroup: async (subjectGroup) => {
    try {
      const response = await axiosClient.post("/subject-groups", subjectGroup);
      if (response && response.data) {
        set((state) => ({
          subjectGroups: [response.data, ...state.subjectGroups],
        }));
      }
    } catch (error) {
      console.error("Failed to create subject group:", error);
    }
  },

  updateSubjectGroup: async (code, subjectGroup) => {
    try {
      const response = await axiosClient.put(`/subject-groups/${code}`, subjectGroup);
      if (response && response.data) {
        set((state) => ({
          subjectGroups: state.subjectGroups.map((sg) =>
            sg.code === code ? response.data : sg
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to update subject group:", error);
    }
  }
}));
