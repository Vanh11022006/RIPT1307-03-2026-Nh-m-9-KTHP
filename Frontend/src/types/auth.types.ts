import type {  UserRole, UserStatus  } from "./common.types";

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Tùy chọn vì không phải lúc nào cũng cần để lộ mật khẩu
  phone: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
