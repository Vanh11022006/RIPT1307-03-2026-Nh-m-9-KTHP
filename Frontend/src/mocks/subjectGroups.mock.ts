import type {  SubjectGroup  } from "../types/application.types";

export const mockSubjectGroups: SubjectGroup[] = [
  {
    code: "A00",
    name: "Toán, Vật lý, Hóa học",
    subjects: ["math", "physics", "chemistry"]
  },
  {
    code: "A01",
    name: "Toán, Vật lý, Tiếng Anh",
    subjects: ["math", "physics", "english"]
  },
  {
    code: "B00",
    name: "Toán, Hóa học, Sinh học",
    subjects: ["math", "chemistry", "biology"]
  },
  {
    code: "C00",
    name: "Ngữ văn, Lịch sử, Địa lý",
    subjects: ["literature", "history", "geography"]
  },
  {
    code: "D01",
    name: "Toán, Ngữ văn, Tiếng Anh",
    subjects: ["math", "literature", "english"]
  }
];
