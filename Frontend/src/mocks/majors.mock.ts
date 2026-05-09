import type {  Major  } from "../types/major.types";

export const mockMajors: Major[] = [
  // Đại học Quốc gia Hà Nội (university_001)
  {
    id: "major_001",
    universityId: "university_001",
    code: "7480201",
    name: "Công nghệ thông tin",
    admissionQuota: 500,
    subjectGroupCodes: ["A00", "A01", "D01"],
    minScore: 24,
    tuitionFeePerYear: 35000000,
    description: "Ngành CNTT chuẩn bị sinh viên cho các công việc liên quan đến phần mềm và hệ thống.",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  {
    id: "major_002",
    universityId: "university_001",
    code: "7340101",
    name: "Quản trị kinh doanh",
    admissionQuota: 300,
    subjectGroupCodes: ["A00", "A01", "D01"],
    minScore: 23,
    tuitionFeePerYear: 30000000,
    description: "Đào tạo nhân sự cấp quản lý cho các doanh nghiệp.",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  // Đại học Bách khoa Hà Nội (university_002)
  {
    id: "major_003",
    universityId: "university_002",
    code: "IT1",
    name: "Khoa học Máy tính",
    admissionQuota: 600,
    subjectGroupCodes: ["A00", "A01"],
    minScore: 27,
    tuitionFeePerYear: 40000000,
    description: "Chương trình đào tạo Khoa học Máy tính chuẩn quốc tế.",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  // HCMUS (university_003)
  {
    id: "major_004",
    universityId: "university_003",
    code: "7480201_HCM",
    name: "Công nghệ thông tin",
    admissionQuota: 800,
    subjectGroupCodes: ["A00", "A01", "D01"],
    minScore: 25,
    tuitionFeePerYear: 32000000,
    description: "Chương trình đào tạo CNTT hàng đầu phía Nam.",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  }
];
