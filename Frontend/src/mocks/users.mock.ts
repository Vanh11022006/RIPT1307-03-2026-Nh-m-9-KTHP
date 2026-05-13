import type {  User  } from "../types/auth.types";

export const mockUsers: User[] = [
  {
    id: "user_admin_001",
    fullName: "System Administrator",
    email: "admin@example.com",
    password: "123456",
    phone: "0900000001",
    role: "admin",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  {
    id: "user_candidate_001",
    fullName: "Nguyễn Văn An",
    email: "candidate@example.com",
    password: "123456",
    phone: "0900000002",
    role: "candidate",
    status: "active",
    createdAt: "2026-05-01T08:00:00.000Z",
    updatedAt: "2026-05-01T08:00:00.000Z"
  },
  {
    id: "user_candidate_002",
    fullName: "Trần Thị Bình",
    email: "binh@example.com",
    password: "123456",
    phone: "0900000003",
    role: "candidate",
    status: "active",
    createdAt: "2026-05-02T08:00:00.000Z",
    updatedAt: "2026-05-02T08:00:00.000Z"
  }
];
