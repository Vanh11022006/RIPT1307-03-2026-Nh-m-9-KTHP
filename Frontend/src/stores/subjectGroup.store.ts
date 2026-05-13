import { create } from "zustand";
import { mockSubjectGroups } from "../mocks/subjectGroups.mock";

export interface SubjectGroup {
  code: string;
  name: string;
  subjects: string[];
}

interface SubjectGroupState {
  subjectGroups: SubjectGroup[];
  getAllSubjectGroups: () => SubjectGroup[];
  createSubjectGroup: (subjectGroup: SubjectGroup) => void;
  updateSubjectGroup: (code: string, subjectGroup: Partial<SubjectGroup>) => void;
}

export const useSubjectGroupStore = create<SubjectGroupState>((set, get) => ({
  subjectGroups: mockSubjectGroups,
  getAllSubjectGroups: () => get().subjectGroups,
  createSubjectGroup: (subjectGroup) =>
    set((state) => ({
      subjectGroups: [subjectGroup, ...state.subjectGroups],
    })),
  updateSubjectGroup: (code, subjectGroup) =>
    set((state) => ({
      subjectGroups: state.subjectGroups.map((sg) =>
        sg.code === code ? { ...sg, ...subjectGroup } : sg
      ),
    })),
}));
