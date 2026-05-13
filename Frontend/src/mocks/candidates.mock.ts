import type {  Candidate  } from "../types/candidate.types";

export const mockCandidates: Candidate[] = [
  {
    id: "candidate_001",
    userId: "user_candidate_001",
    fullName: "Nguyễn Văn An",
    dateOfBirth: "2008-01-15T00:00:00.000Z",
    gender: "male",
    citizenId: "001002003004",
    phone: "0900000002",
    email: "candidate@example.com",
    address: "123 Đường Cầu Giấy",
    city: "Hà Nội",
    highSchool: "THPT Chuyên Hà Nội - Amsterdam",
    graduationYear: 2026,
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  {
    id: "candidate_002",
    userId: "user_candidate_002",
    fullName: "Trần Thị Bình",
    dateOfBirth: "2008-05-20T00:00:00.000Z",
    gender: "female",
    citizenId: "001002003005",
    phone: "0900000003",
    email: "binh@example.com",
    address: "456 Đường Lê Lợi",
    city: "Hồ Chí Minh",
    highSchool: "THPT Chuyên Lê Hồng Phong",
    graduationYear: 2026,
    createdAt: "2026-05-02T08:00:00.000Z",
    updatedAt: "2026-05-02T08:00:00.000Z"
  }
];
