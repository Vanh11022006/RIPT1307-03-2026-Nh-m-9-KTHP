import type {  UserRole, UserStatus  } from "./common.types";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Optional because we don't always need to expose it
  phone: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
