import type {  Application  } from "../types/application.types";

export const mockApplications: Application[] = [
  {
    id: "application_001",
    applicationCode: "APP-2026-0001",
    candidateId: "candidate_001", // Nguyễn Văn An
    universityId: "university_002", // Bách khoa HN
    majorId: "major_003", // Khoa học Máy tính
    subjectGroupCode: "A00",
    admissionRoundId: "ar_2",
    priorityGroup: "none",
    priorityScore: 0,
    scores: {
      math: 9.5,
      physics: 9.0,
      chemistry: 9.0
    },
    totalScore: 27.5,
    evidenceFiles: [
      {
        id: "file_001",
        name: "hoc_ba_lop_12.pdf",
        url: "https://example.com/mock_file.pdf",
        type: "pdf",
        category: "transcript",
        size: 1024000, // 1MB
        uploadedAt: "2026-05-03T10:00:00.000Z"
      }
    ],
    status: "pending",
    candidateNote: "Kính mong thầy cô xét duyệt hồ sơ.",
    submittedAt: "2026-05-03T10:00:00.000Z",
    createdAt: "2026-05-03T10:00:00.000Z",
    updatedAt: "2026-05-03T10:00:00.000Z"
  },
  {
    id: "application_002",
    applicationCode: "APP-2026-0002",
    candidateId: "candidate_002", // Trần Thị Bình
    universityId: "university_001", // QGH
    majorId: "major_002", // Quản trị kinh doanh
    subjectGroupCode: "D01",
    priorityGroup: "none",
    priorityScore: 0,
    scores: {
      math: 8.0,
      literature: 8.5,
      english: 9.0
    },
    totalScore: 25.5,
    evidenceFiles: [
      {
        id: "file_002",
        name: "CCCD_mat_truoc.jpg",
        url: "https://example.com/mock_image.jpg",
        type: "image",
        category: "citizenId",
        size: 512000, // 500KB
        uploadedAt: "2026-05-04T09:00:00.000Z"
      }
    ],
    status: "approved",
    candidateNote: "",
    adminNote: "Hồ sơ hợp lệ, đủ điều kiện trúng tuyển.",
    submittedAt: "2026-05-04T09:00:00.000Z",
    reviewedAt: "2026-05-05T08:00:00.000Z",
    reviewedBy: "user_admin_001",
    createdAt: "2026-05-04T09:00:00.000Z",
    updatedAt: "2026-05-05T08:00:00.000Z"
  },
  {
    id: "application_003",
    applicationCode: "APP-2026-0003",
    candidateId: "candidate_001", // Nguyễn Văn An
    universityId: "university_001", // QGH
    majorId: "major_002", // Quản trị kinh doanh
    subjectGroupCode: "A01",
    priorityGroup: "none",
    priorityScore: 0,
    scores: {
      math: 7.0,
      physics: 7.0,
      english: 7.0
    },
    totalScore: 21.0,
    evidenceFiles: [],
    status: "rejected",
    candidateNote: "",
    adminNote: "Tổng điểm xét tuyển chưa đạt mức điểm chuẩn của ngành (23 điểm).",
    submittedAt: "2026-05-02T10:00:00.000Z",
    reviewedAt: "2026-05-04T14:30:00.000Z",
    reviewedBy: "user_admin_001",
    createdAt: "2026-05-02T10:00:00.000Z",
    updatedAt: "2026-05-04T14:30:00.000Z"
  },
  {
    id: "application_004",
    applicationCode: "APP-2026-0004",
    candidateId: "candidate_002", // Trần Thị Bình
    universityId: "university_003", // HCMUS
    majorId: "major_004", // CNTT HCM
    subjectGroupCode: "A00",
    priorityGroup: "none",
    priorityScore: 0,
    scores: {
      math: 8.5,
      physics: 8.0,
      chemistry: 9.0
    },
    totalScore: 25.5,
    evidenceFiles: [],
    status: "pending",
    candidateNote: "Kính mong hội đồng xem xét.",
    submittedAt: "2026-05-05T09:00:00.000Z",
    createdAt: "2026-05-05T09:00:00.000Z",
    updatedAt: "2026-05-05T09:00:00.000Z"
  }
];
